// Temporary mock marketplace data for Arc Agent Hub v5 Sprint 1.
//
// This is NOT wired to the ERC-8004 Identity Registry — it's a static
// catalog used to drive the browse/hire UX until real on-chain agent
// discovery ships in a later sprint. Wallet addresses below are
// well-formed but not real registered agents.
//
// v6.0.0-m4: extended (additively — every field from v5 is unchanged in
// name and meaning) with the profile/portfolio fields the redesigned
// Marketplace and Agent Profile need: a plain-language specialty line,
// a short skills list, availability, and a few "terms" facts (avg.
// delivery, response rate) that were previously only implied by
// successRate. Nothing here changes what AGENTS/getAgentByWallet return
// for existing keys — computeAgentStats() and getAgentByWallet() behavior
// is unchanged.

export const AGENTS = [
  {
    id: 'agent-research',
    name: 'Research Agent',
    category: 'Research',
    wallet: '0x2473c34e4079b239e32559f9ad3bdfc6ea82ed14',
    description:
      'Gathers, synthesizes, and summarizes information from on-chain and off-chain sources. Ideal for market research, due diligence, and competitive analysis jobs.',
    specialty: 'Market research and on-chain due diligence',
    skills: ['Due diligence', 'Competitive analysis', 'Data synthesis'],
    reputation: 4.8,
    completedJobs: 214,
    successRate: 97,
    averageBudget: 42,
    avgDeliveryHours: 5,
    responseRate: 98,
    availability: 'available',
    registered: true,
    avatarColor: '#7c5cff',
  },
  {
    id: 'agent-writing',
    name: 'Writing Agent',
    category: 'Content',
    wallet: '0x2c0ec47f413b0c4a329eabfbc0396352e8576a05',
    description:
      'Produces long- and short-form written content — articles, documentation, marketing copy — tuned to a brief and tone of voice you provide.',
    specialty: 'Long-form content tuned to a brief and tone',
    skills: ['Technical writing', 'Marketing copy', 'Editing'],
    reputation: 4.6,
    completedJobs: 356,
    successRate: 95,
    averageBudget: 28,
    avgDeliveryHours: 8,
    responseRate: 96,
    availability: 'available',
    registered: true,
    avatarColor: '#ff6bcb',
  },
  {
    id: 'agent-trading',
    name: 'Trading Agent',
    category: 'Finance',
    wallet: '0x848ee74c84cc5f365bd6dae6472f53182bf3adc3',
    description:
      'Executes and reports on trading strategies within parameters you set, with a focus on risk-managed, rules-based execution rather than discretionary calls.',
    specialty: 'Rules-based, risk-managed strategy execution',
    skills: ['Risk management', 'Strategy execution', 'Reporting'],
    reputation: 4.3,
    completedJobs: 128,
    successRate: 89,
    averageBudget: 165,
    avgDeliveryHours: 3,
    responseRate: 91,
    availability: 'busy',
    registered: true,
    avatarColor: '#34d399',
  },
  {
    id: 'agent-monitoring',
    name: 'Monitoring Agent',
    category: 'Infrastructure',
    wallet: '0x9e11e2c2762aaa50f8b79bbffadc39d4fb0a00ec',
    description:
      'Watches contracts, wallets, and endpoints for defined conditions and reports anomalies in real time. Well suited to uptime and treasury-safety jobs.',
    specialty: 'Real-time contract and endpoint monitoring',
    skills: ['Uptime monitoring', 'Treasury safety', 'Alerting'],
    reputation: 4.9,
    completedJobs: 502,
    successRate: 99,
    averageBudget: 18,
    avgDeliveryHours: 1,
    responseRate: 99,
    availability: 'available',
    registered: true,
    avatarColor: '#38bdf8',
  },
  {
    id: 'agent-translation',
    name: 'Translation Agent',
    category: 'Language',
    wallet: '0x4ec2bc0f2d4d67d24d7eecbcdec12b340a601d96',
    description:
      'Translates documents, interfaces, and support content across major world languages while preserving tone, terminology, and formatting.',
    specialty: 'Multilingual translation, tone-preserving',
    skills: ['Localization', 'Terminology consistency', 'QA review'],
    reputation: 4.7,
    completedJobs: 189,
    successRate: 96,
    averageBudget: 22,
    avgDeliveryHours: 6,
    responseRate: 95,
    availability: 'available',
    registered: true,
    avatarColor: '#fbbf24',
  },
  {
    id: 'agent-review',
    name: 'Review Agent',
    category: 'Quality Assurance',
    wallet: '0x74e3103816b29e8c56dd936277bdb25c8283af71',
    description:
      'Independently reviews deliverables — code, documents, or datasets — against a checklist or spec and returns a structured pass/fail report.',
    specialty: 'Independent deliverable review against spec',
    skills: ['Code review', 'Spec compliance', 'Structured reporting'],
    reputation: 4.5,
    completedJobs: 97,
    successRate: 93,
    averageBudget: 35,
    avgDeliveryHours: 4,
    responseRate: 94,
    availability: 'at_capacity',
    registered: true,
    avatarColor: '#f87171',
  },
]

export function getAgentByWallet(wallet) {
  if (!wallet) return null
  return AGENTS.find((a) => a.wallet.toLowerCase() === wallet.toLowerCase()) || null
}
