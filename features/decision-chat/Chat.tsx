import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import { useRouter } from 'next/router'

import { Button } from '@/components/ui/Button'
import { useDecision } from '@/hooks/useDecision'
import { useSubscription } from '@/hooks/useSubscription'
import type { DecisionCategory } from '@/core/decision/Decision.constants'
import type { DecisionObject } from '@/core/decision/Decision.types'

import styles from './Chat.module.css'

interface Props {
  decision: DecisionObject
  onClose: () => void
}

interface MaterialChange {
  summary: string
  component: string | null
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  status: 'sent' | 'sending' | 'failed'
  materialChange?: MaterialChange | null
}

const MAX_MESSAGE_LENGTH = 1000

const COMPONENT_LABELS: Record<string, string> = {
  '1_context': 'Context',
  '2_goal': 'Goal',
  '3_constraints': 'Constraints',
  '4_alternatives': 'Alternatives',
}

function formatCategoryLabel(category: DecisionCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function formatComponentLabel(component: string | null): string {
  if (!component) return 'Decision'
  return COMPONENT_LABELS[component] ?? component
}

export function Chat({ decision, onClose }: Props): JSX.Element {
  const router = useRouter()
  const { advanceState } = useDecision()
  const { plan, loading: planLoading } = useSubscription()
  const canChat = plan === 'pro' || plan === 'premium'

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history (H13 §3.6 / GET /api/decision/chat/[id]) — skipped for Free plan.
  useEffect(() => {
    if (planLoading) return
    if (!canChat) {
      setIsLoadingHistory(false)
      return
    }
    let cancelled = false
    async function loadHistory(): Promise<void> {
      try {
        const res = await fetch(`/api/decision/chat/${decision.id}`)
        const data: {
          messages?: Array<{ id: string; role: 'user' | 'assistant'; content: string }>
          error?: string
        } = await res.json()
        if (data.error) throw new Error(data.error)
        if (!cancelled) {
          setMessages((data.messages ?? []).map(m => ({ ...m, status: 'sent' as const })))
        }
      } catch (e) {
        if (!cancelled) setHistoryError(e instanceof Error ? e.message : 'Failed to load chat history')
      } finally {
        if (!cancelled) setIsLoadingHistory(false)
      }
    }
    loadHistory()
    return () => {
      cancelled = true
    }
  }, [decision.id, canChat, planLoading])

  // Auto-scroll to latest message — H08 §11
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const sendMessage = async (text: string, retryId?: string): Promise<void> => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    const userMessageId = retryId ?? crypto.randomUUID()

    if (retryId) {
      setMessages(prev => prev.map(m => (m.id === retryId ? { ...m, status: 'sending' } : m)))
    } else {
      setMessages(prev => [...prev, { id: userMessageId, role: 'user', content: trimmed, status: 'sending' }])
      setInputValue('')
    }
    setIsSending(true)

    try {
      const res = await fetch('/api/decision/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision_id: decision.id, message: trimmed }),
      })
      const data: {
        response?: string
        material_change_detected?: boolean
        material_change_summary?: string | null
        component_to_update?: string | null
        message_id?: string | null
        response_id?: string | null
        error?: string
      } = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'The AI could not respond at this time. Please try again.')
      }

      setMessages(prev => {
        const withSentUser = prev.map(m =>
          m.id === userMessageId ? { ...m, id: data.message_id ?? m.id, status: 'sent' as const } : m
        )
        return [
          ...withSentUser,
          {
            id: data.response_id ?? crypto.randomUUID(),
            role: 'assistant' as const,
            content: data.response ?? '',
            status: 'sent' as const,
            materialChange: data.material_change_detected
              ? { summary: data.material_change_summary ?? 'new information', component: data.component_to_update ?? null }
              : null,
          },
        ]
      })
    } catch {
      // Failed send — H08 §18: optimistic message stays, offers inline retry.
      setMessages(prev => prev.map(m => (m.id === userMessageId ? { ...m, status: 'failed' as const } : m)))
    } finally {
      setIsSending(false)
    }
  }

  const handleSend = (): void => {
    sendMessage(inputValue)
  }

  const handleRetry = (message: ChatMessage): void => {
    sendMessage(message.content, message.id)
  }

  const handleKeepAsContext = (messageId: string): void => {
    setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, materialChange: null } : m)))
  }

  // No dedicated "apply update" endpoint exists — the honest, minimal action available
  // today is the same backward-navigation path H08 §8 already describes: return to
  // draft so the user can edit the affected component themselves and resubmit. This does
  // NOT apply what was said in chat automatically, and does NOT trigger a new analysis by
  // itself — the copy below (UX2) must not claim either of those.
  const handleReopenForEditing = async (): Promise<void> => {
    setUpdateError(null)
    try {
      await advanceState('draft')
      onClose()
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : 'Failed to reopen this decision for editing. Please try again.')
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.contextLabel}>You are discussing your {formatCategoryLabel(decision.category)} decision</p>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close chat">
          ✕
        </button>
      </div>

      {!canChat ? (
        <div className={styles.upgradePrompt}>
          <p className={styles.upgradeHeading}>AI Chat is a Pro feature</p>
          <p className={styles.upgradeBody}>
            Upgrade to Pro or Premium to ask follow-up questions about this decision and explore your alternatives
            with AI.
          </p>
          <Button variant="primary" size="md" onClick={() => router.push('/#pricing')}>
            Upgrade plan
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.messageArea}>
            {isLoadingHistory && <p className={styles.statusText}>Loading conversation...</p>}
            {historyError && <p className={styles.errorText}>{historyError}</p>}

            {messages.map(message => (
              <div
                key={message.id}
                className={[styles.message, message.role === 'user' ? styles.messageUser : styles.messageAssistant].join(
                  ' '
                )}
              >
                <p className={styles.messageBody}>{message.content}</p>

                {message.status === 'failed' && (
                  <button type="button" className={styles.retryButton} onClick={() => handleRetry(message)}>
                    Failed to send. Retry
                  </button>
                )}

                {message.materialChange && (
                  <div className={styles.materialChangeCard}>
                    <p className={styles.materialChangeText}>
                      You mentioned {message.materialChange.summary}. If this changes your{' '}
                      {formatComponentLabel(message.materialChange.component)}, you can reopen this decision to edit
                      it yourself — you'll need to resubmit for a new AI recommendation afterward.
                    </p>
                    <div className={styles.materialChangeActions}>
                      <Button variant="secondary" size="md" onClick={handleReopenForEditing}>
                        Reopen to edit
                      </Button>
                      <Button variant="ghost" size="md" onClick={() => handleKeepAsContext(message.id)}>
                        Keep as context only
                      </Button>
                    </div>
                    {updateError && <p className={styles.errorText}>{updateError}</p>}
                  </div>
                )}
              </div>
            ))}

            {isSending && <p className={styles.statusText}>Thinking...</p>}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <textarea
              className={styles.textarea}
              value={inputValue}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Ask a question about your decision..."
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button variant="primary" size="md" disabled={!inputValue.trim() || isSending} onClick={handleSend}>
              Send
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
