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

import styles from './history.module.css'

const STATUS_OPTIONS: Array<{ value: DecisionStatusType; label: string }> = [
  { value: DecisionStatus.DRAFT, label: 'Draft' },
  { value: DecisionStatus.IN_ANALYSIS, label: 'In Analysis' },
  { value: DecisionStatus.WAITING_FOR_USER, label: 'Waiting for You' },
  { value: DecisionStatus.DECISION_MADE, label: 'Decision Made' },
  { value: DecisionStatus.EXECUTING, label: 'Executing' },
  { value: DecisionStatus.COMPLETED, label: 'Completed' },
  { value: DecisionStatus.ARCHIVED, label: 'Archived' },
]

const CATEGORY_OPTIONS: DecisionCategoryType[] = Object.values(DecisionCategory)

export default function HistoryPage(): JSX.Element {
  const [statusFilter, setStatusFilter] = useState<DecisionStatusType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<DecisionCategoryType | 'all'>('all')
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')

  const filters: HistoryFilters = useMemo(
    () => ({
      status: statusFilter === 'all' ? undefined : [statusFilter],
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      created_from: createdFrom || undefined,
      created_to: createdTo || undefined,
      order: 'updated_desc',
    }),
    [statusFilter, categoryFilter, createdFrom, createdTo]
  )

  const handleClearFilters = (): void => {
    setStatusFilter('all')
    setCategoryFilter('all')
    setCreatedFrom('')
    setCreatedTo('')
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

          <div className={inputStyles.wrapper}>
            <label htmlFor="created-from" className={inputStyles.label}>
              Created from
              <span className={inputStyles.optional}>(optional)</span>
            </label>
            <input
              id="created-from"
              type="date"
              className={inputStyles.input}
              value={createdFrom}
              onChange={e => setCreatedFrom(e.target.value)}
            />
          </div>

          <div className={inputStyles.wrapper}>
            <label htmlFor="created-to" className={inputStyles.label}>
              Created to
              <span className={inputStyles.optional}>(optional)</span>
            </label>
            <input
              id="created-to"
              type="date"
              className={inputStyles.input}
              value={createdTo}
              onChange={e => setCreatedTo(e.target.value)}
            />
          </div>
        </aside>

        <section className={styles.listColumn}>
          <h1 className={styles.heading}>History</h1>
          <History filters={filters} emptyStateVariant="history" onClearFilters={handleClearFilters} />
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
