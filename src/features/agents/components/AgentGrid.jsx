import { Card } from '../../../ui/Card'
import { EmptyState } from '../../../ui/EmptyState'
import { IconAgent } from '../../../ui/icons'
import { AgentCard } from './AgentCard'

/** Responsive grid of AgentCard tiles, with a shared empty state. */
export function AgentGrid({ agents }) {
  if (!agents || agents.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<IconAgent width={22} height={22} />}
          title="No agents found"
          description="Try a different search or category filter."
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
