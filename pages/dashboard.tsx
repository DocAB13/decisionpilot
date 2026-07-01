import { useMemo, useState } from 'react'
import type { GetServerSideProps } from 'next'
import type { JSX } from 'react'

import { PageLayout } from '@/components/layout/PageLayout'
import { History } from '@/features/decision-history/History'
import type { HistoryFilters } from '@/features/decision-history/History'
import { DecisionCategory, DecisionStatus } from '@/core/decision/Decision.constants'
import type { DecisionCategory as DecisionCategoryType, DecisionStatus as DecisionStatusType } from '@/core/decision/Decision.constants'
import { createClient } from '@/lib/supabase/server'
import inputStyles from '@/components/ui/Input.module.css'
import styles from '@/components/layout/FilterLayout.module.css'

// Decisions shown on the Dashboard by default exclude Archived — H08 §4 IA
const NON_ARCHIVED_STATUSES: DecisionStatusType[] = [
  DecisionStatus.DRAFT,
  DecisionStatus.IN_ANALYSIS,
  DecisionStatus.WAITING_FOR_USER,
  DecisionStatus.DECISION_MADE,
  DecisionStatus.EXECUTING,
  DecisionStatus.COMPLETED,
]

const STATUS_OPTIONS: Array<{ value: DecisionStatusType; label: string }> = [
  { value: DecisionStatus.DRAFT, label: 'Draft' },
  { value: DecisionStatus.IN_ANALYSIS, label: 'In Analysis' },
  { value: DecisionStatus.WAITING_FOR_USER, label: 'Waiting for You' },
  { value: DecisionStatus.DECISION_MADE, label: 'Decision Made' },
  { value: DecisionStatus.EXECUTING, label: 'Executing' },
  { value: DecisionStatus.COMPLETED, label: 'Completed' },
]

const CATEGORY_OPTIONS: DecisionCategoryType[] = Object.values(DecisionCategory)

export default function DashboardPage(): JSX.Element {
  const [statusFilter, setStatusFilter] = useState<DecisionStatusType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<DecisionCategoryType | 'all'>('all')

  const filters: HistoryFilters = useMemo(
    () => ({
      status: statusFilter === 'all' ? NON_ARCHIVED_STATUSES : [statusFilter],
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      order: 'updated_desc',
    }),
    [statusFilter, categoryFilter]
  )

  const handleClearFilters = (): void => {
    setStatusFilter('all')
    setCategoryFilter('all')
  }

  return (
    <PageLayout>
      <div className={styles.layout}>
        <aside className={styles.filterPanel}>
          <h2 className={styles.filterHeading}>Filter</h2>

          <div className={inputStyles.wrapper}>
            <label htmlFor="status-filter" className={inputStyles.label}>
              Decision State
            </label>
            <select
              id="status-filter"
              className={inputStyles.input}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as DecisionStatusType | 'all')}
            >
              <option value="all">All</option>
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={inputStyles.wrapper}>
            <label htmlFor="category-filter" className={inputStyles.label}>
              Category
            </label>
            <select
              id="category-filter"
              className={inputStyles.input}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as DecisionCategoryType | 'all')}
            >
              <option value="all">All</option>
              {CATEGORY_OPTIONS.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <section className={styles.listColumn}>
          <h1 className={styles.heading}>Dashboard</h1>
          <History filters={filters} emptyStateVariant="dashboard" onClearFilters={handleClearFilters} />
        </section>
      </div>
    </PageLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  const supabase = createClient(context)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      redirect: {
        destination: `/auth/login?return=${context.resolvedUrl}`,
        permanent: false,
      },
    }
  }

  return { props: {} }
}
