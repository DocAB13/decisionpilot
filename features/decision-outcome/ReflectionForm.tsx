import { useState } from 'react'
import type { JSX } from 'react'

import { Button } from '@/components/ui/Button'
import { useDecision } from '@/hooks/useDecision'
import type { DecisionObject, LessonsLearnedContent, ReflectionContent } from '@/core/decision/Decision.types'

import inputStyles from '@/components/ui/Input.module.css'
import styles from './ReflectionForm.module.css'

interface Props {
  decision: DecisionObject
  onDone: () => void
}

type ProcessQuality = NonNullable<ReflectionContent['process_quality']>

const PROCESS_QUALITY_OPTIONS: Array<{ value: ProcessQuality; label: string }> = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]

// Reflection (FR-10.4) and Lessons Learned (FR-10.5) combined into one immediately-
// following, fully skippable screen per H05 §2.4. Reused for both the first-time prompt
// (right after Outcome) and later editing (FR-10.7) — pre-filled from `decision` either way.
export function ReflectionForm({ decision, onDone }: Props): JSX.Element {
  const { updateComponent } = useDecision()

  const existingReflection = decision.components['11_reflection']?.content as ReflectionContent | undefined
  const existingLessons = decision.components['12_lessons_learned']?.content as LessonsLearnedContent | undefined

  const [processQuality, setProcessQuality] = useState<ProcessQuality | null>(
    existingReflection?.process_quality ?? null
  )
  const [aiHelpful, setAiHelpful] = useState<boolean | null>(existingReflection?.ai_analysis_helpful ?? null)
  const [wouldDoDifferently, setWouldDoDifferently] = useState(existingReflection?.would_do_differently ?? '')
  const [lessons, setLessons] = useState(existingLessons?.lessons ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasReflectionContent = processQuality !== null || aiHelpful !== null || wouldDoDifferently.trim().length > 0
  const hasLessonsContent = lessons.trim().length > 0

  const handleSave = async (): Promise<void> => {
    setError(null)
    setIsSubmitting(true)
    try {
      if (hasReflectionContent) {
        const content: ReflectionContent = {
          process_quality: processQuality,
          information_gaps_identified: null,
          priority_recalibration: null,
          ai_analysis_helpful: aiHelpful,
          ai_analysis_feedback: null,
          would_do_differently: wouldDoDifferently.trim() || null,
          recorded_at: new Date().toISOString(),
        }
        await updateComponent('11_reflection', content)
      }
      if (hasLessonsContent) {
        const content: LessonsLearnedContent = {
          lessons: lessons.trim(),
          category_tags: [],
          reusable_heuristics: [],
          consent_to_anonymized_use: false,
          recorded_at: new Date().toISOString(),
        }
        await updateComponent('12_lessons_learned', content)
      }
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>A quick reflection</h1>
      <p className={styles.subheading}>Entirely optional — skip if you&apos;d rather not.</p>

      <h2 className={styles.sectionLabel}>Was the decision-making process useful?</h2>
      <div className={styles.radioGroup} role="radiogroup" aria-label="Process quality">
        {PROCESS_QUALITY_OPTIONS.map(option => {
          const isSelected = processQuality === option.value
          return (
            <label
              key={option.value}
              className={[styles.radioCard, isSelected ? styles.radioCardSelected : ''].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name="process-quality"
                className={styles.radioInput}
                checked={isSelected}
                onChange={() => setProcessQuality(option.value)}
              />
              <span className={styles.radioLabel}>{option.label}</span>
            </label>
          )
        })}
      </div>

      <h2 className={styles.sectionLabel}>Was the AI analysis helpful?</h2>
      <div className={styles.radioGroup} role="radiogroup" aria-label="AI analysis helpful">
        {[
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ].map(option => {
          const isSelected = aiHelpful === option.value
          return (
            <label
              key={String(option.value)}
              className={[styles.radioCard, isSelected ? styles.radioCardSelected : ''].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name="ai-helpful"
                className={styles.radioInput}
                checked={isSelected}
                onChange={() => setAiHelpful(option.value)}
              />
              <span className={styles.radioLabel}>{option.label}</span>
            </label>
          )
        })}
      </div>

      <div className={[inputStyles.wrapper, styles.field].join(' ')}>
        <label htmlFor="would-do-differently" className={inputStyles.label}>
          What would you do differently?
        </label>
        <textarea
          id="would-do-differently"
          className={[inputStyles.input, styles.textarea].join(' ')}
          value={wouldDoDifferently}
          onChange={e => setWouldDoDifferently(e.target.value)}
        />
      </div>

      <div className={[inputStyles.wrapper, styles.field].join(' ')}>
        <label htmlFor="lessons-learned" className={inputStyles.label}>
          A note to your future self
        </label>
        <textarea
          id="lessons-learned"
          className={[inputStyles.input, styles.textarea].join(' ')}
          value={lessons}
          onChange={e => setLessons(e.target.value)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.navRow}>
        <Button variant="ghost" size="md" onClick={onDone} disabled={isSubmitting}>
          Skip for now
        </Button>
        <Button variant="primary" size="lg" loading={isSubmitting} onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  )
}
