import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface LeaderboardEntry {
  rank:           number
  name:           string
  points:         number
  level:          number
  streak:         number
  longest_streak: number
  total_workouts: number
  total_calories: number
}

export interface Challenge {
  id:                 string
  title:              string
  description:        string
  type:               string
  target_value:       number
  target_unit:        string
  reward_description: string
  reward_points:      number
  badge_name:         string
  ends_at:            string
  participant_count:  number
  joined?:            boolean
  current_value?:     number
  completed_at?:      string | null
}

export interface ActivityItem {
  id:                 string
  username:           string
  action_type:        string
  action_description: string
  created_at:         string
}

export function useCommunity() {
  const [leaderboard,  setLeaderboard]  = useState<LeaderboardEntry[]>([])
  const [challenges,   setChallenges]   = useState<Challenge[]>([])
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [joiningChallengeId, setJoiningChallengeId] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    const { data, error: queryError } = await supabase.from('leaderboard').select('*').limit(20)
    if (queryError) throw queryError
    setLeaderboard(data ?? [])
  }, [])

  const fetchChallenges = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: challengeError } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', new Date().toISOString())
      .gt('ends_at', new Date().toISOString())
      .order('ends_at', { ascending: true })

    if (challengeError) throw challengeError

    if (user) {
      const { data: joined, error: joinedError } = await supabase
        .from('challenge_participants')
        .select('challenge_id, current_value, completed_at')
        .eq('user_id', user.id)

      if (joinedError) throw joinedError

      const joinedMap = new Map((joined ?? []).map(j => [j.challenge_id, j]))
      setChallenges((data ?? []).map(c => ({
        ...c,
        joined:        joinedMap.has(c.id),
        current_value: joinedMap.get(c.id)?.current_value,
        completed_at:  joinedMap.get(c.id)?.completed_at,
      })))
    } else {
      setChallenges(data ?? [])
    }
  }, [])

  const fetchActivityFeed = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from('activity_feed')
      .select('id, username, action_type, action_description, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
    if (queryError) throw queryError
    setActivityFeed(data ?? [])
  }, [])

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    setError(null)

    try {
      await Promise.all([fetchLeaderboard(), fetchChallenges(), fetchActivityFeed()])
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Could not load community data.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [fetchLeaderboard, fetchChallenges, fetchActivityFeed])

  useEffect(() => {
    void refresh(true)

    // Server-side automation publishes feed, progress, and participant counts.
    const feedChannel = supabase
      .channel('community_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        payload => {
          const item = payload.new as ActivityItem
          setActivityFeed(prev => [item, ...prev.filter(existing => existing.id !== item.id)].slice(0, 20))
          void fetchLeaderboard().catch(() => setError('Could not refresh the leaderboard.'))
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenge_participants' },
        () => { void fetchChallenges().catch(() => setError('Could not refresh challenge progress.')) },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_challenges' },
        () => { void fetchChallenges().catch(() => setError('Could not refresh challenge totals.')) },
      )
      .subscribe()

    return () => { supabase.removeChannel(feedChannel) }
  }, [fetchChallenges, fetchLeaderboard, refresh])

  async function joinChallenge(challengeId: string): Promise<{ ok: boolean; message?: string }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: 'Sign in to join community challenges.' }

    setJoiningChallengeId(challengeId)
    try {
      const { error: joinError } = await supabase.rpc('join_community_challenge', {
        p_challenge_id: challengeId,
      })

      if (joinError) return { ok: false, message: joinError.message }

      await Promise.all([fetchChallenges(), fetchActivityFeed()])
      return { ok: true }
    } catch (joinError) {
      return {
        ok: false,
        message: joinError instanceof Error ? joinError.message : 'Could not join this challenge.',
      }
    } finally {
      setJoiningChallengeId(null)
    }
  }

  return {
    leaderboard,
    challenges,
    activityFeed,
    loading,
    error,
    joiningChallengeId,
    joinChallenge,
    refresh: () => refresh(true),
  }
}
