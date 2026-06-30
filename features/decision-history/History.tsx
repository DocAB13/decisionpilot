import { useCallback, useEffect, useState } from 'react'
import type { JSX } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DecisionStatus } from '@/core/decision/Decision.constants'
import type { DecisionCategory as DecisionCategoryType, DecisionStatus as DecisionStatusType } from '@/core/decision/Decision.constants'

import styles from './History.module.css'

export interface HistoryFilters {
  status?: DecisionStatusType[]
  category?: DecisionCategoryType
  created_from?: string
  created_to?: string
  order?: 'updated_desc' | 'created_desc' | 'created_asc'
}

interface DecisionSummary {
  alternatives_count: number | null
  has_recommendation: boolean
  outcome_satisfaction: number | null
}

interface DecisionHistoryItem {
  id: string
  category: DecisionCategoryType
  status: DecisionStatusType
  title: string | null
  created_at: string
  updated_at: string
  summary: DecisionSummary
}

interface HistoryResponse {
  decisions: DecisionHistoryItem[]
  total: number
  plan_limit: boolean
  error?: string
}

interface Props {
  filters: HistoryFilters
  emptyStateVariant: 'dashboard' | 'history'
  onClearFilters?: () => void
}

const SKELETON_COUNT = 4
const MS_PER_DAY = 86400000
const DRAFT_IDLE_DAYS = 7
const EXECUTING_STALE_DAYS = 30

const STATE_LABELS: Record<DecisionStatusType, string> = {
  [DecisionStatus.DRAFT]: 'Draft',
  [DecisionStatus.IN_ANALYSIS]: 'In Analysis',
  [DecisionStatus.WAITING_FOR_USER]: 'Waiting for You',
  [DecisionStatus.DECISION_MADE]: 'Decision Made',
  [DecisionStatus.EXECUTING]: 'Executing',
  [DecisionStatus.COMPLETED]: 'Completed',
  [DecisionStatus.ARCHIVED]: 'Archived',
}

const STATE_COLOR_VARS: Record<DecisionStatusType, string> = {
  [DecisionStatus.DRAFT]: 'var(--color-state-draft)',
  [DecisionStatus.IN_ANALYSIS]: 'var(--color-state-analysis)',
  [DecisionStatus.WAITING_FOR_USER]: 'var(--color-state-waiting)',
  [DecisionStatus.DECISION_MADE]: 'var(--color-state-made)',
  [DecisionStatus.EXECUTING]: 'var(--color-state-executing)',
  [DecisionStatus.COMPLETED]: 'var(--color-state-completed)',
  [DecisionStatus.ARCHIVED]: 'var(--color-state-archived)',
}

interface PriorityInfo {
  accentColorVar: string
  message: string
}

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / MS_PER_DAY
}

// Priority indicators — H08 §10
function getPriorityInfo(item: DecisionHistoryItem): PriorityInfo | null {
  if (item.status === DecisionStatus.WAITING_FOR_USER) {
    return { accentColorVar: 'var(--color-state-waiting)', message: 'Review your Recommendation' }
  }
  if (item.status === DecisionStatus.EXECUTING && daysSince(item.updated_at) >= EXECUTING_STALE_DAYS) {
    return { accentColorVar: 'var(--color-state-executing)', message: 'How did your decision go?' }
  }
  if (item.status === DecisionStatus.DRAFT && daysSince(item.updated_at) >= DRAFT_IDLE_DAYS) {
    return { accentColorVar: 'var(--color-text-muted)', message: 'Resume this decision' }
  }
  return null
}

interface GroupedDecisions {
  needsAttention: DecisionHistoryItem[]
  active: DecisionHistoryItem[]
  completed: DecisionHistoryItem[]
  archived: DecisionHistoryItem[]
}

// Grouping — H08 §10: Needs attention → Active → Completed → Archived
function groupDecisions(items: DecisionHistoryItem[]): GroupedDecisions {
  const groups: GroupedDecisions = { needsAttention: [], active: [], completed: [], archived: [] }
  for (const item of items) {
    if (item.status === DecisionStatus.ARCHIVED) {
      groups.archived.push(item)
    } else if (item.status === DecisionStatus.COMPLETED) {
      groups.completed.push(item)
    } else if (getPriorityInfo(item) !== null) {
      groups.needsAttention.push(item)
    } else {
      groups.active.push(item)
    }
  }
  return groups
}

