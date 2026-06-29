-- Migration: 20260610000007_create_insert_chat_exchange.sql
-- IR01-021: Atomic pair insertion for chat messages (FR-07.7)
-- CREATE OR REPLACE makes this idempotent.

CREATE OR REPLACE FUNCTION public.insert_chat_exchange(
  p_decision_id       uuid,
  p_user_content      text,
  p_assistant_content text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.decision_chat_messages (decision_id, role, content)
  VALUES (p_decision_id, 'user', p_user_content);

  INSERT INTO public.decision_chat_messages (decision_id, role, content)
  VALUES (p_decision_id, 'assistant', p_assistant_content);
END;
$$;
