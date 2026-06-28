-- Migration: 20260610000000_create_decisions.sql
-- Purpose: Create the decisions table — the central entity of the
-- DecisionOS data model. One row per Decision Object per H03 and H12 §5.

create table if not exists public.decisions (
  id              uuid        not null default gen_random_uuid(),
  owner_id        uuid,
  anonymous_token text,
  category        text        not null,
  status          text        not null default 'draft',
  title           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  expires_at      timestamptz,

  constraint decisions_pkey
    primary key (id),
  constraint decisions_owner_id_fkey
    foreign key (owner_id) references auth.users(id) on delete cascade,
  constraint decisions_anonymous_token_key
    unique (anonymous_token),
  constraint decisions_status_check
    check (status in (
      'draft',
      'in_analysis',
      'waiting_for_user',
      'decision_made',
      'executing',
      'completed',
      'archived'
    )),
  constraint decisions_category_check
    check (category in (
      'financial',
      'technology',
      'health',
      'travel',
      'career',
      'insurance',
      'home',
      'education',
      'lifestyle'
    )),
  constraint decisions_owner_or_anonymous
    check (
      (owner_id is not null and anonymous_token is null and expires_at is null) or
      (owner_id is null and anonymous_token is not null and expires_at is not null)
    )
);