function formatCategoryLabel(category: DecisionCategoryType): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function formatRelativeTime(iso: string): string {
  const diffDays = Math.floor(daysSince(iso))
  if (diffDays <= 0) return 'Updated today'
  if (diffDays === 1) return 'Updated yesterday'
  if (diffDays < 30) return `Updated ${diffDays} days ago`
  return `Updated ${new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
}

function renderStars(rating: number): string {
  const filled = Math.round(rating)
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

function buildQueryString(filters: HistoryFilters): string {
  const params = new URLSearchParams()
  filters.status?.forEach(status => params.append('status', status))
  if (filters.category) params.set('category', filters.category)
  if (filters.created_from) params.set('created_from', filters.created_from)
  if (filters.created_to) params.set('created_to', filters.created_to)
  if (filters.order) params.set('order', filters.order)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

function hasActiveFilters(filters: HistoryFilters): boolean {
  return Boolean(filters.category || filters.created_from || filters.created_to)
}

function DecisionCard({ item }: { item: DecisionHistoryItem }): JSX.Element {
  const priority = getPriorityInfo(item)

  return (
    <Link href={`/decision/${item.id}`} className={styles.cardLink}>
      <Card
        className={styles.card}
        style={{ borderLeft: `4px solid ${STATE_COLOR_VARS[item.status]}` }}
      >
        <div className={styles.cardHeader}>
          <span className={styles.categoryBadge}>{formatCategoryLabel(item.category)}</span>
          <span
            className={styles.stateBadge}
            style={{ background: STATE_COLOR_VARS[item.status], color: '#fff' }}
          >
            {STATE_LABELS[item.status]}
          </span>
        </div>
        <h3 className={styles.cardTitle}>{item.title ?? 'Untitled Decision'}</h3>
        <p className={styles.cardMeta}>{formatRelativeTime(item.updated_at)}</p>
        {priority && (
          <p className={styles.priorityPrompt} style={{ color: priority.accentColorVar }}>
            {priority.message}
          </p>
        )}
        <div className={styles.cardFooter}>
          {item.summary.alternatives_count !== null && (
            <span className={styles.metaItem}>
              {item.summary.alternatives_count} alternative
              {item.summary.alternatives_count === 1 ? '' : 's'}
            </span>
          )}
          {item.summary.has_recommendation && (
            <span className={styles.metaItem}>Recommendation ready</span>
          )}
          {item.status === DecisionStatus.COMPLETED && item.summary.outcome_satisfaction !== null && (
            <span
              className={styles.metaItem}
              aria-label={`${item.summary.outcome_satisfaction} out of 5 stars`}
            >
              {renderStars(item.summary.outcome_satisfaction)}
            </span>
          )}
        </div>
      </Card>
    </Link>
  )
}

function DecisionGroup({ label, items }: { label: string; items: DecisionHistoryItem[] }): JSX.Element | null {
  if (items.length === 0) return null
  return (
    <div className={styles.group}>
      <h2 className={styles.groupHeader}>{label}</h2>
      <div className={styles.cardList}>
        {items.map(item => (
          <DecisionCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

export function History({ filters, emptyStateVariant, onClearFilters }: Props): JSX.Element {
  const router = useRouter()
  const [items, setItems] = useState<DecisionHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [planLimit, setPlanLimit] = useState(false)

  const fetchHistory = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/decision/history${buildQueryString(filters)}`)
      const data: HistoryResponse = await res.json()
      if (data.error) throw new Error(data.error)
      setItems(data.decisions)
      setPlanLimit(data.plan_limit)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load decisions')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (isLoading) {
    return (
      <div className={styles.cardList} aria-busy="true" aria-live="polite">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div key={i} className={styles.skeletonCard} aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.emptyHeading}>Couldn&apos;t load your decisions.</h2>
        <p className={styles.emptyBody}>{error}</p>
        <Button variant="secondary" size="md" onClick={fetchHistory}>
          Try again
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    if (hasActiveFilters(filters)) {
      return (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyHeading}>No decisions match this filter.</h2>
          <p className={styles.emptyBody}>
            Try adjusting your filters or clearing them to see all your decisions.
          </p>
          {onClearFilters && (
            <Button variant="ghost" size="md" onClick={onClearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )
    }

    if (emptyStateVariant === 'dashboard') {
      return (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyHeading}>Your first decision is waiting.</h2>
          <p className={styles.emptyBody}>
            Start here and DecisionOS will guide you through the rest. No setup. No onboarding.
          </p>
          <Button variant="primary" size="lg" onClick={() => router.push('/decision/new')}>
            Start a Decision
          </Button>
        </div>
      )
    }

    return (
      <div className={styles.emptyState}>
        <h2 className={styles.emptyHeading}>No completed decisions yet.</h2>
        <p className={styles.emptyBody}>
          When you complete a decision and record the outcome, it appears here.
        </p>
      </div>
    )
  }

  const groups = groupDecisions(items)

  return (
    <div>
      <DecisionGroup label="Needs your attention" items={groups.needsAttention} />
      <DecisionGroup label="Active" items={groups.active} />
      <DecisionGroup label="Completed" items={groups.completed} />
      <DecisionGroup label="Archived" items={groups.archived} />

      {planLimit && (
        <Card className={styles.upgradePrompt}>
          <p className={styles.upgradeText}>
            You&apos;ve reached the Free plan limit of 10 saved decisions. Upgrade to see your full
            history.
          </p>
          <Button variant="primary" size="md" onClick={() => router.push('/account')}>
            Upgrade plan
          </Button>
        </Card>
      )}
    </div>
  )
}
