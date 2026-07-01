import { useState } from 'react'
import type { GetServerSideProps } from 'next'
import type { JSX } from 'react'

import { PageLayout } from '@/components/layout/PageLayout'
import { AnalysisLoading } from '@/components/ui/AnalysisLoading'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DecisionProvider } from '@/context/DecisionContext'
import { useDecision } from '@/hooks/useDecision'
import { ContextStep } from '@/features/decision-wizard/ContextStep'
import { GoalStep } from '@/features/decision-wizard/GoalStep'
import { ConstraintsStep } from '@/features/decision-wizard/ConstraintsStep'
import { AlternativesStep } from '@/features/decision-wizard/AlternativesStep'
import { RecommendationView } from '@/features/decision-wizard/RecommendationView'
import { FinalDecisionForm } from '@/features/decision-wizard/FinalDecisionForm'
import { Chat } from '@/features/decision-chat/Chat'
import { DecisionStatus } from '@/core/decision/Decision.constants'
import type { ActionPlanContent, DecisionObject } from '@/core/decision/Decision.types'

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

// readOnly is true once the decision has moved to `executing` (IR01-075b) — items stay
// visible as a record but are no longer toggleable, and there is no further confirm action
// here (IR01-075c owns what comes next).
function ActionPlanSummary({ plan, readOnly }: { plan: ActionPlanContent; readOnly: boolean }): JSX.Element {
  const { updateComponent, advanceState } = useDecision()
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const allComplete = plan.action_items.length > 0 && plan.action_items.every(item => item.completed)

  const handleToggle = (sequence: number, completed: boolean): void => {
    const nextItems = plan.action_items.map(item =>
      item.sequence === sequence
        ? { ...item, completed, completed_at: completed ? new Date().toISOString() : null }
        : item
    )
    void updateComponent('9_action_plan', { ...plan, action_items: nextItems })
  }

  const handleConfirm = async (): Promise<void> => {
    setConfirmError(null)
    setIsConfirming(true)
    try {
      await advanceState('executing')
    } catch (e) {
      setConfirmError(e instanceof Error ? e.message : 'Failed to confirm. Please try again.')
      setIsConfirming(false)
    }
  }

  return (
    <div className={styles.planWrap}>
      <p className={styles.sectionLabel}>{readOnly ? 'Executing your plan' : 'Your decision is recorded'}</p>
      <h1 className={styles.planHeading}>Here&apos;s your action plan</h1>
      <p className={styles.planSubheading}>Based on: {plan.based_on_alternative_name}</p>

      <div className={styles.planList}>
        {plan.action_items.map(item => {
          const itemBody = (
            <span className={styles.planItemBody}>
              <p
                className={[styles.planItemTitle, item.completed ? styles.planItemTitleDone : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.sequence}. {item.title}
              </p>
              <p className={styles.planItemDetail}>{item.detail}</p>
              {item.time_estimate && <p className={styles.planItemMeta}>Estimated time: {item.time_estimate}</p>}
            </span>
          )
          return (
            <Card key={item.sequence}>
              {readOnly ? (
                <div className={styles.planItemRow}>{itemBody}</div>
              ) : (
                <label className={[styles.planItemRow, styles.planItemRowInteractive].join(' ')}>
                  <input
                    type="checkbox"
                    className={styles.planItemCheckbox}
                    checked={item.completed}
                    onChange={e => handleToggle(item.sequence, e.target.checked)}
                    aria-label={`Mark "${item.title}" as complete`}
                  />
                  {itemBody}
                </label>
              )}
            </Card>
          )
        })}
      </div>

      {!readOnly && (
        <div className={styles.planConfirmRow}>
          {confirmError && <p className={styles.submitError}>{confirmError}</p>}
          <Button variant="primary" size="lg" disabled={!allComplete} loading={isConfirming} onClick={handleConfirm}>
            Confirm — Ready to Execute
          </Button>
        </div>
      )}
    </div>
  )
}

function DecisionRouter(): JSX.Element {
  const { decision, isLoading, error } = useDecision()
  const [showFinalForm, setShowFinalForm] = useState(false)
  const [showChat, setShowChat] = useState(false)

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

  let content: JSX.Element

  switch (decision.status) {
    case DecisionStatus.DRAFT:
      content = <WizardSteps decision={decision} />
      break

    case DecisionStatus.IN_ANALYSIS:
      content = <AnalysisLoading category={decision.category} title={decision.title} />
      break

    case DecisionStatus.WAITING_FOR_USER:
      content = showFinalForm ? (
        <FinalDecisionForm onCancel={() => setShowFinalForm(false)} />
      ) : (
        <RecommendationView
          decision={decision}
          onRecordDecision={() => setShowFinalForm(true)}
          onOpenChat={() => setShowChat(true)}
        />
      )
      break

    case DecisionStatus.DECISION_MADE: {
      const actionPlan = decision.components['9_action_plan']?.content as ActionPlanContent | undefined
      content = actionPlan ? (
        <ActionPlanSummary plan={actionPlan} readOnly={false} />
      ) : (
        <Card className={styles.placeholderCard}>
          <p>Your decision is recorded. The action plan couldn&apos;t be generated — you can still view your decision from the Dashboard.</p>
        </Card>
      )
      break
    }

    case DecisionStatus.EXECUTING: {
      const actionPlan = decision.components['9_action_plan']?.content as ActionPlanContent | undefined
      content = actionPlan ? (
        <ActionPlanSummary plan={actionPlan} readOnly={true} />
      ) : (
        <Card className={styles.placeholderCard}>
          <p>This decision is being executed. No action plan is available to display.</p>
        </Card>
      )
      break
    }

    // Outcome / Reflection / Completed view lands in IR01-075c — minimal placeholder until then.
    default:
      content = (
        <Card className={styles.placeholderCard}>
          <p>This decision is in the &quot;{decision.status}&quot; state.</p>
        </Card>
      )
  }

  // Chat entry point currently only reachable from RecommendationView (H08 §9) —
  // showChat only ever gets set while status is waiting_for_user.
  if (showChat) {
    return (
      <div className={styles.chatLayout}>
        <div className={styles.chatLayoutMain}>{content}</div>
        <div className={styles.chatLayoutPanel}>
          <Chat decision={decision} onClose={() => setShowChat(false)} />
        </div>
      </div>
    )
  }

  return content
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
