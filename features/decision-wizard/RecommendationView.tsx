import type { JSX } from 'react'
import { useRouter } from 'next/router'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useSubscription } from '@/hooks/useSubscription'
import type { DecisionCategory } from '@/core/decision/Decision.constants'
import type {
  AIAnalysisContent,
  AnalysisProCon,
  AnalysisRisk,
  DecisionObject,
  RecommendationContent,
  RisksContent,
} from '@/core/decision/Decision.types'

import styles from './RecommendationView.module.css'

interface Props {
  decision: DecisionObject
  onRecordDecision?: () => void
  onRetryRecommendation?: () => void
}

interface CombinedAlternative {
  id: string
  name: string
  pros: AnalysisProCon[]
  cons: AnalysisProCon[]
  risks: AnalysisRisk[]
}

function formatCategoryLabel(category: DecisionCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

// Recommended alternative (if any) is presented first; the rest keep the
// Analysis Engine's order, which itself preserves the user's input order — H08 §9.
function combineAlternatives(
  analysis: AIAnalysisContent,
  risks: RisksContent | undefined,
  recommendedId: string | null
): CombinedAlternative[] {
  const riskMap = new Map((risks?.per_alternative ?? []).map(r => [r.alternative_id, r.risks]))

  const combined = analysis.per_alternative.map(a => ({
    id: a.alternative_id,
    name: a.alternative_name,
    pros: a.pros,
    cons: a.cons,
    risks: riskMap.get(a.alternative_id) ?? [],
  }))

  if (!recommendedId) return combined

  const recommended = combined.filter(a => a.id === recommendedId)
  const rest = combined.filter(a => a.id !== recommendedId)
  return [...recommended, ...rest]
}

function ConfidenceDot({ level }: { level: RecommendationContent['confidence_level'] }): JSX.Element | null {
  if (level === 'high') return null
  return (
    <span
      className={[styles.confidenceDot, level === 'low' ? styles.confidenceDotLow : styles.confidenceDotMedium].join(
        ' '
      )}
      aria-hidden="true"
    />
  )
}

function AlternativeCard({ alt, isRecommended }: { alt: CombinedAlternative; isRecommended: boolean }): JSX.Element {
  return (
    <Card elevated={isRecommended}>
      <div className={styles.altHeader}>
        <h3 className={styles.altName}>{alt.name}</h3>
        {isRecommended && <span className={styles.recommendedBadge}>Recommended</span>}
      </div>

      {alt.pros.length > 0 && (
        <div className={styles.altSection}>
          <h4 className={[styles.altSectionHeading, styles.prosHeading].join(' ')}>Works for you</h4>
          <ul className={styles.altList}>
            {alt.pros.map((pro, i) => (
              <li key={i} className={styles.prosList}>
                <strong>{pro.title}.</strong> {pro.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      {alt.cons.length > 0 && (
        <div className={styles.altSection}>
          <h4 className={styles.altSectionHeading}>Worth noting</h4>
          <ul className={styles.altList}>
            {alt.cons.map((con, i) => (
              <li key={i}>
                <strong>{con.title}.</strong> {con.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      {alt.risks.length > 0 && (
        <div className={styles.altSection}>
          <h4 className={[styles.altSectionHeading, styles.risksHeading].join(' ')}>Watch out for</h4>
          <ul className={styles.altList}>
            {alt.risks.map((risk, i) => (
              <li key={i} className={styles.risksList}>
                <strong>{risk.title}.</strong> {risk.detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

export function RecommendationView({ decision, onRecordDecision, onRetryRecommendation }: Props): JSX.Element {
  const router = useRouter()
  const { plan } = useSubscription()

  const analysis = decision.components['5_ai_analysis']?.content as AIAnalysisContent | undefined
  const risks = decision.components['6_risks']?.content as RisksContent | undefined
  const recommendation = decision.components['7_recommendation']?.content as RecommendationContent | undefined

  const categoryLabel = formatCategoryLabel(decision.category)
  const canChat = plan === 'pro' || plan === 'premium'

  const openChat = (): void => {
    if (canChat) {
      router.push(`/decision/${decision.id}/chat`)
    } else {
      router.push('/account')
    }
  }

  if (!analysis) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Loading your recommendation...</p>
      </div>
    )
  }

  // recommendation_available: false — partial-success state (H13 §3.4 step 12).
  // Analysis and risks are saved; only the Recommendation Engine step failed.
  if (!recommendation) {
    return (
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <span className={styles.categoryLabel}>{categoryLabel}</span>
          <span className={styles.stateBadge}>Waiting for You</span>
        </div>

        <div className={styles.partialCard}>
          <h1 className={styles.partialHeading}>Your analysis is ready. The recommendation isn&apos;t yet.</h1>
          <p className={styles.partialBody}>
            The recommendation could not be generated. Your analysis is saved. You can retry, or review the
            analysis for each alternative below.
          </p>
          <Button variant="primary" size="md" onClick={() => onRetryRecommendation?.()}>
            Try again
          </Button>
        </div>

        <div className={styles.alternativesList}>
          {combineAlternatives(analysis, risks, null).map(alt => (
            <AlternativeCard key={alt.id} alt={alt} isRecommended={false} />
          ))}
        </div>
      </div>
    )
  }

  const isTie = recommendation.tie_detected
  const hasWinner = !isTie && recommendation.recommended_alternative_id !== null
  const combined = combineAlternatives(analysis, risks, recommendation.recommended_alternative_id)

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <span className={styles.categoryLabel}>{categoryLabel}</span>
        <span className={styles.stateBadge}>Waiting for You</span>
      </div>

      <div className={styles.recBlock}>
        <div className={styles.recLabelRow}>
          <span className={styles.recLabel}>Our Recommendation</span>
          <ConfidenceDot level={recommendation.confidence_level} />
        </div>

        <h1 className={styles.recWinner}>
          {isTie
            ? "It's a close call"
            : hasWinner
              ? recommendation.recommended_alternative_name
              : 'No alternative fits your constraints'}
        </h1>

        <p className={styles.recReasoning}>{isTie ? recommendation.tie_explanation : recommendation.primary_reasoning}</p>

        {recommendation.confidence_level === 'medium' && recommendation.information_request && (
          <p className={styles.confidenceNote}>
            Some information would sharpen this analysis: {recommendation.information_request}
          </p>
        )}

        {recommendation.confidence_level === 'low' && recommendation.information_request && (
          <p className={styles.confidenceNote}>
            We&apos;ve identified the best fit based on your available information, but key details are missing.{' '}
            {recommendation.information_request} This recommendation may change significantly with more detail.
          </p>
        )}

        {hasWinner && recommendation.honest_tradeoffs && (
          <div className={styles.conditionsSection}>
            <h2 className={styles.conditionsHeading}>Honest trade-offs</h2>
            <p className={styles.conditionsText}>{recommendation.honest_tradeoffs}</p>
          </div>
        )}

        {hasWinner && (
          <div className={styles.conditionsSection}>
            <h2 className={styles.conditionsHeading}>What would change this</h2>
            <p className={styles.conditionsText}>{recommendation.conditions_for_change}</p>
          </div>
        )}
      </div>

      <div className={styles.chatEntryDesktop}>
        <Button variant="secondary" size="md" onClick={openChat}>
          {canChat ? 'Explore with AI' : 'Explore with AI (Pro)'}
        </Button>
      </div>

      <div className={styles.alternativesList}>
        {combined.map(alt => (
          <AlternativeCard
            key={alt.id}
            alt={alt}
            isRecommended={hasWinner && alt.id === recommendation.recommended_alternative_id}
          />
        ))}
      </div>

      <div className={styles.ctaRowDesktop}>
        <Button variant="primary" size="lg" onClick={() => onRecordDecision?.()} style={{ width: '100%' }}>
          Record My Decision
        </Button>
      </div>

      <div className={styles.mobileFooter}>
        <Button variant="ghost" size="md" onClick={openChat}>
          {canChat ? 'Ask AI a question' : 'Ask AI a question (Pro)'}
        </Button>
        <Button variant="primary" size="lg" onClick={() => onRecordDecision?.()} style={{ width: '100%' }}>
          Record My Decision
        </Button>
      </div>
    </div>
  )
}
