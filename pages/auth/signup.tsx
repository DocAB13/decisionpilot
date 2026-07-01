import { useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import styles from './Auth.module.css'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    // Transfer anonymous Decision token to cookie before auth (H13 §2.1)
    const anonToken = localStorage.getItem('anon_decision_token')
    if (anonToken) {
      document.cookie = `anon_decision_token=${anonToken}; Path=/; Max-Age=${60 * 60 * 48}`
    }

    const returnTo = (router.query.return as string) || '/dashboard'
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?return=${encodeURIComponent(returnTo)}`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email to confirm your account.')
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Create your account</h1>

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
            label={
              <>
                Password <span className={styles.hint}>(min. 6 characters)</span>
              </>
            }
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && <p className={[styles.message, styles.error].join(' ')}>{error}</p>}
        {message && <p className={[styles.message, styles.success].join(' ')}>{message}</p>}

        <div className={styles.field}>
          <Button variant="primary" size="lg" loading={loading} onClick={handleSignUp} style={{ width: '100%' }}>
            Sign up
          </Button>
        </div>

        <p className={styles.footer}>
          Already have an account? <a href="/auth/login">Sign in</a>
        </p>
      </div>
    </div>
  )
}
