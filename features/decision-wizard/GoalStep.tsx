import type { JSX } from 'react'

import { Button } from '@/components/ui/Button'
import { SaveIndicator } from '@/components/ui/SaveIndicator'
import { useDecision } from '@/hooks/useDecision'
import type { GoalContent } from '@/core/decision/Decision.types'

import inputStyles from '@/components/ui/Input.module.css'
import styles from './WizardStep.module.css'

interface Props {
  onBack?: () => void
  onSkip: () => void
  onContinue: () => void
}

const EMPTY_GOAL: GoalContent = {
  primary: '',
  success_criteria: null,
  time_horizon: null,
  secondary_goals: [],
}

function parseSecondaryGoals(value: string): string[] {
  return value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

function hasNonEmptyField(content: GoalContent): boolean {
  return (
    content.primary.trim().length > 0 ||
    (content.success_criteria ?? '').trim().length > 0 ||
    (content.time_horizon ?? '').trim().length > 0 ||
    content.secondary_goals.length > 0
  )
}

export function GoalStep({ onBack, onSkip, onContinue }: Props): JSX.Element | null {
  const { decision, updateComponent, saveState } = useDecision()

  if (!decision) return null

  const content = (decision.components['2_goal']?.content as GoalContent | undefined) ?? EMPTY_GOAL

  const handleTextChange = (field: 'primary' | 'success_criteria' | 'time_horizon', value: string): void => {
    updateComponent('2_goal', { ...content, [field]: value })
  }

  const handleSecondaryGoalsChange = (value: string): void => {
    updateComponent('2_goal', { ...content, secondary_goals: parseSecondaryGoals(value) })
  }

  const canContinue = hasNonEmptyField(content)

  return (
    <div className={styles.container}>
      <div className={styles.saveIndicator}>
        <SaveIndicator saveState={saveState} />
      </div>

      <p className={styles.sectionLabel}>Step 2 of 4 — Goal</p>
      <h1 className={styles.question}>What does a good outcome look like?</h1>
      <p className={styles.reason}>
        Your goal shapes how we evaluate every alternative — we&apos;ll weigh options against
        what actually matters to you.
      </p>

      <div className={styles.fieldGroup}>
        <div className={inputStyles.wrapper}>
          <label htmlFor="goal-primary" className={inputStyles.label}>
            What&apos;s your main goal?
          </label>
          <textarea
            id="goal-primary"
            className={[inputStyles.input, styles.textarea].join(' ')}
            value={content.primary}
            onChange={e => handleTextChange('primary', e.target.value)}
          />
        </div>

        <div className={inputStyles.wrapper}>
          <label htmlFor="goal-success-criteria" className={inputStyles.label}>
            How will you know you succeeded?
            <span className={inputStyles.optional}>(optional)</span>
          </label>
          <textarea
            id="goal-success-criteria"
            className={[inputStyles.input, styles.textarea].join(' ')}
            value={content.success_criteria ?? ''}
            onChange={e => handleTextChange('success_criteria', e.target.value)}
          />
        </div>

        <div className={inputStyles.wrapper}>
          <label htmlFor="goal-time-horizon" className={inputStyles.label}>
            What&apos;s your time horizon?
            <span className={inputStyles.optional}>(optional)</span>
          </label>
          <input
            id="goal-time-horizon"
            type="text"
            className={inputStyles.input}
            placeholder="e.g., 6 months, 2 years"
            value={content.time_horizon ?? ''}
            onChange={e => handleTextChange('time_horizon', e.target.value)}
          />
        </div>

        <div className={inputStyles.wrapper}>
          <label htmlFor="goal-secondary" className={inputStyles.label}>
            Any secondary goals?
            <span className={inputStyles.optional}>(optional, one per line)</span>
          </label>
          <textarea
            id="goal-secondary"
            className={[inputStyles.input, styles.textarea].join(' ')}
            value={content.secondary_goals.join('\n')}
            onChange={e => handleSecondaryGoalsChange(e.target.value)}
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
