import { useRouter } from 'next/router'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

import styles from './success.module.css'

export default function Success() {
  const router = useRouter()
  const { session_id: sessionId, return: returnPath } = router.query

  // Default per H13 §4.1: return_path defaults to /dashboard.
  const destination = typeof returnPath === 'string' && returnPath ? returnPath : '/dashboard'

  return (
    <div className={styles.page}>
      <Card className={styles.card} elevated>
        <p className={styles.icon} aria-hidden="true">
          ✓
        </p>
        <h1 className={styles.heading}>You&apos;re all set</h1>
        <p className={styles.body}>
          {sessionId
            ? 'Your payment has been confirmed and your plan is now active.'
            : 'Your plan is now active.'}{' '}
          It may take a moment to reflect everywhere.
        </p>
        <Button variant="primary" size="lg" onClick={() => router.push(destination)} style={{ width: '100%' }}>
          Go to Dashboard
        </Button>
      </Card>
    </div>
  )
}
