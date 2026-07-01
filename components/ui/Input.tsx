import React from 'react'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode
  id: string
  error?: string
}

export function Input({ label, id, error, required, className, ...props }: InputProps) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required === false && (
          <span className={styles.optional}>(optional)</span>
        )}
      </label>
      <input
        {...props}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[styles.input, error ? styles.hasError : '', className]
          .filter(Boolean)
          .join(' ')}
      />
      {error && (
        <p id={`${id}-error`} className={styles.errorText} role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  )
}
