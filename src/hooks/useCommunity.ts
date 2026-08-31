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

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase.from('leaderboard').select('*').limit(20)
    if (data) setLeaderboard(data)
  }, [])

  const fetchChallenges = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('is_active', true)
      .gt('ends_at', new Date().toISOString())
      .order('ends_at', { ascending: true })

    if (!data) return

    if (user) {
      const { data: joined } = await supabase
        .from('challenge_participants')
        .select('challenge_id, current_value')
        .eq('user_id', user.id)

      const joinedMap = new Map((joined ?? []).map(j => [j.challenge_id, j.current_value]))
      setChallenges(data.map(c => ({
        ...c,
        joined:        joinedMap.has(c.id),
        current_value: joinedMap.get(c.id),
      })))
    } else {
      setChallenges(data)
    }
  }, [])

  const fetchActivityFeed = useCallback(async () => {
    const { data } = await supabase
      .from('activity_feed')
      .select('id, username, action_type, action_description, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setActivityFeed(data)
  }, [])

  useEffect(() => {
    Promise.all([fetchLeaderboard(), fetchChallenges(), fetchActivityFeed()])
      .finally(() => setLoading(false))

    // Live leaderboard and activity feed updates via Realtime
    const feedChannel = supabase
      .channel('community_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        payload => setActivityFeed(prev => [payload.new as ActivityItem, ...prev].slice(0, 20)),
      )
      .subscribe()

    return () => { supabase.removeChannel(feedChannel) }
  }, [fetchLeaderboard, fetchChallenges, fetchActivityFeed])

  async function joinChallenge(challengeId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from('challenge_participants').insert({
      challenge_id: challengeId,
      user_id:      user.id,
    })
    if (error) return false

    await supabase.rpc('increment_challenge_participants', { p_challenge_id: challengeId })

    setChallenges(prev =>
      prev.map(c => c.id === challengeId ? { ...c, joined: true, current_value: 0, participant_count: c.participant_count + 1 } : c)
    )
    return true
  }

  return { leaderboard, challenges, activityFeed, loading, joinChallenge, refresh: fetchLeaderboard }
}
