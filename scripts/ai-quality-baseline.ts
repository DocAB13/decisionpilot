/**
 * IR01-054 — Phase 4 AI Quality Baseline
 * Per H11 §14 AAC-07
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/ai-quality-baseline.ts
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/ai-quality-baseline.ts --quick          (3 per category)
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/ai-quality-baseline.ts --category=financial
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/ai-quality-baseline.ts --category=technology
 */

import { buildAnalysisPrompt, buildRecommendationPrompt } from '../core/ai/prompts'
import type { DecisionAnalysisInput, RecommendationInput } from '../core/ai/prompts'
import type {
  AlternativeItem,
  AlternativesContent,
  ConstraintsContent,
  ContextContent,
  GoalContent,
} from '../core/decision/Decision.types'

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const QUICK = args.includes('--quick')
const CATEGORY_FILTER = args.find(a => a.startsWith('--category='))?.split('=')[1] ?? null

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function alt(id: string, name: string, notes: string | null = null): AlternativeItem {
  return { id, name, source: 'user_provided', user_notes: notes, attributes: {} }
}

function hard(type: 'budget' | 'time' | 'geographic' | 'other', desc: string, val?: string, unit?: string) {
  return { type, description: desc, value: val ?? null, unit: unit ?? null }
}

function soft(desc: string) {
  return { type: 'other' as const, description: desc, value: null, unit: null }
}

// ---------------------------------------------------------------------------
// Scenario type
// ---------------------------------------------------------------------------

interface Scenario {
  id: string
  label: string
  category: 'financial' | 'technology'
  context: ContextContent
  goal: GoalContent
  constraints: ConstraintsContent
  alternatives: AlternativesContent
}

// ---------------------------------------------------------------------------
// Financial Scenarios (F01–F10)
// ---------------------------------------------------------------------------

