import { useEffect, useState } from 'react'
import type { JSX } from 'react'

import type { DecisionCategory } from '@/core/decision/Decision.constants'

import styles from './AnalysisLoading.module.css'

interface Props {
  category: DecisionCategory
  title: string | null
}

// H08 §16 — rotates every 4-6 seconds
const MESSAGES = [
  'Reading your context...',
  'Evaluating your alternatives...',
  'Assessing risks for each option...',
  'Building your recommendation...',
] as const

const ROTATE_INTERVAL_MS = 5000

function formatCategoryLabel(category: DecisionCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export function AnalysisLoading({ category, title }: Props): JSX.Element {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.container}>
      <p className={styles.categoryLabel}>{formatCategoryLabel(category)}</p>
      <h1 className={styles.title}>{title ?? 'Untitled Decision'}</h1>

      <div className={styles.center}>
        <p className={styles.message} aria-live="polite">
          {MESSAGES[messageIndex]}
        </p>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} />
        </div>
      </div>

      <p className={styles.footer}>This usually takes 10–20 seconds. Your inputs are saved.</p>
    </div>
  )
}
