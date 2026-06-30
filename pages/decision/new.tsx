import type { GetServerSideProps } from 'next'
import type { JSX } from 'react'

import { PageLayout } from '@/components/layout/PageLayout'
import { Wizard } from '@/features/decision-wizard/Wizard'
import { DecisionCategory } from '@/core/decision/Decision.constants'
import type { DecisionCategory as DecisionCategoryType } from '@/core/decision/Decision.constants'

interface Props {
  category: DecisionCategoryType | null
}

const VALID_CATEGORIES = new Set<string>(Object.values(DecisionCategory))

export default function NewDecisionPage({ category }: Props): JSX.Element {
  return (
    <PageLayout>
      <Wizard category={category} />
    </PageLayout>
  )
}

// Open to anonymous users — H05 Workflow 1, IR01-065. No auth check here.
export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const raw = context.query.category
  const value = Array.isArray(raw) ? raw[0] : raw
  const category = value && VALID_CATEGORIES.has(value) ? (value as DecisionCategoryType) : null

  return { props: { category } }
}
