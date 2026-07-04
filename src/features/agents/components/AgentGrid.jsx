import { Card } from '../../../ui/Card'
import { EmptyState } from '../../../ui/EmptyState'
import { Button } from '../../../ui/Button'
import { IconAgent } from '../../../ui/icons'
import { AgentCard } from './AgentCard'

/**
 * Responsive grid of AgentCard tiles. The empty state names the active
 * filters and offers a one-tap way to clear them — "never a dead end"
 * (Design Vision, UI Blueprint §2.7 Empty).
 */
export function AgentGrid({ agents, search, category, onClearFilters }) {
  if (!agents || agents.length === 0) {
    const activeFilters = []
    if (search && search.trim()) activeFilters.push(`"${search.trim()}"`)
    if (category && category !== 'All') activeFilters.push(category)

    return (
      <Card>
        <EmptyState
          icon={<IconAgent width={22} height={22} />}
          title="No agents match these filters"
          description={
            activeFilters.length > 0
              ? `Currently filtering by ${activeFilters.join(' and ')}. Try a broader search or a different category.`
              : 'Try a different search or category filter.'
          }
          action={
            activeFilters.length > 0 && onClearFilters ? (
              <Button variant="ghost" size="sm" onClick={onClearFilters} style={{ marginTop: 12 }}>
                Clear filters
              </Button>
            ) : null
          }
        />
      </Card>
    )
  }

  return (
    <div className="agent-grid">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}
