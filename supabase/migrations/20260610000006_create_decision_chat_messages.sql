-- Migration: 20260610000006_create_decision_chat_messages.sql
-- IR01-020: Create the decision_chat_messages table

create table public.decision_chat_messages (
  id          uuid        not null default gen_random_uuid(),
  decision_id uuid        not null,
  role        text        not null,
  content     text        not null,
  created_at  timestamptz not null default now(),

  constraint decision_chat_messages_pkey
    primary key (id),
  constraint decision_chat_messages_decision_id_fkey
    foreign key (decision_id) references public.decisions(id) on delete cascade,
  constraint decision_chat_messages_role_check
    check (role in ('user', 'assistant'))
);

alter table public.decision_chat_messages enable row level security;

-- Primary access pattern: all messages for a Decision, in order
create index if not exists idx_decision_chat_messages_decision_order
  on public.decision_chat_messages (decision_id, created_at asc);

drop policy if exists "decision_chat_messages_select_own" on public.decision_chat_messages;
create policy "decision_chat_messages_select_own"
  on public.decision_chat_messages
  for select
  using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_chat_messages.decision_id
        and d.owner_id = auth.uid()
    )
  );

drop policy if exists "decision_chat_messages_insert_own" on public.decision_chat_messages;
create policy "decision_chat_messages_insert_own"
  on public.decision_chat_messages
  for insert
  with check (
    exists (
      select 1 from public.decisions d
      where d.id = decision_chat_messages.decision_id
        and d.owner_id = auth.uid()
    )
  );
