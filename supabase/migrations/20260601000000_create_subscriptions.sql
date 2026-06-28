-- Migration: 20260601000000_create_subscriptions.sql
-- Purpose: Create the subscriptions table for storing Stripe plan state
-- per H12 §4. One row per user; written by the Stripe webhook using the
-- service_role key.

create table if not exists public.subscriptions (
  id                      uuid        not null default gen_random_uuid(),
  user_id                 uuid        not null,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan                    text        not null default 'free',
  status                  text        not null default 'active',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint subscriptions_pkey
    primary key (id),
  constraint subscriptions_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade,
  constraint subscriptions_plan_check
    check (plan in ('free', 'pro', 'premium')),
  constraint subscriptions_status_check
    check (status in ('active', 'cancelled')),
  constraint subscriptions_user_id_key
    unique (user_id)
);

-- Index for webhook lookups by Stripe Customer ID (H12 §4.4)
create index if not exists idx_subscriptions_stripe_customer_id
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

-- Enable RLS; authenticated users may read only their own row (H12 §4.5)
alter table public.subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'subscriptions'
      and policyname = 'subscriptions_select_own'
  ) then
    create policy "subscriptions_select_own"
      on public.subscriptions
      for select
      using (auth.uid() = user_id);
  end if;
end
$$;
