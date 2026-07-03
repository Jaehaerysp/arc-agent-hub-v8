import { isExpired } from '../../lib/format'

// Severity ranking used to roll the six Mission Status cells up into one
// overall reading. 'neutral' never escalates the overall status on its own —
// it just means "informational, no judgment" (e.g. an escrow balance).
const SEVERITY_RANK = { healthy: 0, neutral: 0, warning: 1, attention: 2 }

const OVERALL_COPY = {
  healthy: { label: 'All systems nominal', tone: 'healthy' },
  warning: { label: 'Needs attention', tone: 'warning' },
  attention: { label: 'Action required', tone: 'attention' },
}

/** Good morning / afternoon / evening, based on the viewer's local clock. */
export function getGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning.'
  if (hour < 18) return 'Good afternoon.'
  return 'Good evening.'
}

/**
 * Splits every job the connected account is party to into the two roles it
 * can hold — client (hired someone) and provider (is the agent doing the
 * work) — since Mission Status and the attention list need to reason about
 * each role differently.
 */
export function splitJobsByRole(jobs, account) {
  const acct = (account || '').toLowerCase()
  const asClient = jobs.filter((j) => j.client?.toLowerCase() === acct)
  const asProvider = jobs.filter((j) => j.provider?.toLowerCase() === acct)
  return { asClient, asProvider }
}

/**
 * Trust is deliberately NOT a fabricated live read from the Reputation
 * Registry (this dashboard never invents on-chain data it hasn't fetched).
 * Instead it's an honest, derived signal from the jobs this account has
 * already delivered as a provider: of the jobs that reached a final
 * outcome, what share were Completed rather than Rejected.
 */
export function computeTrust(asProviderJobs) {
  const completed = asProviderJobs.filter((j) => j.status === 3).length
  const rejected = asProviderJobs.filter((j) => j.status === 4).length
  const settled = completed + rejected
  const rate = settled ? Math.round((completed / settled) * 100) : null
  return { rate, completed, rejected, settled }
}

/** True if a job is stuck past its expiry and nobody has resolved it yet. */
function isUnresolvedExpired(job) {
  return isExpired(job.expiredAt) && job.status !== 3
}

/**
 * The six Mission Status instrument cells: Agent Health, Jobs Running,
 * Trust, Escrow, Network, System. Each gets a status ('healthy' | 'warning'
 * | 'attention' | 'neutral') so the strip communicates health at a glance
 * without a single pie chart, gauge, or generic KPI card.
 */
export function computeMissionCells({ wallet, jobs, jobsError, jobStats }) {
  const { asProvider } = splitJobsByRole(jobs, wallet.account)
  const trust = computeTrust(asProvider)
  const expiredUnresolved = jobs.filter(isUnresolvedExpired).length
  const runningCount = jobStats.funded + jobStats.submitted

  return [
    {
      key: 'agentHealth',
      label: 'Agent Health',
      icon: 'agent',
      status: wallet.agentId ? 'healthy' : 'warning',
      value: wallet.agentId ? `Agent #${wallet.agentId}` : 'Not registered',
      sub: wallet.agentId ? 'Registered · ERC-8004' : 'Register to get started',
    },
    {
      key: 'jobsRunning',
      label: 'Jobs Running',
      icon: 'job',
      status: expiredUnresolved > 0 ? 'attention' : runningCount > 0 ? 'healthy' : 'neutral',
      value: runningCount,
      sub: expiredUnresolved > 0 ? `${expiredUnresolved} expired, unresolved` : runningCount > 0 ? 'In progress' : 'Nothing running',
    },
    {
      key: 'trust',
      label: 'Trust',
      icon: 'star',
      status: trust.rate === null ? 'neutral' : trust.rate >= 90 ? 'healthy' : trust.rate >= 70 ? 'warning' : 'attention',
      value: trust.rate === null ? '—' : `${trust.rate}%`,
      sub: trust.rate === null ? 'No completed jobs yet' : `${trust.completed} completed · ${trust.rejected} rejected`,
      percent: trust.rate,
    },
    {
      key: 'escrow',
      label: 'Escrow',
      icon: 'wallet',
      status: 'neutral',
      value: `${jobStats.totalEscrow.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`,
      sub: 'Funded + submitted jobs',
    },
    {
      key: 'network',
      label: 'Network',
      icon: 'layers',
      status: wallet.isArcNetwork ? 'healthy' : 'attention',
      value: wallet.isArcNetwork ? 'Arc Testnet' : 'Wrong network',
      sub: wallet.isArcNetwork ? 'Connected & verified' : 'Switch to continue',
    },
    {
      key: 'system',
      label: 'System',
      icon: 'activity',
      status: jobsError ? 'warning' : 'healthy',
      value: jobsError ? 'Degraded' : 'Operational',
      sub: jobsError ? 'Jobs feed retrying…' : 'All feeds live',
    },
  ]
}

