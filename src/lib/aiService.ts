// AI service — thin HTTP client that calls Supabase Edge Functions.
// All Claude API calls happen server-side; no API key is ever sent to the browser.
import { supabase } from './supabase'

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

async function callFunction<T>(name: string, body: object): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let message = `AI request failed (${res.status})`
    try { message = (await res.json()).error ?? message } catch { /* ignore */ }
    const err = new Error(message)
    Object.assign(err, { status: res.status })
    throw err
  }

  return res.json() as Promise<T>
}

export const aiService = {
  /**
   * Generate a personalised workout plan.
   * Returns a WorkoutSession-shaped object ready to save via userDataService.
   */
  generateWorkoutPlan(options: {
    targetMuscles?: string[]
    equipment?:     string
    durationMinutes?: number
  } = {}) {
    return callFunction<any>('generate-workout', options)
  },

  /**
   * Generate a day's Nigerian meal plan.
   * Returns { meals, totalCalories, macroSummary, shoppingList, hydrationTip, ... }
   */
  generateMealPlan(options: {
    calorieTarget?:  number
    dietPreference?: string
    healthNotes?:    string
  } = {}) {
    return callFunction<any>('generate-meal-plan', options)
  },

  /**
   * Analyse the user's weekly fitness data and return insights.
   * Returns { summary, strengths, areas_to_improve, recommendations, weekly_score, next_week_focus }
   */
  analyzeProgress(weeklyData: any[], todayStats: any) {
    return callFunction<any>('analyze-progress', { weeklyData, todayStats })
  },

  /**
   * Chat with Ada — returns a raw `Response` for streaming.
   * The caller is responsible for reading the stream.
   */
  async streamChat(params: {
    message:   string
    sessionId: string
    context:   {
      todayStats?:  any
      weeklyStats?: any[]
      streak?:      number
    }
  }): Promise<Response> {
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch(`${FUNCTIONS_URL}/chat-ada`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(params),
    })

    return res   // caller reads the ReadableStream
  },
}
