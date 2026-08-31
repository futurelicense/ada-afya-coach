// LLM client — Groq (OpenAI-compatible API) + Hugging Face vision fallback.
// All keys live in Supabase secrets; nothing is ever sent to the browser.
//   supabase secrets set GROQ_API_KEY=gsk_...
//   supabase secrets set HF_API_TOKEN=hf_...            (used only as a scan-food vision fallback)
//   supabase secrets set GROQ_MODEL=llama-3.3-70b-versatile           (optional override)
//   supabase secrets set GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct  (optional override)

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const TEXT_MODEL   = Deno.env.get('GROQ_MODEL')        ?? 'llama-3.3-70b-versatile'
export const VISION_MODEL = Deno.env.get('GROQ_VISION_MODEL')  ?? 'meta-llama/llama-4-scout-17b-16e-instruct'

function groqKey(): string {
  const key = Deno.env.get('GROQ_API_KEY')
  if (!key) throw Object.assign(new Error('GROQ_API_KEY is not configured'), { status: 500 })
  return key
}

export interface ChatMessage {
  role:     'system' | 'user' | 'assistant' | 'tool'
  content:  unknown
  tool_call_id?: string
}

export interface GroqTool {
  type: 'function'
  function: {
    name:        string
    description: string
    parameters:  Record<string, unknown>
  }
}

interface GroqOpts {
  messages:      ChatMessage[]
  model?:        string
  maxTokens?:    number
  temperature?:  number
  tools?:        GroqTool[]
  toolName?:     string        // force this tool
  jsonObject?:   boolean       // force response_format json_object
}

async function callGroq(opts: GroqOpts): Promise<any> {
  const body: Record<string, unknown> = {
    model:       opts.model ?? TEXT_MODEL,
    messages:    opts.messages,
    max_tokens:  opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.6,
  }
  if (opts.tools?.length) {
    body.tools = opts.tools
    body.tool_choice = opts.toolName
      ? { type: 'function', function: { name: opts.toolName } }
      : 'auto'
  } else if (opts.jsonObject) {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch(GROQ_URL, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${groqKey()}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw Object.assign(new Error(`Groq API error ${res.status}: ${text}`), { status: res.status === 429 ? 429 : 502 })
  }
  return res.json()
}

/** Plain text completion. Returns the assistant message string. */
export async function llmText(opts: Omit<GroqOpts, 'tools' | 'toolName'>): Promise<string> {
  const json = await callGroq(opts)
  return json.choices?.[0]?.message?.content?.trim() ?? ''
}

/**
 * Structured extraction. Forces `toolName` and returns its parsed arguments object.
 * Falls back to parsing the message content as JSON if the model answers without a tool call.
 */
export async function llmStructured<T = Record<string, unknown>>(
  opts: GroqOpts & { tools: GroqTool[]; toolName: string },
): Promise<T> {
  const json = await callGroq(opts)
  const msg = json.choices?.[0]?.message
  const call = msg?.tool_calls?.find((c: any) => c.function?.name === opts.toolName) ?? msg?.tool_calls?.[0]

  const rawArgs = call?.function?.arguments ?? msg?.content ?? ''
  const match = typeof rawArgs === 'string' ? rawArgs.match(/\{[\s\S]*\}/) : null
  if (!match) throw Object.assign(new Error('Model did not return structured output'), { status: 502 })

  try {
    return JSON.parse(match[0]) as T
  } catch {
    throw Object.assign(new Error('Model returned malformed JSON'), { status: 502 })
  }
}

/**
 * Streaming chat. Returns a ReadableStream of raw UTF-8 text tokens.
 * `onDone` receives the fully-accumulated response once the stream closes.
 */
export function llmStream(
  opts: Omit<GroqOpts, 'tools' | 'toolName' | 'jsonObject'>,
  onDone?: (full: string) => Promise<void> | void,
): ReadableStream<Uint8Array> {
  const enc = new TextEncoder()
  const dec = new TextDecoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = ''
      try {
        const res = await fetch(GROQ_URL, {
          method:  'POST',
          headers: { 'Authorization': `Bearer ${groqKey()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model:       opts.model ?? TEXT_MODEL,
            messages:    opts.messages,
            max_tokens:  opts.maxTokens ?? 1024,
            temperature: opts.temperature ?? 0.6,
            stream:      true,
          }),
        })

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => '')
          throw new Error(`Groq stream error ${res.status}: ${text}`)
        }

        const reader = res.body.getReader()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += dec.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const payload = trimmed.slice(5).trim()
            if (payload === '[DONE]') continue
            try {
              const token = JSON.parse(payload).choices?.[0]?.delta?.content
              if (token) {
                full += token
                controller.enqueue(enc.encode(token))
              }
            } catch { /* skip keep-alive / partial frames */ }
          }
        }
      } catch (err) {
        if (!full) controller.enqueue(enc.encode(`\n[error] ${(err as Error).message}`))
      } finally {
        if (onDone && full.trim()) await onDone(full)
        controller.close()
      }
    },
  })
}

/**
 * Vision: identify content of a base64 image. Tries Groq's multimodal model first,
 * falls back to a Hugging Face image-to-text model if Groq vision fails.
 * Returns the raw model text (caller parses).
 */
export async function llmVision(params: {
  imageBase64: string
  mediaType:   string
  prompt:      string
  maxTokens?:  number
}): Promise<string> {
  const dataUri = `data:${params.mediaType};base64,${params.imageBase64}`

  try {
    const json = await callGroq({
      model:     VISION_MODEL,
      maxTokens: params.maxTokens ?? 1024,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: params.prompt },
          { type: 'image_url', image_url: { url: dataUri } },
        ],
      }],
    })
    const text = json.choices?.[0]?.message?.content?.trim()
    if (text) return text
    throw new Error('Groq vision returned empty response')
  } catch (groqErr) {
    const hfToken = Deno.env.get('HF_API_TOKEN')
    if (!hfToken) throw groqErr

    // HF fallback — caption the image, then let the text model turn it into structured data.
    const hfModel = Deno.env.get('HF_VISION_MODEL') ?? 'Salesforce/blip-image-captioning-large'
    const bytes = Uint8Array.from(atob(params.imageBase64), (c) => c.charCodeAt(0))
    const hfRes = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${hfToken}`, 'Content-Type': params.mediaType },
      body:    bytes,
    })
    if (!hfRes.ok) throw Object.assign(new Error(`HF vision fallback failed ${hfRes.status}`), { status: 502 })
    const hfJson = await hfRes.json()
    const caption = Array.isArray(hfJson) ? hfJson[0]?.generated_text : hfJson?.generated_text
    if (!caption) throw Object.assign(new Error('HF vision fallback returned no caption'), { status: 502 })

    return await llmText({
      maxTokens: params.maxTokens ?? 1024,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'You convert a photo caption into the exact JSON the user asks for. Use realistic Nigerian-food nutrition estimates.' },
        { role: 'user', content: `Photo caption: "${caption}"\n\n${params.prompt}` },
      ],
    })
  }
}
