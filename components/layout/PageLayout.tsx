import React from 'react'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'

interface Props {
  children: React.ReactNode
  decisionTitle?: string  // shown in TopNav center on Decision-level pages
}

export function PageLayout({ children, decisionTitle }: Props): React.ReactElement {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      <TopNav decisionTitle={decisionTitle} />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-6)' }}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
