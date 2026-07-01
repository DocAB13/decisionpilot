import type { JSX } from 'react'

import styles from './SaveIndicator.module.css'

interface Props {
  saveState: 'idle' | 'saving' | 'saved' | 'error'
}

function SpinnerIcon(): JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={styles.icon}
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="var(--color-text-muted)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="22 12"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 7 7"
          to="360 7 7"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  )
}

function CheckIcon(): JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={styles.icon}
    >
      <path
        d="M2.5 7L5.5 10L11.5 4"
        stroke="var(--color-success)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WarningIcon(): JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={styles.icon}
    >
      <path
        d="M7 1.75L12.5 11.25H1.5L7 1.75Z"
        stroke="var(--color-danger)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line
        x1="7"
        y1="5.5"
        x2="7"
        y2="8"
        stroke="var(--color-danger)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="7" cy="9.5" r="0.5" fill="var(--color-danger)" />
    </svg>
  )
}

export function SaveIndicator({ saveState }: Props): JSX.Element {
  const isVisible = saveState !== 'idle'
  const containerClassName = [styles.container, isVisible ? styles.visible : ''].filter(Boolean).join(' ')

  return (
    <div className={containerClassName} aria-live="polite">
      {saveState === 'saving' && (
        <>
          <SpinnerIcon />
          <span className={styles.saving}>Saving...</span>
        </>
      )}
      {saveState === 'saved' && (
        <>
          <CheckIcon />
          <span className={styles.saved}>Saved</span>
        </>
      )}
      {saveState === 'error' && (
        <>
          <WarningIcon />
          <span className={styles.error}>Not saved</span>
        </>
      )}
    </div>
  )
}
