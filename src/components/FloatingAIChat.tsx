import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Send, X, Bot, User, Minimize2 } from 'lucide-react'
import { useUserData } from '@/hooks/useUserData'
import { useAuth } from '@/contexts/AuthContext'
import { aiService } from '@/lib/aiService'
import { userDataService } from '@/lib/userDataService'
import { cn } from '@/lib/utils'

interface Message {
  id:        string
  role:      'user' | 'assistant'
  content:   string
  timestamp: Date
}

const quickReplies = [
  '💪 Need workout tips',
  '🍽️ Nutrition advice',
  '📊 Check my progress',
  '🔥 Motivate me!',
]

export function FloatingAIChat() {
  const [isOpen,          setIsOpen]          = useState(false)
  const [isMinimized,     setIsMinimized]     = useState(false)
  const [messages,        setMessages]        = useState<Message[]>([{
    id:        '1',
    role:      'assistant',
    content:   "Hey! 👋 I'm Ada, your AI fitness coach. How can I help you today?",
    timestamp: new Date(),
  }])
  const [input,           setInput]           = useState('')
  const [isStreaming,     setIsStreaming]      = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)
  const { todayWorkouts, todayMeals, todayStats, weeklyStats } = useUserData()
  const { session } = useAuth()

  // Stable session ID per chat window — groups messages in the DB
  const sessionId = useMemo(() => crypto.randomUUID(), [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(messageText?: string) {
    const text = (messageText ?? input).trim()
    if (!text || isStreaming) return

    setMessages(prev => [...prev, {
      id:        Date.now().toString(),
      role:      'user',
      content:   text,
      timestamp: new Date(),
    }])
    setInput('')
    setIsStreaming(true)
    setShowQuickReplies(false)

    // If no Supabase session, fall back to a polite nudge
    if (!session) {
      await new Promise(r => setTimeout(r, 600))
      setMessages(prev => [...prev, {
        id:        (Date.now() + 1).toString(),
        role:      'assistant',
        content:   "Sign in to unlock the full Coach Ada experience with personalised, AI-powered coaching! 🔐",
        timestamp: new Date(),
      }])
      setIsStreaming(false)
      return
    }

    // Gather context from Supabase-backed data service
    const streak = await userDataService.getCurrentStreak()

    try {
      const response = await aiService.streamChat({
        message: text,
        sessionId,
        context: {
          todayStats,
          weeklyStats,
          streak,
        },
      })

      if (response.status === 429) {
        setMessages(prev => [...prev, {
          id:        (Date.now() + 1).toString(),
          role:      'assistant',
          content:   "You've reached today's chat limit on your plan. Pro allows 50 requests per feature per day; Elite is unlimited.",
          timestamp: new Date(),
        }])
        setIsStreaming(false)
        return
      }

      if (!response.ok || !response.body) {
        throw new Error('Stream unavailable')
      }

      // Add an empty Ada message that will be filled as tokens arrive
      const adaId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, {
        id:        adaId,
        role:      'assistant',
        content:   '',
        timestamp: new Date(),
      }])

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m =>
          m.id === adaId ? { ...m, content: m.content + chunk } : m
        ))
      }

    } catch {
      setMessages(prev => [...prev, {
        id:        (Date.now() + 1).toString(),
        role:      'assistant',
        content:   "I'm having a bit of trouble connecting right now. Try again in a moment! 🙏",
        timestamp: new Date(),
      }])
    } finally {
      setIsStreaming(false)
    }
  }

  if (!session) return null

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed z-50 w-14 h-14 rounded-full shadow-premium p-0',
            'bg-gradient-to-br from-primary to-secondary',
            'hover:scale-110 transition-all duration-300 animate-scale-in',
            'bottom-20 md:bottom-6 right-6'
          )}
          aria-label="Open AI Chat"
        >
          <Sparkles className="h-6 w-6 text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={cn(
          'fixed z-50 flex flex-col transition-all duration-300',
          'bottom-20 md:bottom-6 right-6',
          'w-[calc(100vw-3rem)] md:w-96',
          isMinimized ? 'h-14' : 'h-[600px] max-h-[calc(100vh-10rem)]',
          'glass shadow-premium rounded-2xl border border-border/50 overflow-hidden animate-scale-in'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Coach Ada</h3>
                <p className="text-xs text-muted-foreground">
                  {session ? 'AI-powered • Always here' : 'Sign in for full AI access'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(v => !v)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={cn('flex gap-2 animate-fade-in', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2 shadow-card',
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                          : 'glass'
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={cn('text-xs mt-1', msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="h-4 w-4 text-secondary" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Streaming indicator — only shows while no content yet */}
                  {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-2 justify-start animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="glass rounded-2xl px-4 py-3 shadow-card">
                        <div className="flex gap-1">
                          {[0, 150, 300].map(delay => (
                            <div key={delay} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Quick replies */}
              {showQuickReplies && messages.length <= 1 && (
                <div className="px-4 pb-2 flex-shrink-0">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map(r => (
                      <Badge
                        key={r}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-all text-xs px-3 py-1"
                        onClick={() => handleSend(r)}
                      >
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-border/50 bg-card/50 flex-shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Ask Ada anything..."
                    className="resize-none min-h-[44px] max-h-[100px]"
                    rows={1}
                    disabled={isStreaming}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isStreaming}
                      size="icon"
                      className="h-10 w-10 shrink-0 shadow-glow"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