/** Rolls the six cells up into one headline reading for the hero + strip header. */
export function computeOverallStatus(cells) {
  const rank = cells.reduce((max, c) => Math.max(max, SEVERITY_RANK[c.status] ?? 0), 0)
  const tone = rank === 2 ? 'attention' : rank === 1 ? 'warning' : 'healthy'
  return OVERALL_COPY[tone]
}

/**
 * "Needs your attention" — concrete action items, never a generic activity
 * feed. Ordered most-severe first, capped so the section stays scannable.
 */
export function computeAttentionItems({ wallet, jobs, jobsError }, maxItems = 5) {
  const items = []
  const { asClient } = splitJobsByRole(jobs, wallet.account)

  if (!wallet.isArcNetwork) {
    items.push({
      id: 'network',
      tone: 'attention',
      title: 'Wrong network connected',
      description: 'Switch to Arc Testnet to register, fund, or transfer.',
      cta: { label: 'Switch network', action: 'switchNetwork' },
    })
  }

  if (!wallet.agentId) {
    items.push({
      id: 'register',
      tone: 'warning',
      title: 'Register your agent',
      description: 'Create an on-chain identity before taking on jobs.',
      cta: { label: 'Register agent', to: '/agents' },
    })
  }

  jobs
    .filter(isUnresolvedExpired)
    .forEach((job) => {
      items.push({
        id: `expired-${job.id}`,
        tone: 'attention',
        title: `Job #${job.id} expired`,
        description: 'This job passed its expiry without being resolved.',
        cta: { label: 'Review job', to: `/jobs/${job.id}` },
      })
    })

  asClient
    .filter((job) => job.status === 2)
    .forEach((job) => {
      items.push({
        id: `validate-${job.id}`,
        tone: 'warning',
        title: `Job #${job.id} delivered`,
        description: 'Validate the work to release escrow to the agent.',
        cta: { label: 'Validate now', to: `/jobs/${job.id}` },
      })
    })

  if (jobsError) {
    items.push({
      id: 'jobs-error',
      tone: 'attention',
      title: "Couldn't load jobs",
      description: jobsError,
      cta: { label: 'Retry', action: 'refreshJobs' },
    })
  }

  return items.sort((a, b) => SEVERITY_RANK[b.tone] - SEVERITY_RANK[a.tone]).slice(0, maxItems)
}

/** The single sentence under the greeting — the "why you're here today" line. */
export function computeMissionSummary({ jobStats, attentionItems }) {
  const running = jobStats.funded + jobStats.submitted
  const jobsClause = running === 0 ? 'No jobs in progress' : `${running} job${running === 1 ? '' : 's'} in progress`

  if (attentionItems.length === 0) {
    return `${jobsClause}. Nothing needs you right now.`
  }
  return `${jobsClause}, ${attentionItems.length} need${attentionItems.length === 1 ? 's' : ''} your attention.`
}