const FINANCIAL_SCENARIOS: Scenario[] = [
  {
    id: 'F01',
    label: 'Mortgage provider comparison',
    category: 'financial',
    context: {
      background: 'Buying a first home in Dublin, Ireland. Budget is tight. Existing savings cover deposit only.',
      current_situation: 'Approved for mortgage up to €350,000. Need to choose lender before offer expires.',
      prior_attempts: null,
      timing_constraints: 'Offer deadline in 3 weeks',
      geographic_market: 'Dublin, Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Minimize total interest paid over the mortgage term',
      success_criteria: 'Choose lender with lowest total repayment cost',
      time_horizon: '25 years',
      secondary_goals: ['Avoid early repayment penalties', 'Maintain payment flexibility'],
    },
    constraints: {
      hard: [hard('budget', 'Maximum monthly repayment', '1400', 'EUR/month'), hard('time', 'Must close within 3 weeks', '3', 'weeks')],
      soft: [soft('Prefer Irish lender with branch network')],
    },
    alternatives: {
      alternatives: [
        alt('F01-A', 'Bank of Ireland — Fixed 5.2% for 3 years', 'Setup fee €500'),
        alt('F01-B', 'AIB — Variable 3.8% tracker', 'Setup fee €0 but rate can increase'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'F02',
    label: 'Car financing method',
    category: 'financial',
    context: {
      background: 'Need a reliable car for daily work commute. Public transport is unreliable at off-peak hours.',
      current_situation: 'Found a 3-year-old Toyota Corolla priced at €22,000. Need to choose financing method.',
      prior_attempts: null,
      timing_constraints: 'Need car within 1 month',
      geographic_market: 'Cork, Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Acquire the vehicle while minimizing total financing cost',
      success_criteria: 'Lowest total cost of ownership over 3 years including interest',
      time_horizon: '3 years',
      secondary_goals: ['Keep emergency fund intact at €5,000'],
    },
    constraints: {
      hard: [
        hard('budget', 'Monthly payment ceiling', '400', 'EUR/month'),
        hard('budget', 'Cash available for deposit (emergency fund cannot be touched)', '8000', 'EUR'),
      ],
      soft: [],
    },
    alternatives: {
      alternatives: [
        alt('F02-A', 'Personal loan at 7.5% APR over 3 years', 'Monthly ~€680 — too high unless large deposit'),
        alt('F02-B', 'Dealer PCP at 4.9% APR, €3,000 deposit, €8,000 balloon', 'Monthly €310, balloon due year 3'),
        alt('F02-C', 'Use €8,000 savings as deposit, personal loan €14,000 at 7.5%', 'Monthly ~€440, no balloon'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'F03',
    label: 'Emergency fund placement',
    category: 'financial',
    context: {
      background: 'Have €15,000 in a current account earning 0% interest. Want to optimise return without losing liquidity.',
      current_situation: 'Employed with stable income. The €15,000 is the entire emergency fund.',
      prior_attempts: 'Tried prize bonds — returns too unpredictable.',
      timing_constraints: null,
      geographic_market: 'Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Maximise return on emergency fund while keeping it fully accessible within 48 hours',
      success_criteria: 'Interest rate above 2.5% AER with no fixed-term lock-in',
      time_horizon: 'Indefinite',
      secondary_goals: ['EU deposit guarantee coverage', 'No monthly transaction fees'],
    },
    constraints: {
      hard: [
        hard('other', 'Must access full amount within 48 hours'),
        hard('other', 'EU Deposit Guarantee Scheme coverage required'),
      ],
      soft: [soft('Prefer Irish-regulated institution')],
    },
    alternatives: {
      alternatives: [
        alt('F03-A', 'Revolut savings vault at 3.49% AER', 'Instant access, Lithuanian banking licence'),
        alt('F03-B', 'Trade Republic savings at 3.5% AER', '1 business day withdrawal, German banking licence'),
        alt('F03-C', 'AIB Online Saver at 2.0% AER', 'Same-day access, Irish regulated'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'F04',
    label: 'Pension contribution strategy',
    category: 'financial',
    context: {
      background: 'Self-employed graphic designer, no company pension. Currently saving €500/month with no retirement plan.',
      current_situation: 'Age 35, want to retire at 65. No existing pension pot.',
      prior_attempts: null,
      timing_constraints: 'Tax year deadline approaching',
      geographic_market: 'Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Build a pension pot targeting €500,000 by retirement',
      success_criteria: 'On-track trajectory reaching target by age 65',
      time_horizon: '30 years',
      secondary_goals: ['Maximise tax relief available', 'Maintain some contribution flexibility'],
    },
    constraints: {
      hard: [
        hard('budget', 'Monthly contribution budget', '500', 'EUR/month'),
        hard('time', 'Retirement age target', '65', 'years'),
      ],
      soft: [soft('Prefer Irish-regulated pension provider')],
    },
    alternatives: {
      alternatives: [
        alt('F04-A', 'Personal Retirement Savings Account (PRSA) — Irish Life', 'Low charges, tax-relieved contributions'),
        alt('F04-B', 'Self-Administered Pension (SAP) via Zurich', 'More investment control, higher setup cost'),
        alt('F04-C', 'EU-domiciled ETF portfolio via Interactive Brokers', 'No tax relief but full flexibility'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'F05',
    label: 'Health insurance provider',
    category: 'financial',
    context: {
      background: 'Currently uninsured. Considering health insurance for the first time after a minor health scare.',
      current_situation: 'Age 32, single, no dependants. Occasional GP visits. No chronic conditions.',
      prior_attempts: null,
      timing_constraints: 'Community rating lifetime community rating surcharge kicks in at 34',
      geographic_market: 'Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Get comprehensive cover at reasonable cost before community rating surcharge applies',
      success_criteria: 'Covered for inpatient, day-case, and GP within budget',
      time_horizon: 'Annual, renewable',
      secondary_goals: ['Cover physiotherapy', 'Avoid large excesses'],
    },
    constraints: {
      hard: [
        hard('budget', 'Maximum annual premium', '1200', 'EUR/year'),
        hard('time', 'Must enrol before 34th birthday', '2', 'years'),
      ],
      soft: [soft('Prefer provider with strong hospital network in Munster')],
    },
    alternatives: {
      alternatives: [
        alt('F05-A', 'VHI Healthcare — HealthPlus Extra at €950/year', 'Broad hospital network; excess €150'),
        alt('F05-B', 'Irish Life Health — Inspire at €1,050/year', 'Good day-case cover; excess €100'),
        alt('F05-C', 'Laya Healthcare — Essential at €880/year', 'Lowest cost but limited cover'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'F06',
    label: 'Debt repayment method',
    category: 'financial',
    context: {
      background: 'Three outstanding debts: credit card €3,000 at 22% APR, personal loan €8,000 at 9% APR, car loan €5,000 at 6% APR.',
      current_situation: 'Can allocate €600/month total toward debt repayment above minimum payments.',
      prior_attempts: 'Tried ignoring it — stress got too high.',
      timing_constraints: null,
      geographic_market: 'Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Become debt-free as quickly as possible while minimising total interest paid',
      success_criteria: 'All debts cleared, lowest total interest paid',
      time_horizon: '3 years',
      secondary_goals: ['Build credit score', 'Maintain minimum payment on all debts throughout'],
    },
    constraints: {
      hard: [
        hard('budget', 'Total monthly debt repayment capacity above minimums', '600', 'EUR/month'),
      ],
      soft: [soft('Prefer the psychological win of eliminating accounts quickly')],
    },
    alternatives: {
      alternatives: [
        alt('F06-A', 'Avalanche method — pay highest APR first (credit card)', 'Minimises total interest'),
        alt('F06-B', 'Snowball method — pay smallest balance first (credit card)', 'Faster visible wins'),
        alt('F06-C', 'Debt consolidation loan at 8% APR for all three debts', 'Single payment, rate between current rates'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'F07',
    label: 'Home renovation financing',
    category: 'financial',
    context: {
      background: 'Owner of a 1970s semi-detached house. BER rating F. Heating bills very high. Planning kitchen extension and insulation.',
      current_situation: 'Project quote received: €38,000. Have €10,000 savings. Own the property outright.',
      prior_attempts: null,
      timing_constraints: 'SEAI Warmer Homes grant applications open only in Jan–Mar',
      geographic_market: 'Galway, Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Fund the renovation at lowest total financing cost',
      success_criteria: 'Renovation financed within 6 months at the lowest total repayment',
      time_horizon: '5 years',
      secondary_goals: ['Maximise available government grants', 'Monthly repayment under €500'],
    },
    constraints: {
      hard: [
        hard('budget', 'Maximum monthly repayment', '500', 'EUR/month'),
        hard('budget', 'Total finance gap (after savings)', '28000', 'EUR'),
      ],
      soft: [soft('Apply for SEAI grant to reduce overall cost')],
    },
    alternatives: {
      alternatives: [
        alt('F07-A', 'Home Renovation Loan (SBCI) at 4.9% APR over 5 years', '€28k loan, ~€525/month — marginally over budget'),
        alt('F07-B', 'Personal loan at 7.5% APR over 5 years', '€28k, ~€560/month — over budget'),
        alt('F07-C', 'Combination: SEAI grant (~€8k) + SBCI loan for remainder €20k at 4.9%', '~€375/month — within budget'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'F08',
    label: 'Investment platform selection',
    category: 'financial',
    context: {
      background: 'First-time investor with €20,000 to invest. Risk tolerance: medium. No dependants.',
      current_situation: 'Savings in current account. Want to invest for 10+ years.',
      prior_attempts: null,
      timing_constraints: null,
      geographic_market: 'Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Grow €20,000 over 10 years with medium risk',
      success_criteria: 'Beat inflation, targeting 5–7% CAGR',
      time_horizon: '10 years',
      secondary_goals: ['Keep platform fees below 0.5% per year', 'Tax-efficient structure'],
    },
    constraints: {
      hard: [
        hard('budget', 'Lump sum to invest', '20000', 'EUR'),
        hard('other', 'Medium risk tolerance — no individual stock picking'),
      ],
      soft: [soft('Prefer low-fee index fund access'), soft('Mobile app preferred')],
    },
    alternatives: {
      alternatives: [
        alt('F08-A', 'Degiro — EU-listed ETFs, ~0.1% fees', 'No ISA wrapper in Ireland; exit tax applies'),
        alt('F08-B', 'Interactive Brokers — broader fund access, ~0.05% fees', 'More complex UI; IBKR Lite available'),
        alt('F08-C', 'Zurich Life Regular Investment Plan — 0.75% AMC', 'Tax-efficient; Irish investment company'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'F09',
    label: 'Business banking account',
    category: 'financial',
    context: {
      background: 'Sole trader running a freelance web development business. Monthly turnover €8,000–€12,000.',
      current_situation: 'Using personal current account for business. Accountant says to separate accounts.',
      prior_attempts: null,
      timing_constraints: 'Tax return deadline in 3 months',
      geographic_market: 'Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Open a business account that minimises fees and integrates with accounting software',
      success_criteria: 'Account open within 1 week, total fees below €30/month',
      time_horizon: 'Ongoing',
      secondary_goals: ['Xero or QuickBooks integration', 'EUR IBAN for EU clients'],
    },
    constraints: {
      hard: [
        hard('budget', 'Maximum monthly fee', '30', 'EUR/month'),
        hard('time', 'Must open within 1 week', '1', 'week'),
      ],
      soft: [soft('Prefer fully online onboarding'), soft('Debit card for business expenses')],
    },
    alternatives: {
      alternatives: [
        alt('F09-A', 'Revolut Business (Grow) — €25/month', 'Instant online opening; Xero integration; Irish IBAN'),
        alt('F09-B', 'AIB Business Current Account — €4.50/month + transaction fees', 'Physical branches; slower onboarding'),
        alt('F09-C', 'Wise Business — free basic, pay-per-use fees', 'Excellent FX; Xero integration; not EU-licensed bank'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'F10',
    label: 'Travel insurance — long-haul trip',
    category: 'financial',
    context: {
      background: 'Planning 3-week trip to Japan with partner. No pre-existing conditions.',
      current_situation: 'Trip booked — flights €1,800, accommodation €2,100. No insurance yet.',
      prior_attempts: null,
      timing_constraints: 'Departure in 6 weeks',
      geographic_market: 'Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Obtain comprehensive travel insurance at lowest cost',
      success_criteria: 'Covered for medical, cancellation, and baggage loss',
      time_horizon: '3 weeks',
      secondary_goals: ['Medical cover at least €500,000', 'Trip cancellation cover at least €4,000'],
    },
    constraints: {
      hard: [
        hard('budget', 'Maximum premium for two people', '200', 'EUR'),
        hard('other', 'Must cover Japan and include medical evacuation'),
      ],
      soft: [soft('24/7 emergency helpline'), soft('Online claims portal')],
    },
    alternatives: {
      alternatives: [
        alt('F10-A', 'AXA Travel — Multi-trip Gold at €170 for two', 'Medical €10M; cancellation €5,000; annual policy'),
        alt('F10-B', 'Aon Backpacker — Single-trip at €140 for two', 'Medical €5M; cancellation €4,000; no add-ons'),
        alt('F10-C', 'Allianz Travel — Premier at €195 for two', 'Medical €20M; cancellation €6,000; concierge included'),
      ],
      do_nothing_included: false,
    },
  },
]

// ---------------------------------------------------------------------------
// Technology Scenarios (T01–T10)
// ---------------------------------------------------------------------------

const TECHNOLOGY_SCENARIOS: Scenario[] = [
  {
    id: 'T01',
    label: 'CRM software selection',
    category: 'technology',
    context: {
      background: 'B2B SaaS startup, 5 sales reps, currently tracking leads in spreadsheets. Losing deals to follow-up gaps.',
      current_situation: 'Pipeline growing past what spreadsheets can manage. Need CRM before next sales quarter.',
      prior_attempts: 'Tried Notion for 2 months — too unstructured for sales tracking.',
      timing_constraints: 'Need operational within 2 weeks',
      geographic_market: 'Netherlands',
      currency: 'EUR',
    },
    goal: {
      primary: 'Improve pipeline visibility and reduce missed follow-ups',
      success_criteria: 'All 5 reps using tool within 2 weeks; fewer than 5% of leads go cold',
      time_horizon: '12 months',
      secondary_goals: ['Gmail integration', 'Weekly pipeline report for board'],
    },
    constraints: {
      hard: [
        hard('budget', 'Max monthly cost for 5 users', '200', 'EUR/month'),
        hard('other', 'Must integrate natively with Gmail'),
      ],
      soft: [soft('Minimal onboarding time'), soft('Mobile app for reps on the road')],
    },
    alternatives: {
      alternatives: [
        alt('T01-A', 'HubSpot CRM (Starter) — €45/month for 5 users', 'Gmail integration native; good onboarding'),
        alt('T01-B', 'Pipedrive (Essential) — €60/month for 5 users', 'Sales-focused UX; Gmail via Marketplace'),
        alt('T01-C', 'Salesforce (Starter) — €175/month for 5 users', 'Most powerful; steep learning curve'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'T02',
    label: 'Cloud hosting provider',
    category: 'technology',
    context: {
      background: 'Early-stage startup, Next.js web app + Python API. Expected traffic: 10,000 req/day initially.',
      current_situation: 'App ready to deploy from local dev. Need production infra before beta launch.',
      prior_attempts: null,
      timing_constraints: 'Beta launch in 2 weeks',
      geographic_market: 'Germany',
      currency: 'EUR',
    },
    goal: {
      primary: 'Deploy reliably with minimal DevOps overhead at low cost',
      success_criteria: '99.5% uptime, deploy under 30 minutes, cost under €100/month',
      time_horizon: '12 months',
      secondary_goals: ['Scale to 10× traffic without manual intervention', 'EU data residency for GDPR'],
    },
    constraints: {
      hard: [
        hard('budget', 'Monthly infrastructure ceiling', '100', 'EUR/month'),
        hard('geographic', 'EU data residency required (GDPR)'),
      ],
      soft: [soft('Prefer managed services over self-managed VMs'), soft('CI/CD integration')],
    },
    alternatives: {
      alternatives: [
        alt('T02-A', 'Vercel (Pro) + PlanetScale — approx €35/month', 'Zero-config Next.js; EU region available'),
        alt('T02-B', 'AWS (ECS Fargate + RDS) — approx €80/month', 'Full control; Frankfurt region; requires DevOps'),
        alt('T02-C', 'Railway.app — approx €20/month', 'Very low config; EU deployment; less mature'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'T03',
    label: 'Developer laptop purchase',
    category: 'technology',
    context: {
      background: 'Full-stack developer, primarily TypeScript and Python. Current laptop is 5 years old and struggling with large builds.',
      current_situation: 'Budget approved by employer for a replacement laptop. Need to choose model.',
      prior_attempts: null,
      timing_constraints: 'Need within 2 weeks (project deadline)',
      geographic_market: 'UK',
      currency: 'GBP',
    },
    goal: {
      primary: 'Maximise development productivity — fast builds, long battery life',
      success_criteria: 'TypeScript build under 30s, battery lasts full workday, comfortable for 8-hour use',
      time_horizon: '4 years',
      secondary_goals: ['Good keyboard', 'External monitor support (at least 2 monitors)'],
    },
    constraints: {
      hard: [
        hard('budget', 'Maximum budget approved', '2500', 'GBP'),
        hard('time', 'Must be available within 2 weeks', '2', 'weeks'),
      ],
      soft: [soft('Prefer light weight under 1.8kg'), soft('macOS or Linux preferred')],
    },
    alternatives: {
      alternatives: [
        alt('T03-A', 'Apple MacBook Pro 14" M3 Pro (18GB) — £2,199', 'Exceptional performance; great battery; macOS'),
        alt('T03-B', 'Dell XPS 15 (Intel i9, 32GB) — £2,349', 'Windows/Linux; large screen; heavier at 1.8kg'),
        alt('T03-C', 'Lenovo ThinkPad X1 Carbon Gen 12 (16GB) — £1,999', 'Light 1.1kg; Linux-friendly; good keyboard'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'T04',
    label: 'Project management tool',
    category: 'technology',
    context: {
      background: 'Engineering team of 8. Running 2-week sprints. Currently using Trello which lacks sprint velocity tracking.',
      current_situation: 'Growing team. Trello is too simple. Need structured sprint management.',
      prior_attempts: 'Tried Trello — good for kanban but no sprint metrics.',
      timing_constraints: 'New quarter starts in 3 weeks',
      geographic_market: 'Sweden',
      currency: 'EUR',
    },
    goal: {
      primary: 'Improve sprint velocity tracking and reduce planning overhead',
      success_criteria: 'Sprint velocity tracked automatically; planning meetings under 90 minutes',
      time_horizon: '12 months',
      secondary_goals: ['GitHub integration', 'Burndown charts'],
    },
    constraints: {
      hard: [
        hard('budget', 'Max monthly cost for 8 users', '100', 'EUR/month'),
      ],
      soft: [soft('Intuitive UI to avoid team resistance'), soft('Native GitHub integration')],
    },
    alternatives: {
      alternatives: [
        alt('T04-A', 'Linear — €80/month for 8 users', 'Best GitHub integration; fast UI; built for engineering'),
        alt('T04-B', 'Jira (Standard) — €64/month for 8 users', 'Industry standard; steep learning curve; rich reporting'),
        alt('T04-C', 'Shortcut — €72/month for 8 users', 'Good balance; GitHub integration; velocity tracking'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'T05',
    label: 'Video conferencing platform',
    category: 'technology',
    context: {
      background: 'Fully remote company of 20 people across 3 time zones. Current tool is Zoom but costs rising.',
      current_situation: 'Zoom contract renewal in 1 month. Evaluating alternatives.',
      prior_attempts: 'Briefly tested Google Meet — audio quality complaints.',
      timing_constraints: 'Contract renewal decision in 1 month',
      geographic_market: 'EU',
      currency: 'EUR',
    },
    goal: {
      primary: 'Maintain reliable video conferencing at lower cost',
      success_criteria: 'No audio/video quality degradation; cost reduced by at least 20%',
      time_horizon: '12 months',
      secondary_goals: ['Recording and transcription', 'Calendar integration (Google Workspace)'],
    },
    constraints: {
      hard: [
        hard('budget', 'Max monthly cost for 20 users', '400', 'EUR/month'),
        hard('other', 'Must integrate with Google Workspace calendar'),
      ],
      soft: [soft('Transcription/recording built-in'), soft('Noise cancellation')],
    },
    alternatives: {
      alternatives: [
        alt('T05-A', 'Zoom (Pro) — €300/month for 20 users', 'Current tool; reliable; Google Calendar integration'),
        alt('T05-B', 'Microsoft Teams (Essentials) — €160/month for 20 users', 'Cheaper; Google Calendar via plugin only'),
        alt('T05-C', 'Google Meet (Workspace Business Starter) — €132/month for 20 users', 'Native Google integration; previous quality complaints'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'T06',
    label: 'Accounting software for SME',
    category: 'technology',
    context: {
      background: 'Small manufacturing company, 12 employees, €2M annual turnover. Currently using spreadsheets.',
      current_situation: 'Accountant spending too much time on manual reconciliations. VAT filing error last quarter.',
      prior_attempts: 'Evaluated Sage 50 — too complex and expensive.',
      timing_constraints: 'New financial year in 2 months',
      geographic_market: 'Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Automate bank reconciliation and VAT returns',
      success_criteria: 'VAT returns filed on time without manual errors; bank reconciliation automated',
      time_horizon: '3 years',
      secondary_goals: ['Multi-user access for 2 bookkeepers', 'Integration with existing payroll system'],
    },
    constraints: {
      hard: [
        hard('budget', 'Maximum monthly subscription', '100', 'EUR/month'),
        hard('other', 'Must support Irish VAT (Revenue Online Service filing)'),
      ],
      soft: [soft('Payroll integration'), soft('Minimal training required for bookkeeping staff')],
    },
    alternatives: {
      alternatives: [
        alt('T06-A', 'Xero (Standard) — €37/month', 'Strong bank feeds; Irish VAT; no payroll built-in'),
        alt('T06-B', 'QuickBooks Online (Plus) — €70/month', 'Good VAT; payroll add-on available; well-supported in Ireland'),
        alt('T06-C', 'Surf Accounts — €45/month', 'Irish-built; Revenue integration native; smaller community'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'T07',
    label: 'Web hosting for marketing site',
    category: 'technology',
    context: {
      background: 'Marketing agency building a new client site using Next.js. Site is content-heavy, ~50 pages.',
      current_situation: 'Site ready to launch. Need hosting decision before delivery deadline.',
      prior_attempts: null,
      timing_constraints: 'Client delivery deadline in 5 days',
      geographic_market: 'UK',
      currency: 'GBP',
    },
    goal: {
      primary: 'Deploy site reliably with fast load times and zero ongoing maintenance overhead',
      success_criteria: 'Sub-1s TTFB in UK/EU; 99.9% uptime SLA; deploy in under 1 hour',
      time_horizon: '12 months',
      secondary_goals: ['Automatic preview deployments for each PR', 'Free tier or under £50/month'],
    },
    constraints: {
      hard: [
        hard('budget', 'Maximum monthly cost', '50', 'GBP/month'),
        hard('time', 'Must go live within 5 days', '5', 'days'),
      ],
      soft: [soft('Git-based deployments (GitHub)'), soft('Edge CDN for UK/EU')],
    },
    alternatives: {
      alternatives: [
        alt('T07-A', 'Vercel (Hobby) — free for personal, £20/month for team', 'Native Next.js; global edge; preview deploys'),
        alt('T07-B', 'Netlify (Pro) — £19/month', 'Good edge network; Next.js support via adapter; preview deploys'),
        alt('T07-C', 'Cloudflare Pages — free tier / £20/month', 'Fastest edge; Next.js via Cloudflare adapter; very fast CDN'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'T08',
    label: 'Email marketing platform',
    category: 'technology',
    context: {
      background: 'E-commerce brand selling artisan food products. Email list of 6,000 subscribers. Average order value €45.',
      current_situation: 'Currently on Mailchimp free tier. Outgrowing free tier limits.',
      prior_attempts: 'Using Mailchimp since launch — familiar but lacking automation.',
      timing_constraints: 'Mailchimp free tier limit hit this month',
      geographic_market: 'Ireland',
      currency: 'EUR',
    },
    goal: {
      primary: 'Increase email revenue through automated flows (abandoned cart, welcome series)',
      success_criteria: 'Abandoned cart recovery rate above 5%; email revenue up 20% in 6 months',
      time_horizon: '12 months',
      secondary_goals: ['Shopify integration', 'A/B testing for subject lines'],
    },
    constraints: {
      hard: [
        hard('budget', 'Maximum monthly spend', '120', 'EUR/month'),
        hard('other', 'Must integrate with Shopify'),
      ],
      soft: [soft('Pre-built e-commerce automation templates'), soft('Good deliverability reputation')],
    },
    alternatives: {
      alternatives: [
        alt('T08-A', 'Klaviyo (6k contacts) — €100/month', 'Best-in-class e-commerce automation; Shopify native'),
        alt('T08-B', 'Mailchimp (Standard) — €78/month', 'Familiar; Shopify integration; less powerful automation'),
        alt('T08-C', 'Omnisend (Standard) — €59/month', 'E-commerce focused; good Shopify integration; SMS included'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'T09',
    label: 'Password manager for team',
    category: 'technology',
    context: {
      background: 'Tech company of 10 people. Currently sharing credentials via Slack (security risk identified in audit).',
      current_situation: 'Security audit flagged credential sharing. Need to implement a team password manager immediately.',
      prior_attempts: null,
      timing_constraints: 'Must resolve audit finding within 2 weeks',
      geographic_market: 'Netherlands',
      currency: 'EUR',
    },
    goal: {
      primary: 'Eliminate insecure credential sharing while enabling controlled team access',
      success_criteria: 'Zero credentials shared via Slack within 2 weeks; all team members onboarded',
      time_horizon: '12 months',
      secondary_goals: ['Audit log for compliance', 'SSO integration (Google Workspace)'],
    },
    constraints: {
      hard: [
        hard('budget', 'Max monthly cost for 10 users', '60', 'EUR/month'),
        hard('time', 'Must onboard all 10 users within 2 weeks', '2', 'weeks'),
      ],
      soft: [soft('Google SSO integration'), soft('Vault sharing with granular permissions')],
    },
    alternatives: {
      alternatives: [
        alt('T09-A', '1Password Teams — €37/month for 10 users', 'Excellent UX; Google SSO; audit logs; admin console'),
        alt('T09-B', 'Bitwarden Teams — €30/month for 10 users', 'Open source; Google SSO; audit logs; more complex admin'),
        alt('T09-C', 'Dashlane Business — €60/month for 10 users', 'Good UX; dark web monitoring; SSO; highest cost'),
      ],
      do_nothing_included: false,
    },
  },
  {
    id: 'T10',
    label: 'Application performance monitoring',
    category: 'technology',
    context: {
      background: 'SaaS product with 3 microservices on AWS. Experiencing intermittent latency spikes. On-call team is flying blind.',
      current_situation: 'No existing APM. Incidents resolved by log-grepping only. MTTR averaging 2 hours.',
      prior_attempts: 'Set up CloudWatch but too noisy and hard to correlate.',
      timing_constraints: 'Another major incident would risk SLA breach',
      geographic_market: 'EU',
      currency: 'EUR',
    },
    goal: {
      primary: 'Reduce MTTR from 2 hours to under 30 minutes through better observability',
      success_criteria: 'P99 latency visible per service; alerts on latency regression; on-call confidence improved',
      time_horizon: '12 months',
      secondary_goals: ['Distributed tracing across services', 'Anomaly detection'],
    },
    constraints: {
      hard: [
        hard('budget', 'Monthly APM budget', '300', 'EUR/month'),
        hard('other', 'Must support AWS-native instrumentation'),
      ],
      soft: [soft('Low-friction instrumentation (OpenTelemetry preferred)'), soft('Good alerting UX')],
    },
    alternatives: {
      alternatives: [
        alt('T10-A', 'Datadog APM (3 hosts) — approx €270/month', 'Best-in-class; AWS integration; complex pricing'),
        alt('T10-B', 'New Relic (3 hosts, usage-based) — approx €180/month', 'Good tracing; usage-based can be cheaper; OpenTelemetry support'),
        alt('T10-C', 'Grafana Cloud (Pro) — approx €120/month', 'Open-source stack; OpenTelemetry native; steeper setup'),
      ],
      do_nothing_included: false,
    },
  },
]

// ---------------------------------------------------------------------------
// AI call helpers
// ---------------------------------------------------------------------------

const API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = 'claude-sonnet-4-6'
const TIMEOUT_MS = 45_000

function cleanJSON(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

async function callAnthropic(system: string, user: string, maxTokens: number): Promise<string> {
  if (!API_KEY) throw new Error('ANTHROPIC_API_KEY not set')

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI_TIMEOUT')), TIMEOUT_MS)
  )

  const fetchPromise = fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  }).then(async r => {
    const data = await r.json() as { type?: string; error?: { message?: string }; content?: Array<{ text?: string }> }
    if (data.type === 'error' || data.error) throw new Error(data.error?.message ?? 'Anthropic API error')
    return cleanJSON((data.content ?? []).map(b => b.text ?? '').join(''))
  })

  return Promise.race([fetchPromise, timeoutPromise])
}

// ---------------------------------------------------------------------------
// AAC-07 checkers
// ---------------------------------------------------------------------------

interface AnalysisPoint {
  point: string
  specific_to_user: boolean
  explanation: string
}

interface AnalysisOutput {
  per_alternative: Array<{
    alternative_id: string
    pros: AnalysisPoint[]
    cons: AnalysisPoint[]
    risks: AnalysisPoint[]
  }>
  market_data_caveat: string | null | undefined
}

interface RecommendationOutput {
  recommended_alternative_id: string
  primary_reasoning: string
  conditions_for_change: string
  confidence_level: string
}

function checkAAC07_1(analysis: AnalysisOutput): { pass: boolean; detail: string } {
  const failingPoints: string[] = []
  for (const alt of analysis.per_alternative ?? []) {
    for (const point of [...(alt.pros ?? []), ...(alt.cons ?? []), ...(alt.risks ?? [])]) {
      if (point.specific_to_user !== true) {
        failingPoints.push(`${alt.alternative_id}: "${point.point.slice(0, 40)}..."`)
      }
    }
  }
  return failingPoints.length === 0
    ? { pass: true, detail: 'All points specific_to_user=true' }
    : { pass: false, detail: `Non-specific points: ${failingPoints.join(', ')}` }
}

function checkAAC07_2(rec: RecommendationOutput): { pass: boolean; detail: string } {
  const pr = rec.primary_reasoning ?? ''
  const pass = pr.length >= 50
  return { pass, detail: pass ? `primary_reasoning length: ${pr.length}` : `Too short (${pr.length} chars)` }
}

function checkAAC07_3(rec: RecommendationOutput): { pass: boolean; detail: string } {
  const cfc = rec.conditions_for_change ?? ''
  const pass = cfc.length > 0
  return { pass, detail: pass ? `conditions_for_change: "${cfc.slice(0, 60)}..."` : 'Empty conditions_for_change' }
}

function checkAAC07_4(analysis: AnalysisOutput, category: string): { pass: boolean; detail: string } {
  if (!['financial', 'technology', 'insurance'].includes(category)) {
    return { pass: true, detail: 'N/A (non-financial category)' }
  }
  const caveat = analysis.market_data_caveat ?? ''
  const pass = caveat.length > 0
  return { pass, detail: pass ? `caveat: "${caveat.slice(0, 60)}..."` : 'Empty market_data_caveat' }
}

// ---------------------------------------------------------------------------
// Single scenario runner
// ---------------------------------------------------------------------------

interface ScenarioResult {
  id: string
  label: string
  category: string
  analysisValid: boolean
  recValid: boolean
  aac07_1: boolean
  aac07_4: boolean
  aac07_2: boolean
  aac07_3: boolean
  aac07_1Detail: string
  aac07_2Detail: string
  aac07_3Detail: string
  aac07_4Detail: string
  error?: string
}

async function runScenario(s: Scenario): Promise<ScenarioResult> {
  const base: ScenarioResult = {
    id: s.id, label: s.label, category: s.category,
    analysisValid: false, recValid: false,
    aac07_1: false, aac07_4: false, aac07_2: false, aac07_3: false,
    aac07_1Detail: '', aac07_2Detail: '', aac07_3Detail: '', aac07_4Detail: '',
  }

  try {
    const analysisInput: DecisionAnalysisInput = {
      decision_id: `baseline-${s.id}`,
      category: s.category,
      context: s.context,
      goal: s.goal,
      constraints: s.constraints,
      alternatives: s.alternatives,
    }

    // --- Analysis call (max 2000 tokens per H11 §4.5) ---
    const { system: aSys, user: aUser } = buildAnalysisPrompt(analysisInput)
    const analysisRaw = await callAnthropic(aSys, aUser, 2000)

    if (!analysisRaw.startsWith('{')) throw new Error('Analysis response not JSON')
    const analysis = JSON.parse(analysisRaw) as AnalysisOutput
    base.analysisValid = true

    const r1 = checkAAC07_1(analysis)
    const r4 = checkAAC07_4(analysis, s.category)
    base.aac07_1 = r1.pass
    base.aac07_1Detail = r1.detail
    base.aac07_4 = r4.pass
    base.aac07_4Detail = r4.detail

    // --- Recommendation call (max 800 tokens per H11 §4.5) ---
    const recInput: RecommendationInput = {
      decision_id: `baseline-${s.id}`,
      category: s.category,
      goal: s.goal,
      constraints: s.constraints,
      alternatives: s.alternatives,
      analysis,
    }
    const { system: rSys, user: rUser } = buildRecommendationPrompt(recInput)
    const recRaw = await callAnthropic(rSys, rUser, 800)

    if (!recRaw.startsWith('{')) throw new Error('Recommendation response not JSON')
    const rec = JSON.parse(recRaw) as RecommendationOutput
    base.recValid = true

    const r2 = checkAAC07_2(rec)
    const r3 = checkAAC07_3(rec)
    base.aac07_2 = r2.pass
    base.aac07_2Detail = r2.detail
    base.aac07_3 = r3.pass
    base.aac07_3Detail = r3.detail

    return base
  } catch (err) {
    base.error = err instanceof Error ? err.message : String(err)
    return base
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!API_KEY) {
    console.error('\n❌ ANTHROPIC_API_KEY not set. Run with:\n  ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/ai-quality-baseline.ts\n')
    process.exit(1)
  }

  let scenarios = [...FINANCIAL_SCENARIOS, ...TECHNOLOGY_SCENARIOS]

  if (CATEGORY_FILTER === 'financial') scenarios = FINANCIAL_SCENARIOS
  if (CATEGORY_FILTER === 'technology') scenarios = TECHNOLOGY_SCENARIOS
  if (QUICK) scenarios = [...FINANCIAL_SCENARIOS.slice(0, 3), ...TECHNOLOGY_SCENARIOS.slice(0, 3)]

  console.log(`\n=== DecisionOS Phase 4 AI Quality Baseline — IR01-054 ===`)
  console.log(`Running ${scenarios.length} scenario(s). Model: ${MODEL}.\n`)

  const results: ScenarioResult[] = []

  for (const s of scenarios) {
    process.stdout.write(`  [${s.id}] ${s.label.padEnd(40)} `)
    const r = await runScenario(s)
    results.push(r)
    const allPass = r.analysisValid && r.recValid && r.aac07_1 && r.aac07_2 && r.aac07_3 && r.aac07_4
    console.log(r.error ? `❌ ERROR: ${r.error}` : allPass ? '✅ PASS' : '⚠️  FAIL')
  }

  // --- AAC-07 summary table ---
  console.log('\n─────────────────────────────────────────────────────────────────────────────')
  console.log('ID   Category    Anl  Rec  AAC-07-1  AAC-07-2  AAC-07-3  AAC-07-4')
  console.log('─────────────────────────────────────────────────────────────────────────────')
  for (const r of results) {
    const p = (v: boolean) => (v ? '✅' : '❌')
    console.log(
      `${r.id.padEnd(5)}${r.category.padEnd(12)}${p(r.analysisValid)}    ${p(r.recValid)}    ${p(r.aac07_1)}         ${p(r.aac07_2)}         ${p(r.aac07_3)}         ${p(r.aac07_4)}`
    )
  }

  // --- Checklist pass/fail ---
  const aac1Pass = results.every(r => !r.analysisValid || r.aac07_1)
  const aac2Pass = results.every(r => !r.recValid || r.aac07_2)
  const aac3Pass = results.every(r => !r.recValid || r.aac07_3)
  const aac4Pass = results.filter(r => ['financial','technology','insurance'].includes(r.category)).every(r => !r.analysisValid || r.aac07_4)
  const allPassed = aac1Pass && aac2Pass && aac3Pass && aac4Pass

  console.log('\n─── AAC-07 Criteria Summary ───')
  console.log(`AAC-07-1 specific_to_user=true (all points):         ${aac1Pass ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`AAC-07-2 primary_reasoning references user inputs:   ${aac2Pass ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`AAC-07-3 conditions_for_change non-empty:            ${aac3Pass ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`AAC-07-4 market_data_caveat non-empty (fin/tech):    ${aac4Pass ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`AAC-07-5 Recommendation Acceptance Rate (55–85%):    ⏳ Requires live usage data`)
  console.log(`\nOverall baseline: ${allPassed ? '✅ PASS — Phase 5 gate cleared' : '❌ FAIL — prompt revision required before Phase 5'}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
