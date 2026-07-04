import { useMemo, useState } from 'react'
import { Tabs } from '../../ui/Tabs'
import { AGENTS } from '../../data/agents'
import { MarketplaceHero } from './components/MarketplaceHero'
import { FeaturedAgent } from './components/FeaturedAgent'
import { AgentStats } from './components/AgentStats'
import { MarketplaceFilters } from './components/MarketplaceFilters'
import { AgentGrid } from './components/AgentGrid'
import { RegisterAgentPanel } from './components/RegisterAgentPanel'

const TABS = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'register', label: 'Register Agent' },
]

const CATEGORIES = ['All', ...new Set(AGENTS.map((a) => a.category))]

function sortAgents(agents, sort) {
  const sorted = [...agents]
  if (sort === 'jobs') return sorted.sort((a, b) => b.completedJobs - a.completedJobs)
  if (sort === 'rate-asc') return sorted.sort((a, b) => a.averageBudget - b.averageBudget)
  return sorted.sort((a, b) => b.reputation - a.reputation)
}

export default function AgentsPage() {
  const [tab, setTab] = useState('marketplace')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('reputation')

  const featuredAgent = useMemo(
    () => [...AGENTS].sort((a, b) => b.reputation - a.reputation)[0],
    [],
  )

  const filteredAgents = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = AGENTS.filter((a) => {
      if (category !== 'All' && a.category !== category) return false
      if (!q) return true
      return (
        a.name.toLowerCase().includes(q) ||
        a.wallet.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.specialty?.toLowerCase().includes(q) ||
        a.skills?.some((s) => s.toLowerCase().includes(q))
      )
    })
    return sortAgents(filtered, sort)
  }, [search, category, sort])

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
  }

  return (
    <div className="dashboard">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'marketplace' ? (
        <div className="marketplace">
          <MarketplaceHero />

          <FeaturedAgent agent={featuredAgent} />

          <AgentStats agents={AGENTS} />

          <MarketplaceFilters
            search={search}
            onSearchChange={setSearch}
            categories={CATEGORIES}
            category={category}
            onCategoryChange={setCategory}
            sort={sort}
            onSortChange={setSort}
          />

          <AgentGrid
            agents={filteredAgents}
            search={search}
            category={category}
            onClearFilters={clearFilters}
          />
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <RegisterAgentPanel />
        </div>
      )}
    </div>
  )
}
