import React from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: React.ReactNode
  className?: string
  elevated?: boolean
  style?: React.CSSProperties
}

export function Card({ children, className, elevated = false, style }: CardProps) {
  return (
    <div
      className={[styles.card, elevated ? styles.elevated : '', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {children}
    </div>
  )
}
