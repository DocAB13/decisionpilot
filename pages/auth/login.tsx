import { useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import styles from './Auth.module.css'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    // Transfer anonymous Decision token to cookie before auth (H13 §2.1)
    const anonToken = localStorage.getItem('anon_decision_token')
    if (anonToken) {
      document.cookie = `anon_decision_token=${anonToken}; Path=/; Max-Age=${60 * 60 * 48}`
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      const returnTo = (router.query.return as string) || '/dashboard'
      router.push(returnTo)
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Sign in to DecisionOS</h1>

        <div className={styles.field}>
          <Input
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && <p className={[styles.message, styles.error].join(' ')}>{error}</p>}

        <div className={styles.field}>
          <Button variant="primary" size="lg" loading={loading} onClick={handleLogin} style={{ width: '100%' }}>
            Sign in
          </Button>
        </div>

        <p className={styles.footer}>
          Don&apos;t have an account? <a href="/auth/signup">Sign up</a>
        </p>
      </div>
    </div>
  )
}
