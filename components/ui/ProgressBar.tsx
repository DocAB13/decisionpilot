import type { JSX } from 'react'

import styles from './ProgressBar.module.css'

const STEPS = ['Context', 'Goal', 'Constraints', 'Alternatives'] as const

interface Props {
  currentStep: 1 | 2 | 3 | 4
}

export function ProgressBar({ currentStep }: Props): JSX.Element {
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={STEPS.length}
      aria-label={`Step ${currentStep} of ${STEPS.length} — ${STEPS[currentStep - 1]}`}
    >
      {STEPS.map((label, index) => {
        const stepNumber = index + 1
        const state =
          stepNumber < currentStep ? styles.completed : stepNumber === currentStep ? styles.active : styles.incomplete

        return <span key={label} className={[styles.segment, state].join(' ')} aria-hidden="true" />
      })}
    </div>
  )
}
