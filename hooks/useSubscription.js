import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '../context/AuthContext'

export function useSubscription() {
  const { user } = useAuth()
  const [plan, setPlan] = useState('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPlan('free')
      setLoading(false)
      return
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setPlan(data?.plan || 'free')
        setLoading(false)
      })
  }, [user])

  return { plan, loading }
}