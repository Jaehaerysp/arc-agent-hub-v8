import { describe, it, expect } from 'vitest'
import { computeJobStats } from '../jobs/components/JobStats'
import {
  getGreeting,
  splitJobsByRole,
  computeTrust,
  computeMissionCells,
  computeOverallStatus,
  computeAttentionItems,
  computeMissionSummary,
} from './dashboardLogic'

const ACCOUNT = '0x1111111111111111111111111111111111111111'
const OTHER = '0x2222222222222222222222222222222222222222'

function job(overrides = {}) {
  return {
    id: '1',
    client: ACCOUNT,
    provider: OTHER,
    status: 0,
    budgetFormatted: '0',
    expiredAt: String(Math.floor(Date.now() / 1000) + 3600),
    ...overrides,
  }
}

function wallet(overrides = {}) {
  return { account: ACCOUNT, agentId: '7', isArcNetwork: true, ...overrides }
}

// Mirrors how DashboardPage calls computeMissionCells — jobStats is computed
// once by the caller and passed in, not recomputed internally.
function cellsFor({ wallet: w, jobs, jobsError }) {
  return computeMissionCells({ wallet: w, jobs, jobsError, jobStats: computeJobStats(jobs) })
}

describe('getGreeting', () => {
  it('returns a morning greeting before noon', () => {
    expect(getGreeting(new Date('2026-01-01T09:00:00'))).toBe('Good morning.')
  })
  it('returns an afternoon greeting between noon and 6pm', () => {
    expect(getGreeting(new Date('2026-01-01T14:00:00'))).toBe('Good afternoon.')
  })
  it('returns an evening greeting after 6pm', () => {
    expect(getGreeting(new Date('2026-01-01T20:00:00'))).toBe('Good evening.')
  })
})

describe('splitJobsByRole', () => {
  it('buckets jobs by client vs provider, case-insensitively', () => {
    const jobs = [job({ client: ACCOUNT.toUpperCase(), provider: OTHER }), job({ client: OTHER, provider: ACCOUNT })]
    const { asClient, asProvider } = splitJobsByRole(jobs, ACCOUNT)
    expect(asClient).toHaveLength(1)
    expect(asProvider).toHaveLength(1)
  })
})

describe('computeTrust', () => {
  it('returns a null rate when nothing has settled yet', () => {
    expect(computeTrust([job({ status: 0 }), job({ status: 1 })])).toEqual({ rate: null, completed: 0, rejected: 0, settled: 0 })
  })

  it('computes a completion rate across completed + rejected jobs only', () => {
    const jobs = [job({ status: 3 }), job({ status: 3 }), job({ status: 3 }), job({ status: 4 }), job({ status: 1 })]
    expect(computeTrust(jobs)).toEqual({ rate: 75, completed: 3, rejected: 1, settled: 4 })
  })
})

describe('computeMissionCells', () => {
  it('flags an unregistered agent as a warning', () => {
    const cells = cellsFor({ wallet: wallet({ agentId: null }), jobs: [], jobsError: null })
    const agentCell = cells.find((c) => c.key === 'agentHealth')
    expect(agentCell.status).toBe('warning')
    expect(agentCell.value).toBe('Not registered')
  })

  it('flags an expired, unresolved job as attention on the Jobs Running cell', () => {
    const jobs = [job({ id: '9', status: 1, expiredAt: String(Math.floor(Date.now() / 1000) - 3600) })]
    const cells = cellsFor({ wallet: wallet(), jobs, jobsError: null })
    expect(cells.find((c) => c.key === 'jobsRunning').status).toBe('attention')
  })

  it('flags the wrong network as attention', () => {
    const cells = cellsFor({ wallet: wallet({ isArcNetwork: false }), jobs: [], jobsError: null })
    expect(cells.find((c) => c.key === 'network').status).toBe('attention')
  })

  it('flags a jobs-fetch error as a degraded System cell', () => {
    const cells = cellsFor({ wallet: wallet(), jobs: [], jobsError: 'RPC timeout' })
    expect(cells.find((c) => c.key === 'system').status).toBe('warning')
  })

  it('sums escrow across only funded + submitted jobs', () => {
    const jobs = [job({ status: 1, budgetFormatted: '10' }), job({ status: 2, budgetFormatted: '5' }), job({ status: 0, budgetFormatted: '100' })]
    const cells = cellsFor({ wallet: wallet(), jobs, jobsError: null })
    expect(cells.find((c) => c.key === 'escrow').value).toBe('15 USDC')
  })
})

describe('computeOverallStatus', () => {
  it('is healthy when every cell is healthy or neutral', () => {
    expect(computeOverallStatus([{ status: 'healthy' }, { status: 'neutral' }]).tone).toBe('healthy')
  })
  it('is warning when the worst cell is a warning', () => {
    expect(computeOverallStatus([{ status: 'healthy' }, { status: 'warning' }]).tone).toBe('warning')
  })
  it('is attention when any cell needs attention, even alongside healthy ones', () => {
    expect(computeOverallStatus([{ status: 'healthy' }, { status: 'attention' }, { status: 'warning' }]).tone).toBe('attention')
  })
})

describe('computeAttentionItems', () => {
  it('returns no items when everything is healthy and there is nothing to do', () => {
    expect(computeAttentionItems({ wallet: wallet(), jobs: [], jobsError: null })).toEqual([])
  })

  it('surfaces a network switch item before anything else', () => {
    const items = computeAttentionItems({ wallet: wallet({ isArcNetwork: false }), jobs: [], jobsError: null })
    expect(items[0].id).toBe('network')
    expect(items[0].cta).toEqual({ label: 'Switch network', action: 'switchNetwork' })
  })

  it('surfaces a register-agent item when no agent is registered', () => {
    const items = computeAttentionItems({ wallet: wallet({ agentId: null }), jobs: [], jobsError: null })
    expect(items.some((i) => i.id === 'register')).toBe(true)
  })

  it('surfaces submitted jobs the account must validate as client', () => {
    const jobs = [job({ id: '4', client: ACCOUNT, provider: OTHER, status: 2 })]
    const items = computeAttentionItems({ wallet: wallet(), jobs, jobsError: null })
    expect(items.find((i) => i.id === 'validate-4')).toBeTruthy()
  })

  it('caps the number of returned items', () => {
    const jobs = Array.from({ length: 10 }, (_, i) => job({ id: String(i), client: ACCOUNT, status: 2 }))
    const items = computeAttentionItems({ wallet: wallet(), jobs, jobsError: null }, 3)
    expect(items).toHaveLength(3)
  })
})

describe('computeMissionSummary', () => {
  it('reports nothing needs attention when the list is empty', () => {
    const summary = computeMissionSummary({ jobStats: { funded: 1, submitted: 0 }, attentionItems: [] })
    expect(summary).toBe('1 job in progress. Nothing needs you right now.')
  })

  it('pluralizes running jobs and attention items correctly', () => {
    const summary = computeMissionSummary({ jobStats: { funded: 2, submitted: 1 }, attentionItems: [{}, {}] })
    expect(summary).toBe('3 jobs in progress, 2 need your attention.')
  })
})
