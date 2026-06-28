import { useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@/lib/supabase/client'

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
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: 'var(--space-8)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text-primary)',
          marginTop: 0,
          marginBottom: 'var(--space-6)',
        }}>
          Sign in to DecisionOS
        </h1>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="email" style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              height: 44,
              padding: '0 var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="password" style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              height: 44,
              padding: '0 var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-danger)',
            marginBottom: 'var(--space-4)',
            marginTop: 0,
          }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            display: 'block',
            width: '100%',
            height: 48,
            background: loading ? 'var(--color-border)' : 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 'var(--space-4)',
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          margin: 0,
        }}>
          Don&apos;t have an account?{' '}
          <a href="/auth/signup" style={{ color: 'var(--color-accent)', fontWeight: 'var(--font-medium)' }}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
