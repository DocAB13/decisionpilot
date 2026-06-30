import { useCallback, useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'

import { Button } from '@/components/ui/Button'
import { SaveIndicator } from '@/components/ui/SaveIndicator'
import { useDecision } from '@/hooks/useDecision'
import type { AlternativeItem, AlternativesContent } from '@/core/decision/Decision.types'

import inputStyles from '@/components/ui/Input.module.css'
import styles from './WizardStep.module.css'

interface Props {
  onBack?: () => void
  onSkip: () => void
  onContinue: () => void
}

const EMPTY_ALTERNATIVES: AlternativesContent = { alternatives: [], do_nothing_included: false }
const MAX_ALTERNATIVES = 5
const MIN_RENDERED_ROWS = 2

interface SuggestionItem {
  name: string
  one_line_rationale: string
}

interface ConflictResult {
  conflict_detected: boolean
  conflict_description: string | null
  conflict_type: 'mathematical' | 'logical' | 'likely' | null
}

function hasNonEmptyAlternative(items: AlternativeItem[]): boolean {
  return items.some(item => item.name.trim().length > 0)
}

export function AlternativesStep({ onBack, onSkip, onContinue }: Props): JSX.Element | null {
  const { decision, updateComponent, saveState } = useDecision()

  // Stable ids for the always-visible empty slots (H08 §8: two empty cards minimum)
  const [placeholderIds] = useState<string[]>(() => [crypto.randomUUID(), crypto.randomUUID()])

  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)
  const suggestionsFetchedRef = useRef(false)

  const [conflict, setConflict] = useState<ConflictResult | null>(null)
  const [isCheckingConflict, setIsCheckingConflict] = useState(false)
  const [conflictError, setConflictError] = useState<string | null>(null)

  const content =
    (decision?.components['4_alternatives']?.content as AlternativesContent | undefined) ??
    EMPTY_ALTERNATIVES

  const fetchSuggestions = useCallback(async (): Promise<void> => {
    if (!decision) return
    setSuggestionsError(null)
    try {
      const res = await fetch('/api/decision/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision_id: decision.id,
          alternatives: content.alternatives.map(a => ({ name: a.name })),
        }),
      })
      const data: { suggestions?: SuggestionItem[]; error?: string } = await res.json()
      if (data.error) throw new Error(data.error)
      const existingNames = new Set(content.alternatives.map(a => a.name.toLowerCase()))
      setSuggestions((data.suggestions ?? []).filter(s => !existingNames.has(s.name.toLowerCase())))
    } catch (e) {
      setSuggestionsError(e instanceof Error ? e.message : 'Failed to load suggestions')
    }
  }, [decision, content.alternatives])

  // Trigger suggestions once, after the first alternative has been entered (H08, IR01-067)
  useEffect(() => {
    if (!suggestionsFetchedRef.current && hasNonEmptyAlternative(content.alternatives)) {
      suggestionsFetchedRef.current = true
      fetchSuggestions()
    }
  }, [content.alternatives, fetchSuggestions])

  if (!decision) return null

  const updateAlternatives = (alternatives: AlternativeItem[]): void => {
    updateComponent('4_alternatives', {
      ...content,
      alternatives,
      do_nothing_included: alternatives.some(a => a.source === 'do_nothing'),
    })
  }

  const handleRowChange = (rowId: string, isPlaceholder: boolean, name: string): void => {
    if (isPlaceholder) {
      if (name.trim() === '') return
      updateAlternatives([
        ...content.alternatives,
        { id: rowId, name, source: 'user_provided', user_notes: null, attributes: {} },
      ])
      return
    }
    updateAlternatives(content.alternatives.map(a => (a.id === rowId ? { ...a, name } : a)))
  }

  const handleAdd = (): void => {
    if (content.alternatives.length >= MAX_ALTERNATIVES) return
    updateAlternatives([
      ...content.alternatives,
      { id: crypto.randomUUID(), name: '', source: 'user_provided', user_notes: null, attributes: {} },
    ])
  }

  const handleRemove = (id: string): void => {
    updateAlternatives(content.alternatives.filter(a => a.id !== id))
  }

  const handleAddSuggestion = (suggestion: SuggestionItem): void => {
    if (content.alternatives.length >= MAX_ALTERNATIVES) return
    updateAlternatives([
      ...content.alternatives,
      {
        id: crypto.randomUUID(),
        name: suggestion.name,
        source: 'ai_suggested',
        user_notes: suggestion.one_line_rationale,
        attributes: {},
      },
    ])
    setSuggestions(prev => prev.filter(s => s.name !== suggestion.name))
  }

  const handleAddDoNothing = (): void => {
    if (content.alternatives.length >= MAX_ALTERNATIVES) return
    updateAlternatives([
      ...content.alternatives,
      { id: crypto.randomUUID(), name: 'Do nothing', source: 'do_nothing', user_notes: null, attributes: {} },
    ])
  }

  const handleContinueClick = async (): Promise<void> => {
    setConflictError(null)
    setIsCheckingConflict(true)
    try {
      const res = await fetch('/api/decision/conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision_id: decision.id }),
      })
      const data: ConflictResult & { error?: string } = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.conflict_detected) {
        setConflict(data)
      } else {
        onContinue()
      }
    } catch (e) {
      setConflictError(e instanceof Error ? e.message : 'Failed to check for conflicts')
    } finally {
      setIsCheckingConflict(false)
    }
  }

  const usedPlaceholderCount = Math.max(0, MIN_RENDERED_ROWS - content.alternatives.length)
  const visiblePlaceholderIds = placeholderIds.slice(0, usedPlaceholderCount)
  const hasDoNothing = content.alternatives.some(a => a.source === 'do_nothing')
  const canContinue = hasNonEmptyAlternative(content.alternatives)
  const canAddMore = content.alternatives.length < MAX_ALTERNATIVES

  return (
    <div className={styles.container}>
      <div className={styles.saveIndicator}>
        <SaveIndicator saveState={saveState} />
      </div>

      <p className={styles.sectionLabel}>Step 4 of 4 — Alternatives</p>
      <h1 className={styles.question}>What options are you considering?</h1>
      <p className={styles.reason}>
        List the alternatives you&apos;re weighing. We&apos;ll suggest a few more once
        you&apos;ve added your first one, and flag anything that doesn&apos;t add up before we
        analyze.
      </p>

      <div className={styles.altList}>
        {content.alternatives.map(item => (
          <div key={item.id} className={styles.altCard}>
            <div className={[inputStyles.wrapper, styles.altCardInput].join(' ')}>
              <label htmlFor={`alt-${item.id}`} className={inputStyles.label}>
                Option
              </label>
              <input
                id={`alt-${item.id}`}
                type="text"
                className={inputStyles.input}
                value={item.name}
                onChange={e => handleRowChange(item.id, false, e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="md"
              className={styles.removeButton}
              onClick={() => handleRemove(item.id)}
              aria-label="Remove alternative"
            >
              Remove
            </Button>
          </div>
        ))}

        {visiblePlaceholderIds.map(id => (
          <div key={id} className={styles.altCard}>
            <div className={[inputStyles.wrapper, styles.altCardInput].join(' ')}>
              <label htmlFor={`alt-${id}`} className={inputStyles.label}>
                Option
              </label>
              <input
                id={`alt-${id}`}
                type="text"
                className={inputStyles.input}
                value=""
                onChange={e => handleRowChange(id, true, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <Button variant="secondary" size="md" disabled={!canAddMore} onClick={handleAdd}>
        Add another option
      </Button>

      {suggestions.length > 0 && (
        <>
          <h2 className={styles.suggestionsHeading}>AI suggestions</h2>
          {suggestions.map(suggestion => (
            <div key={suggestion.name} className={styles.suggestionCard}>
              <div className={styles.suggestionText}>
                <span className={styles.suggestionName}>{suggestion.name}</span>
                <span className={styles.suggestionRationale}>{suggestion.one_line_rationale}</span>
              </div>
              <Button
                variant="secondary"
                size="md"
                disabled={!canAddMore}
                onClick={() => handleAddSuggestion(suggestion)}
              >
                Add this
              </Button>
            </div>
          ))}
        </>
      )}
      {suggestionsError && <p className={styles.error}>{suggestionsError}</p>}

      {!hasDoNothing && (
        <div className={styles.doNothingCard}>
          <p className={styles.doNothingText}>Want to include the option of doing nothing?</p>
          <Button variant="ghost" size="md" disabled={!canAddMore} onClick={handleAddDoNothing}>
            Add &quot;do nothing&quot;
          </Button>
        </div>
      )}

      {conflict?.conflict_detected && (
        <div className={styles.conflictBanner}>
          <span className={styles.conflictIcon} aria-hidden="true">
            ⚠
          </span>
          <div className={styles.conflictBody}>
            <p className={styles.conflictText}>
              We noticed a possible conflict: {conflict.conflict_description}
            </p>
            <div className={styles.conflictActions}>
              <Button variant="secondary" size="md" onClick={() => setConflict(null)}>
                Go back to adjust
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setConflict(null)
                  onContinue()
                }}
              >
                Continue anyway
              </Button>
            </div>
          </div>
        </div>
      )}
      {conflictError && <p className={styles.error}>{conflictError}</p>}

      <div className={styles.navRow}>
        <div className={styles.navLeft}>
          {onBack && (
            <Button variant="ghost" size="md" onClick={onBack}>
              Back
            </Button>
          )}
          <Button variant="ghost" size="md" onClick={onSkip}>
            Skip for now
          </Button>
        </div>
        <Button
          variant="primary"
          size="md"
          disabled={!canContinue}
          loading={isCheckingConflict}
          onClick={handleContinueClick}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
