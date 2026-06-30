import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import styles from './TopNav.module.css'

interface TopNavProps {
  /** Shown centered on Decision-level pages; omit on all other pages. */
  decisionTitle?: string
}

export function TopNav({ decisionTitle }: TopNavProps) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { plan } = useSubscription()

  const isAuthenticated = !loading && !!user
  const isAnonymous = !loading && !user

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.inner}>

        {/* Left — wordmark */}
        <Link
          href={isAuthenticated ? '/dashboard' : '/'}
          className={styles.wordmark}
          aria-label="DecisionOS — go to home"
        >
          DecisionOS
        </Link>

        {/* Center — decision title on Decision-level pages (H09 §3) */}
        <span className={styles.center}>
          {decisionTitle ?? ''}
        </span>

        {/* Right — auth-dependent actions; hidden on mobile (H08 §3) */}
        <div className={styles.actions}>
          {isAuthenticated && (
            <>
              {(plan === 'pro' || plan === 'premium') && (
                <span
                  className={[
                    styles.planBadge,
                    plan === 'premium' ? styles.planBadgePremium : styles.planBadgePro,
                  ].join(' ')}
                  aria-label={`${plan} plan`}
                >
                  {plan.toUpperCase()}
                </span>
              )}
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/decision/new')}
              >
                New Decision
              </Button>
            </>
          )}

          {isAnonymous && (
            <>
              <Button
                variant="ghost"
                size="md"
                onClick={() => router.push('/auth/login')}
              >
                Sign in
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/decision/new')}
              >
                Get started
              </Button>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}
