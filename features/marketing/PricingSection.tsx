import { useState } from 'react'
import type { JSX } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useSubscription } from '@/hooks/useSubscription'

import styles from './PricingSection.module.css'

type PaidPlan = 'pro' | 'premium'
type TierId = 'free' | PaidPlan

interface Tier {
  id: TierId
  label: string
  price: string
  cadence: string
  features: string[]
}

// H07/H18 pricing tiers, rebuilt on H08 tokens from the legacy Landing pricing grid.
const TIERS: Tier[] = [
  {
    id: 'free',
    label: 'Free',
    price: '€0',
    cadence: 'forever',
    features: ['Unlimited decisions', 'AI recommendations', 'Up to 10 saved decisions'],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '€4.99',
    cadence: 'per month',
    features: ['Everything in Free', 'AI Chat on every decision', 'Unlimited decision history', 'Priority AI processing'],
  },
  {
    id: 'premium',
    label: 'Premium',
    price: '€9.99',
    cadence: 'per month',
    features: ['Everything in Pro', 'Custom decision templates', 'API access', 'Priority support'],
  },
]

export function PricingSection(): JSX.Element {
  const { plan } = useSubscription()
  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  // POST /api/billing/checkout (H13 §4.1) — redirects to Stripe Checkout on success.
  const handleUpgrade = async (target: PaidPlan): Promise<void> => {
    setError(null)
    setLoadingPlan(target)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: target }),
      })
      const data: { url?: string; error?: string } = await res.json()
      if (data.error || !data.url) throw new Error(data.error ?? 'Failed to start checkout')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start checkout')
      setLoadingPlan(null)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Simple, transparent pricing</h2>
        <p className={styles.subheading}>Start free. Upgrade when you need more.</p>
      </div>

      <div className={styles.grid}>
        {TIERS.map(tier => {
          const isCurrent = plan === tier.id

          return (
            <Card key={tier.id} elevated={tier.id === 'pro'} className={styles.card}>
              <p className={styles.tierLabel}>{tier.label}</p>
              <p className={styles.price}>
                {tier.price} <span className={styles.cadence}>{tier.cadence}</span>
              </p>

              <ul className={styles.featureList}>
                {tier.features.map(feature => (
                  <li key={feature} className={styles.feature}>
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrent && <p className={styles.currentPlan}>Current plan</p>}

              {!isCurrent && tier.id !== 'free' && (
                <Button
                  variant={tier.id === 'pro' ? 'primary' : 'secondary'}
                  size="md"
                  loading={loadingPlan === tier.id}
                  disabled={loadingPlan !== null && loadingPlan !== tier.id}
                  onClick={() => handleUpgrade(tier.id as PaidPlan)}
                  style={{ width: '100%' }}
                >
                  Upgrade to {tier.label}
                </Button>
              )}
            </Card>
          )
        })}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
