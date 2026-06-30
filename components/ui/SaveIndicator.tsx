import type { CSSProperties, JSX } from 'react'

interface Props {
  saveState: 'idle' | 'saving' | 'saved' | 'error'
}

const baseContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  fontSize: 'var(--text-sm)',
  lineHeight: '1',
  transition: 'opacity var(--transition-slow)',
}

function SpinnerIcon(): JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
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
      style={{ flexShrink: 0 }}
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
      style={{ flexShrink: 0 }}
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
  const containerStyle: CSSProperties = {
    ...baseContainerStyle,
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? 'auto' : 'none',
  }

  return (
    <div style={containerStyle} aria-live="polite">
      {saveState === 'saving' && (
        <>
          <SpinnerIcon />
          <span style={{ color: 'var(--color-text-muted)' }}>Saving...</span>
        </>
      )}
      {saveState === 'saved' && (
        <>
          <CheckIcon />
          <span style={{ color: 'var(--color-success)' }}>Saved</span>
        </>
      )}
      {saveState === 'error' && (
        <>
          <WarningIcon />
          <span style={{ color: 'var(--color-danger)' }}>Not saved</span>
        </>
      )}
    </div>
  )
}
