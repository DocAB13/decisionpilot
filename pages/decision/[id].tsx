import { useState } from 'react'
import type { GetServerSideProps } from 'next'
import type { JSX } from 'react'

import { PageLayout } from '@/components/layout/PageLayout'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DecisionProvider } from '@/context/DecisionContext'
import { useDecision } from '@/hooks/useDecision'
import { ContextStep } from '@/features/decision-wizard/ContextStep'
import { GoalStep } from '@/features/decision-wizard/GoalStep'
import { ConstraintsStep } from '@/features/decision-wizard/ConstraintsStep'
import { AlternativesStep } from '@/features/decision-wizard/AlternativesStep'
import { DecisionStatus } from '@/core/decision/Decision.constants'
import type { DecisionObject } from '@/core/decision/Decision.types'

import styles from './[id].module.css'

interface Props {
  decisionId: string
}

type WizardStepNumber = 1 | 2 | 3 | 4

const STEP_COMPONENTS = [ContextStep, GoalStep, ConstraintsStep, AlternativesStep] as const

// Resume at the first H03 component (1-4) not yet populated; once all four
// are populated, default to the last step so the user can keep editing.
function determineStartStep(decision: DecisionObject): WizardStepNumber {
  if (!decision.components['1_context']) return 1
  if (!decision.components['2_goal']) return 2
  if (!decision.components['3_constraints']) return 3
  return 4
}

function WizardSteps({ decision }: { decision: DecisionObject }): JSX.Element {
  const [step, setStep] = useState<WizardStepNumber>(() => determineStartStep(decision))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const goBack = (): void => setStep(prev => (prev > 1 ? ((prev - 1) as WizardStepNumber) : prev))
  const goForward = (): void => setStep(prev => (prev < 4 ? ((prev + 1) as WizardStepNumber) : prev))

  // Submitting the final step hands off to the existing, already-implemented
  // POST /api/decision/analyze (IR01-049), which performs the draft → in_analysis
  // → waiting_for_user transition itself. A full reload picks up the new
  // status since DecisionContext has no exposed refetch (IR01-061 scope).
  const handleFinalContinue = async (): Promise<void> => {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/decision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision_id: decision.id }),
      })
      const data: { error?: string } = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to start analysis')
      window.location.reload()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to start analysis')
      setIsSubmitting(false)
    }
  }

  const StepComponent = STEP_COMPONENTS[step - 1]
  const isLastStep = step === 4

  return (
    <div className={styles.wizardWrap}>
      <ProgressBar currentStep={step} />
      <StepComponent
        onBack={step > 1 ? goBack : undefined}
        onSkip={goForward}
        onContinue={isLastStep ? handleFinalContinue : goForward}
      />
      {isSubmitting && <p className={styles.submitting}>Starting your analysis...</p>}
      {submitError && <p className={styles.submitError}>{submitError}</p>}
    </div>
  )
}

function DecisionRouter(): JSX.Element {
  const { decision, isLoading, error } = useDecision()

  if (isLoading) {
    return <p className={styles.loadingText}>Loading your decision...</p>
  }

  if (error || !decision) {
    return (
      <Card className={styles.placeholderCard}>
        <p>We couldn&apos;t load this decision. Please refresh the page.</p>
      </Card>
    )
  }

  switch (decision.status) {
    case DecisionStatus.DRAFT:
      return <WizardSteps decision={decision} />

    // AnalysisLoading lands in IR01-070 — minimal placeholder until then.
    case DecisionStatus.IN_ANALYSIS:
      return (
        <Card className={styles.placeholderCard}>
          <p>Your analysis is underway. This usually takes 10–20 seconds.</p>
        </Card>
      )

    // RecommendationView lands in IR01-071 — minimal placeholder until then.
    case DecisionStatus.WAITING_FOR_USER:
      return (
        <Card className={styles.placeholderCard}>
          <p>Your recommendation is ready.</p>
        </Card>
      )

    // Final Decision / Action Plan / Outcome / Reflection views land in
    // IR01-072 – IR01-075 — minimal placeholder until then.
    default:
      return (
        <Card className={styles.placeholderCard}>
          <p>This decision is in the &quot;{decision.status}&quot; state.</p>
        </Card>
      )
  }
}

export default function DecisionPage({ decisionId }: Props): JSX.Element {
  return (
    <PageLayout>
      <DecisionProvider decisionId={decisionId}>
        <DecisionRouter />
      </DecisionProvider>
    </PageLayout>
  )
}

// Fetches via the existing GET /api/decision/[id] (IR01-031), which already
// implements the session-or-anonymous_token ownership check and 404 rule —
// reused as-is rather than re-implementing it with a direct admin query.
export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const { id } = context.params as { id: string }
  const anonymousToken =
    typeof context.query.anonymous_token === 'string' ? context.query.anonymous_token : null

  const protocol = (context.req.headers['x-forwarded-proto'] as string) ?? 'http'
  const apiUrl = new URL(`/api/decision/${id}`, `${protocol}://${context.req.headers.host}`)
  if (anonymousToken) {
    apiUrl.searchParams.set('anonymous_token', anonymousToken)
  }

  const res = await fetch(apiUrl, {
    headers: { cookie: context.req.headers.cookie ?? '' },
  })

  if (res.status === 404) {
    return { notFound: true }
  }
  if (res.status === 401) {
    return {
      redirect: {
        destination: `/auth/login?return=${context.resolvedUrl}`,
        permanent: false,
      },
    }
  }

  return { props: { decisionId: id } }
}
