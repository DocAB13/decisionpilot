import type { JSX } from 'react'

import { Card } from '@/components/ui/Card'
import { DecisionCategory } from '@/core/decision/Decision.constants'
import type { DecisionCategory as DecisionCategoryType } from '@/core/decision/Decision.constants'

import styles from './CategorySelect.module.css'

interface CategoryInfo {
  value: DecisionCategoryType
  icon: string
  label: string
  description: string
}

// H06 §Categories — the nine fixed Decision categories
const CATEGORIES: CategoryInfo[] = [
  { value: DecisionCategory.FINANCIAL, icon: '💰', label: 'Financial', description: 'Investments, purchases, and budgeting decisions.' },
  { value: DecisionCategory.TECHNOLOGY, icon: '💻', label: 'Technology', description: 'Devices, software, and tech purchases.' },
  { value: DecisionCategory.HEALTH, icon: '🩺', label: 'Health', description: 'Medical choices and wellbeing decisions.' },
  { value: DecisionCategory.TRAVEL, icon: '✈️', label: 'Travel', description: 'Trips, destinations, and travel plans.' },
  { value: DecisionCategory.CAREER, icon: '💼', label: 'Career', description: 'Jobs, offers, and career moves.' },
  { value: DecisionCategory.INSURANCE, icon: '🛡️', label: 'Insurance', description: 'Coverage and policy decisions.' },
  { value: DecisionCategory.HOME, icon: '🏠', label: 'Home', description: 'Housing, moving, and home decisions.' },
  { value: DecisionCategory.EDUCATION, icon: '🎓', label: 'Education', description: 'Courses, degrees, and learning paths.' },
  { value: DecisionCategory.LIFESTYLE, icon: '🌿', label: 'Lifestyle', description: 'Everyday choices that shape how you live.' },
]

interface Props {
  onSelect: (category: DecisionCategoryType) => void
  creatingCategory?: DecisionCategoryType | null
  error?: string | null
}

export function CategorySelect({
  onSelect,
  creatingCategory = null,
  error = null,
}: Props): JSX.Element {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>What are you deciding?</h1>
      <p className={styles.subheading}>Pick a category to start your Decision.</p>

      <div className={styles.grid}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            type="button"
            className={styles.cardButton}
            disabled={creatingCategory !== null}
            aria-busy={creatingCategory === cat.value || undefined}
            onClick={() => onSelect(cat.value)}
          >
            <Card className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                {cat.icon}
              </span>
              <span className={styles.label}>{cat.label}</span>
              <span className={styles.description}>{cat.description}</span>
            </Card>
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
