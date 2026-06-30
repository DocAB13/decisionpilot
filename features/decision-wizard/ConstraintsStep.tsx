import type { JSX } from 'react'

import { Button } from '@/components/ui/Button'
import { SaveIndicator } from '@/components/ui/SaveIndicator'
import { useDecision } from '@/hooks/useDecision'
import type { ConstraintItem, ConstraintsContent } from '@/core/decision/Decision.types'

import inputStyles from '@/components/ui/Input.module.css'
import styles from './WizardStep.module.css'

interface Props {
  onBack?: () => void
  onSkip: () => void
  onContinue: () => void
}

const EMPTY_CONSTRAINTS: ConstraintsContent = { hard: [], soft: [] }

const NEW_CONSTRAINT: ConstraintItem = { type: 'other', description: '', value: null, unit: null }

function hasNonEmptyConstraint(items: ConstraintItem[]): boolean {
  return items.some(item => item.description.trim().length > 0)
}

interface ConstraintRowProps {
  item: ConstraintItem
  idPrefix: string
  onChange: (item: ConstraintItem) => void
  onRemove: () => void
}

// ConstraintItem has no stable id in the domain model — index is the only key available.
function ConstraintRow({ item, idPrefix, onChange, onRemove }: ConstraintRowProps): JSX.Element {
  return (
    <div className={styles.constraintRow}>
      <div className={inputStyles.wrapper}>
        <label htmlFor={`${idPrefix}-type`} className={inputStyles.label}>
          Type
        </label>
        <select
          id={`${idPrefix}-type`}
          className={inputStyles.input}
          value={item.type}
          onChange={e => onChange({ ...item, type: e.target.value as ConstraintItem['type'] })}
        >
          <option value="budget">Budget</option>
          <option value="time">Time</option>
          <option value="geographic">Geographic</option>
          <option value="personal">Personal</option>
          <option value="legal">Legal</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className={inputStyles.wrapper}>
        <label htmlFor={`${idPrefix}-description`} className={inputStyles.label}>
          Description
        </label>
        <input
          id={`${idPrefix}-description`}
          type="text"
          className={inputStyles.input}
          value={item.description}
          onChange={e => onChange({ ...item, description: e.target.value })}
        />
      </div>

      <div className={inputStyles.wrapper}>
        <label htmlFor={`${idPrefix}-value`} className={inputStyles.label}>
          Value
          <span className={inputStyles.optional}>(optional)</span>
        </label>
        <input
          id={`${idPrefix}-value`}
          type="text"
          className={inputStyles.input}
          value={item.value ?? ''}
          onChange={e => onChange({ ...item, value: e.target.value || null })}
        />
      </div>

      <div className={inputStyles.wrapper}>
        <label htmlFor={`${idPrefix}-unit`} className={inputStyles.label}>
          Unit
          <span className={inputStyles.optional}>(optional)</span>
        </label>
        <input
          id={`${idPrefix}-unit`}
          type="text"
          className={inputStyles.input}
          value={item.unit ?? ''}
          onChange={e => onChange({ ...item, unit: e.target.value || null })}
        />
      </div>

      <Button
        variant="ghost"
        size="md"
        className={styles.removeButton}
        onClick={onRemove}
        aria-label="Remove constraint"
      >
        Remove
      </Button>
    </div>
  )
}

export function ConstraintsStep({ onBack, onSkip, onContinue }: Props): JSX.Element | null {
  const { decision, updateComponent, saveState } = useDecision()

  if (!decision) return null

  const content =
    (decision.components['3_constraints']?.content as ConstraintsContent | undefined) ?? EMPTY_CONSTRAINTS

  const updateList = (key: 'hard' | 'soft', items: ConstraintItem[]): void => {
    updateComponent('3_constraints', { ...content, [key]: items })
  }

  const addConstraint = (key: 'hard' | 'soft'): void => {
    updateList(key, [...content[key], { ...NEW_CONSTRAINT }])
  }

  const changeConstraint = (key: 'hard' | 'soft', index: number, item: ConstraintItem): void => {
    const next = [...content[key]]
    next[index] = item
    updateList(key, next)
  }

  const removeConstraint = (key: 'hard' | 'soft', index: number): void => {
    updateList(
      key,
      content[key].filter((_, i) => i !== index)
    )
  }

  const canContinue = hasNonEmptyConstraint(content.hard) || hasNonEmptyConstraint(content.soft)

  return (
    <div className={styles.container}>
      <div className={styles.saveIndicator}>
        <SaveIndicator saveState={saveState} />
      </div>

      <p className={styles.sectionLabel}>Step 3 of 4 — Constraints</p>
      <h1 className={styles.question}>What are your hard limits?</h1>
      <p className={styles.reason}>
        Hard constraints rule out alternatives that don&apos;t fit. Soft constraints are
        preferences we&apos;ll factor in, but won&apos;t eliminate options over.
      </p>

      <div className={styles.fieldGroup}>
        <div>
          <h2 className={styles.constraintGroupHeading}>Hard constraints</h2>
          {content.hard.map((item, index) => (
            <ConstraintRow
              key={index}
              idPrefix={`hard-${index}`}
              item={item}
              onChange={updated => changeConstraint('hard', index, updated)}
              onRemove={() => removeConstraint('hard', index)}
            />
          ))}
          <Button variant="secondary" size="md" onClick={() => addConstraint('hard')}>
            Add hard constraint
          </Button>
        </div>

        <div>
          <h2 className={styles.constraintGroupHeading}>Soft constraints</h2>
          {content.soft.map((item, index) => (
            <ConstraintRow
              key={index}
              idPrefix={`soft-${index}`}
              item={item}
              onChange={updated => changeConstraint('soft', index, updated)}
              onRemove={() => removeConstraint('soft', index)}
            />
          ))}
          <Button variant="secondary" size="md" onClick={() => addConstraint('soft')}>
            Add soft constraint
          </Button>
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
