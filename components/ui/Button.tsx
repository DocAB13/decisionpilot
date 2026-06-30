import React from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[styles.btn, styles[variant], styles[size], loading ? styles.loading : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles.label}>{children}</span>
      {loading && (
        <span className={styles.spinner} aria-hidden="true" role="status" />
      )}
    </button>
  )
}
