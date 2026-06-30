import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { JSX, ReactNode } from 'react'

import type { ComponentName, DecisionStatus } from '@/core/decision/Decision.constants'
import type { DecisionObject } from '@/core/decision/Decision.types'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface DecisionContextType {
  decision: DecisionObject | null
  isLoading: boolean
  error: string | null
  saveState: SaveState
  updateComponent: (component: ComponentName, content: unknown) => Promise<void>
  advanceState: (to: DecisionStatus) => Promise<void>
}

const DEFAULT_CONTEXT: DecisionContextType = {
  decision: null,
  isLoading: true,
  error: null,
  saveState: 'idle',
  updateComponent: async () => {},
  advanceState: async () => {},
}

const DecisionContext = createContext<DecisionContextType>(DEFAULT_CONTEXT)

interface Props {
  decisionId: string
  children: ReactNode
}

const SAVE_DEBOUNCE_MS = 800
const RETRY_DELAYS_MS = [1000, 3000] as const

export function DecisionProvider({ decisionId, children }: Props): JSX.Element {
  const [decision, setDecision] = useState<DecisionObject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchDecision = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/decision/${decisionId}`)
      const data: { decision?: DecisionObject; error?: string } = await res.json()
      if (data.error) throw new Error(data.error)
      setDecision(data.decision ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load decision')
    } finally {
      setIsLoading(false)
    }
  }, [decisionId])

  useEffect(() => {
    fetchDecision()
  }, [fetchDecision])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  const saveWithRetry = useCallback(
    async (component: ComponentName, content: unknown, attempt = 0): Promise<void> => {
      try {
        const res = await fetch('/api/decision/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision_id: decisionId, component, content }),
        })
        if (!res.ok) throw new Error(`Save failed: ${res.status}`)
        setSaveState('saved')
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => setSaveState('idle'), 2000)
      } catch (e) {
        if (attempt < RETRY_DELAYS_MS.length) {
          await new Promise<void>(resolve => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
          return saveWithRetry(component, content, attempt + 1)
        }
        console.error('[DecisionContext/saveWithRetry]', e, { decision_id: decisionId, component })
        setSaveState('error')
        await fetchDecision()
      }
    },
    [decisionId, fetchDecision]
  )

  const updateComponent = useCallback(
    (component: ComponentName, content: unknown): Promise<void> => {
      setDecision(prev => {
        if (!prev) return prev
        return {
          ...prev,
          components: {
            ...prev.components,
            [component]: {
              version: (prev.components[component]?.version ?? 0) + 1,
              content,
              updated_at: new Date().toISOString(),
            },
          },
        }
      })
      setSaveState('saving')
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return new Promise<void>(resolve => {
        debounceRef.current = setTimeout(() => {
          saveWithRetry(component, content).then(resolve)
        }, SAVE_DEBOUNCE_MS)
      })
    },
    [saveWithRetry]
  )

  const advanceState = useCallback(
    async (to: DecisionStatus): Promise<void> => {
      const res = await fetch('/api/decision/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision_id: decisionId, status: to }),
      })
      const data: { error?: string } = await res.json()
      if (data.error) throw new Error(data.error)
      setDecision(prev => (prev ? { ...prev, status: to } : prev))
    },
    [decisionId]
  )

  return (
    <DecisionContext.Provider value={{ decision, isLoading, error, saveState, updateComponent, advanceState }}>
      {children}
    </DecisionContext.Provider>
  )
}

export const useDecision = (): DecisionContextType => useContext(DecisionContext)
