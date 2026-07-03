import { useMemo, useState } from 'react'
import { Tabs } from '../../ui/Tabs'
import { Input, Select } from '../../ui/Field'
import { AGENTS } from '../../data/agents'
import { AgentStats } from './components/AgentStats'
import { AgentGrid } from './components/AgentGrid'
import { RegisterAgentPanel } from './components/RegisterAgentPanel'

const TABS = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'register', label: 'Register Agent' },
]

const CATEGORIES = ['All', ...new Set(AGENTS.map((a) => a.category))]

export default function AgentsPage() {
  const [tab, setTab] = useState('marketplace')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filteredAgents = useMemo(() => {
    const q = search.trim().toLowerCase()
    return AGENTS.filter((a) => {
      if (category !== 'All' && a.category !== category) return false
      if (!q) return true
      return a.name.toLowerCase().includes(q) || a.wallet.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    })
  }, [search, category])

  return (
    <div className="dashboard">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'marketplace' ? (
        <div style={{ marginTop: 18 }}>
          <div className="dashboard-section-title" style={{ marginTop: 0 }}>Agent Marketplace</div>
          <p className="panel-desc" style={{ marginTop: -8 }}>
            Browse available AI agents and hire one directly into a new ERC-8183 job.
          </p>

          <AgentStats agents={AGENTS} />

          <div className="jobs-search-filters-row">
            <Input
              type="text"
              placeholder="Search by name, wallet, or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 220 }}
            />
            <Select value={category} onChange={(e) => setCategory(e.target.value)} style={{ minWidth: 180 }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>

          <AgentGrid agents={filteredAgents} />
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <RegisterAgentPanel />
        </div>
      )}
    </div>
  )
}
