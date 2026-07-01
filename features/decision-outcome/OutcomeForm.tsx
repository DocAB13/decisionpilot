import { useState } from 'react'
import type { JSX } from 'react'

import { Button } from '@/components/ui/Button'
import { useDecision } from '@/hooks/useDecision'
import type { OutcomeContent } from '@/core/decision/Decision.types'

import inputStyles from '@/components/ui/Input.module.css'
import styles from './OutcomeForm.module.css'

interface Props {
  onCancel: () => void
  onRecorded: () => void
}

type GoalAchievement = OutcomeContent['goal_achievement']

const GOAL_ACHIEVEMENT_OPTIONS: Array<{ value: GoalAchievement; label: string }> = [
  { value: 'yes', label: 'Yes' },
  { value: 'partially', label: 'Partially' },
  { value: 'no', label: 'No' },
]

const SATISFACTION_RATINGS = [1, 2, 3, 4, 5] as const

// FR-10.2: all three fields are required.
export function OutcomeForm({ onCancel, onRecorded }: Props): JSX.Element {
  const { updateComponent, advanceState } = useDecision()

  const [description, setDescription] = useState('')
  const [goalAchievement, setGoalAchievement] = useState<GoalAchievement | null>(null)
  const [satisfactionRating, setSatisfactionRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = description.trim().length > 0 && goalAchievement !== null && satisfactionRating !== null

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit || goalAchievement === null || satisfactionRating === null) return

    setError(null)
    setIsSubmitting(true)
    try {
      const content: OutcomeContent = {
        description: description.trim(),
        goal_achievement: goalAchievement,
        satisfaction_rating: satisfactionRating,
        unexpected_developments: null,
        recorded_at: new Date().toISOString(),
      }
      await updateComponent('10_outcome', content)
      // Transitions executing -> completed regardless of what happens with
      // Reflection/Lessons Learned next (FR-10.6).
      await advanceState('completed')
      onRecorded()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record your outcome. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <span className={styles.stateBadge}>Executing</span>
      </div>

      <h1 className={styles.heading}>How did it go?</h1>

      <div className={[inputStyles.wrapper, styles.field].join(' ')}>
        <label htmlFor="outcome-description" className={inputStyles.label}>
          What happened?
        </label>
        <textarea
          id="outcome-description"
          className={[inputStyles.input, styles.textarea].join(' ')}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <h2 className={styles.sectionLabel}>Did the outcome match your goal?</h2>
      <div className={styles.radioGroup} role="radiogroup" aria-label="Goal achievement">
        {GOAL_ACHIEVEMENT_OPTIONS.map(option => {
          const isSelected = goalAchievement === option.value
          return (
            <label
              key={option.value}
              className={[styles.radioCard, isSelected ? styles.radioCardSelected : ''].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name="goal-achievement"
                className={styles.radioInput}
                checked={isSelected}
                onChange={() => setGoalAchievement(option.value)}
              />
              <span className={styles.radioLabel}>{option.label}</span>
            </label>
          )
        })}
      </div>

      <h2 className={styles.sectionLabel}>How satisfied are you with this decision?</h2>
      <div className={styles.ratingGroup} role="radiogroup" aria-label="Satisfaction rating, 1 to 5">
        {SATISFACTION_RATINGS.map(rating => {
          const isSelected = satisfactionRating === rating
          return (
            <label
              key={rating}
              className={[styles.ratingCard, isSelected ? styles.ratingCardSelected : ''].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name="satisfaction-rating"
                className={styles.radioInput}
                checked={isSelected}
                onChange={() => setSatisfactionRating(rating)}
              />
              <span>{rating}</span>
            </label>
          )
        })}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.navRow}>
        <Button variant="ghost" size="md" onClick={onCancel} disabled={isSubmitting}>
          Back
        </Button>
        <Button variant="primary" size="lg" disabled={!canSubmit} loading={isSubmitting} onClick={handleSubmit}>
          Record Outcome
        </Button>
      </div>
    </div>
  )
}
