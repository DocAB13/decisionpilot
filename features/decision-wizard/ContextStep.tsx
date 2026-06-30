import type { JSX } from 'react'

import { Button } from '@/components/ui/Button'
import { SaveIndicator } from '@/components/ui/SaveIndicator'
import { useDecision } from '@/hooks/useDecision'
import type { ContextContent } from '@/core/decision/Decision.types'

import inputStyles from '@/components/ui/Input.module.css'
import styles from './WizardStep.module.css'

interface Props {
  onBack?: () => void
  onSkip: () => void
  onContinue: () => void
}

const EMPTY_CONTEXT: ContextContent = {
  background: '',
  current_situation: '',
  prior_attempts: null,
  timing_constraints: null,
  geographic_market: '',
  currency: '',
}

function hasNonEmptyField(content: ContextContent): boolean {
  return (
    content.background.trim().length > 0 ||
    content.current_situation.trim().length > 0 ||
    (content.prior_attempts ?? '').trim().length > 0 ||
    (content.timing_constraints ?? '').trim().length > 0 ||
    content.geographic_market.trim().length > 0 ||
    content.currency.trim().length > 0
  )
}

export function ContextStep({ onBack, onSkip, onContinue }: Props): JSX.Element | null {
  const { decision, updateComponent, saveState } = useDecision()

  if (!decision) return null

  const content = (decision.components['1_context']?.content as ContextContent | undefined) ?? EMPTY_CONTEXT

  const handleChange = (field: keyof ContextContent, value: string): void => {
    updateComponent('1_context', { ...content, [field]: value })
  }

  const canContinue = hasNonEmptyField(content)

  return (
    <div className={styles.container}>
      <div className={styles.saveIndicator}>
        <SaveIndicator saveState={saveState} />
      </div>

      <p className={styles.sectionLabel}>Step 1 of 4 — Context</p>
      <h1 className={styles.question}>Tell us about your situation</h1>
      <p className={styles.reason}>
        We use this background to understand what&apos;s driving this decision, so the analysis
        reflects your real situation — not a generic template.
      </p>

      <div className={styles.fieldGroup}>
        <div className={inputStyles.wrapper}>
          <label htmlFor="context-background" className={inputStyles.label}>
            What&apos;s the background?
          </label>
          <textarea
            id="context-background"
            className={[inputStyles.input, styles.textarea].join(' ')}
            placeholder="Describe the situation that's led to this decision..."
            value={content.background}
            onChange={e => handleChange('background', e.target.value)}
          />
        </div>

        <div className={inputStyles.wrapper}>
          <label htmlFor="context-current-situation" className={inputStyles.label}>
            What&apos;s happening right now?
          </label>
          <textarea
            id="context-current-situation"
            className={[inputStyles.input, styles.textarea].join(' ')}
            value={content.current_situation}
            onChange={e => handleChange('current_situation', e.target.value)}
          />
        </div>

        <div className={inputStyles.wrapper}>
          <label htmlFor="context-prior-attempts" className={inputStyles.label}>
            Have you tried anything already?
            <span className={inputStyles.optional}>(optional)</span>
          </label>
          <textarea
            id="context-prior-attempts"
            className={[inputStyles.input, styles.textarea].join(' ')}
            value={content.prior_attempts ?? ''}
            onChange={e => handleChange('prior_attempts', e.target.value)}
          />
        </div>

        <div className={inputStyles.wrapper}>
          <label htmlFor="context-timing" className={inputStyles.label}>
            Any timing constraints?
            <span className={inputStyles.optional}>(optional)</span>
          </label>
          <input
            id="context-timing"
            type="text"
            className={inputStyles.input}
            placeholder="e.g., need to decide within 2 weeks"
            value={content.timing_constraints ?? ''}
            onChange={e => handleChange('timing_constraints', e.target.value)}
          />
        </div>

        <div className={inputStyles.wrapper}>
          <label htmlFor="context-market" className={inputStyles.label}>
            Where is this decision based?
          </label>
          <input
            id="context-market"
            type="text"
            className={inputStyles.input}
            placeholder="e.g., United States, Remote"
            value={content.geographic_market}
            onChange={e => handleChange('geographic_market', e.target.value)}
          />
        </div>

        <div className={inputStyles.wrapper}>
          <label htmlFor="context-currency" className={inputStyles.label}>
            What currency should we use?
          </label>
          <input
            id="context-currency"
            type="text"
            className={inputStyles.input}
            placeholder="e.g., USD, EUR"
            value={content.currency}
            onChange={e => handleChange('currency', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.navRow}>
        <div className={styles.navLeft}>
          {onBack && (
            <Button variant="ghost" size="md" onClick={onBack}>
              Back
            </Button>
          )}
          <Button variant="ghost" size="md" onClick={onSkip}>
            Skip for now
          </Button>
        </div>
        <Button variant="primary" size="md" disabled={!canContinue} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}
