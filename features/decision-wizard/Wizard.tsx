import { useCallback, useEffect, useState } from 'react'
import type { JSX } from 'react'
import { useRouter } from 'next/router'

import { Button } from '@/components/ui/Button'
import type { DecisionCategory as DecisionCategoryType } from '@/core/decision/Decision.constants'

import { CategorySelect } from './CategorySelect'
import styles from './Wizard.module.css'

interface Props {
  category: DecisionCategoryType | null
}

interface CreateDecisionResponse {
  decision?: { id: string }
  anonymous_token?: string
  error?: string
}

// H13 §2.1 — anonymous token is read from this key on login to transfer ownership
const ANON_TOKEN_STORAGE_KEY = 'anon_decision_token'

export function Wizard({ category }: Props): JSX.Element {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [creatingCategory, setCreatingCategory] = useState<DecisionCategoryType | null>(null)

  const createDecision = useCallback(
    async (selectedCategory: DecisionCategoryType): Promise<void> => {
      setCreatingCategory(selectedCategory)
      setError(null)
      try {
        const res = await fetch('/api/decision/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: selectedCategory }),
        })
        const data: CreateDecisionResponse = await res.json()
        if (data.error || !data.decision) {
          throw new Error(data.error ?? 'Failed to start a decision')
        }
        const destination = data.anonymous_token
          ? `/decision/${data.decision.id}?anonymous_token=${data.anonymous_token}`
          : `/decision/${data.decision.id}`
        if (data.anonymous_token) {
          localStorage.setItem(ANON_TOKEN_STORAGE_KEY, data.anonymous_token)
        }
        await router.replace(destination)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to start a decision')
        setCreatingCategory(null)
      }
    },
    [router]
  )

  useEffect(() => {
    if (category) {
      createDecision(category)
    }
  }, [category, createDecision])

  if (!category) {
    return <CategorySelect onSelect={createDecision} creatingCategory={creatingCategory} error={error} />
  }

  return (
    <div className={styles.loading}>
      <p className={styles.loadingText}>Starting your decision...</p>
      {error && (
        <>
          <p className={styles.error}>{error}</p>
          <Button variant="secondary" size="md" onClick={() => createDecision(category)}>
            Try again
          </Button>
        </>
      )}
    </div>
  )
}
