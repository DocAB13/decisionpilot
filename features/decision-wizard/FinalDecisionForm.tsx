import { useState } from 'react'
import type { JSX } from 'react'

import { Button } from '@/components/ui/Button'
import { useDecision } from '@/hooks/useDecision'
import type { DecisionCategory } from '@/core/decision/Decision.constants'
import type {
  AlternativesContent,
  FinalDecisionContent,
  RecommendationContent,
} from '@/core/decision/Decision.types'

import inputStyles from '@/components/ui/Input.module.css'
import styles from './FinalDecisionForm.module.css'

interface Props {
  onCancel: () => void
}

type Confidence = FinalDecisionContent['confidence']

const CONFIDENCE_OPTIONS: Array<{ value: Confidence; label: string; description: string }> = [
  { value: 'confident', label: 'Confident', description: "I'm sure this is the right choice." },
  { value: 'uncertain', label: 'Uncertain', description: "I'm not fully sure, but it's the best option I have." },
  { value: 'reluctant', label: 'Reluctant', description: "I'm not happy about this, but I don't see a better option." },
]

function formatCategoryLabel(category: DecisionCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export function FinalDecisionForm({ onCancel }: Props): JSX.Element | null {
  const { decision, updateComponent, advanceState } = useDecision()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [divergenceReason, setDivergenceReason] = useState('')
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!decision) return null

  const alternatives = (decision.components['4_alternatives']?.content as AlternativesContent | undefined)
    ?.alternatives ?? []
  const recommendation = decision.components['7_recommendation']?.content as RecommendationContent | undefined

  const currentSelectedId = selectedId ?? recommendation?.recommended_alternative_id ?? alternatives[0]?.id ?? null
  const matchesRecommendation = currentSelectedId === recommendation?.recommended_alternative_id
  const canSubmit =
    currentSelectedId !== null &&
    confidence !== null &&
    (matchesRecommendation || divergenceReason.trim().length > 0)

  const handleSubmit = async (): Promise<void> => {
    const chosen = alternatives.find(a => a.id === currentSelectedId)
    if (!chosen || !confidence) return

    setError(null)
    setIsSubmitting(true)
    try {
      const content: FinalDecisionContent = {
        chosen_alternative_id: chosen.id,
        chosen_alternative_name: chosen.name,
        matches_recommendation: matchesRecommendation,
        divergence_reason: matchesRecommendation ? null : divergenceReason.trim(),
        confidence,
        recorded_at: new Date().toISOString(),
      }
      await updateComponent('8_final_decision', content)
      await advanceState('decision_made')
      // On success, decision.status flips to decision_made and the parent page
      // re-renders into the Action Plan view — no further action needed here.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record your decision. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <span className={styles.categoryLabel}>{formatCategoryLabel(decision.category)}</span>
        <span className={styles.stateBadge}>Waiting for You</span>
      </div>

      <h1 className={styles.heading}>Record your decision</h1>

      <h2 className={styles.sectionLabel}>Which alternative are you choosing?</h2>
      <div className={styles.radioGroup} role="radiogroup" aria-label="Choose your alternative">
        {alternatives.map(alt => {
          const isSelected = currentSelectedId === alt.id
          return (
            <label
              key={alt.id}
              className={[styles.radioCard, isSelected ? styles.radioCardSelected : ''].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name="chosen-alternative"
                className={styles.radioInput}
                checked={isSelected}
                onChange={() => setSelectedId(alt.id)}
              />
              <span className={styles.radioText}>
                <span className={styles.radioLabel}>{alt.name}</span>
              </span>
              {recommendation?.recommended_alternative_id === alt.id && (
                <span className={styles.recommendedTag}>Recommended</span>
              )}
            </label>
          )
        })}
      </div>

      {!matchesRecommendation && (
        <div className={[inputStyles.wrapper, styles.divergenceField].join(' ')}>
          <label htmlFor="divergence-reason" className={inputStyles.label}>
            What made you choose differently than the recommendation?
          </label>
          <textarea
            id="divergence-reason"
            className={[inputStyles.input, styles.textarea].join(' ')}
            value={divergenceReason}
            onChange={e => setDivergenceReason(e.target.value)}
          />
        </div>
      )}

      <h2 className={styles.sectionLabel}>How confident are you in this decision?</h2>
      <div className={styles.radioGroup} role="radiogroup" aria-label="Confidence level">
        {CONFIDENCE_OPTIONS.map(option => {
          const isSelected = confidence === option.value
          return (
            <label
              key={option.value}
              className={[styles.radioCard, isSelected ? styles.radioCardSelected : ''].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name="confidence-level"
                className={styles.radioInput}
                checked={isSelected}
                onChange={() => setConfidence(option.value)}
              />
              <span className={styles.radioText}>
                <span className={styles.radioLabel}>{option.label}</span>
                <span className={styles.radioDescription}>{option.description}</span>
              </span>
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
          Record My Decision
        </Button>
      </div>
    </div>
  )
}
