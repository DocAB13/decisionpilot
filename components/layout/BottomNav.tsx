import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import styles from './BottomNav.module.css'

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="12 8 12 12 14 14" />
      <path d="M3.05 11a9 9 0 1 0 .5-3" />
      <polyline points="3 4 3 11 10 11" />
    </svg>
  )
}

export function BottomNav() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Not shown for anonymous users — H08 §3
  if (!loading && !user) return null

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">

      <Link
        href="/dashboard"
        className={[styles.item, router.pathname === '/dashboard' ? styles.active : ''].filter(Boolean).join(' ')}
        aria-label="Home"
        aria-current={router.pathname === '/dashboard' ? 'page' : undefined}
      >
        <HomeIcon />
        <span className={styles.label}>Home</span>
      </Link>

      <Link
        href="/decision/new"
        className={[styles.item, styles.newDecision].join(' ')}
        aria-label="New Decision"
      >
        <span className={styles.newDecisionButton}>
          <PlusIcon />
        </span>
        <span className={styles.label}>New Decision</span>
      </Link>

      <Link
        href="/history"
        className={[styles.item, router.pathname === '/history' ? styles.active : ''].filter(Boolean).join(' ')}
        aria-label="History"
        aria-current={router.pathname === '/history' ? 'page' : undefined}
      >
        <HistoryIcon />
        <span className={styles.label}>History</span>
      </Link>

    </nav>
  )
}
