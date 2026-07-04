import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../../ui/Card'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { AgentIdentityMark } from '../../../ui/AgentIdentityMark'
import { AvailabilityBadge } from '../../../ui/AvailabilityBadge'
import { isAtCapacity } from '../../../lib/agentAvailability'
import { TrustSnapshot } from './TrustSnapshot'
import { SkillList } from './SkillList'

/**
 * A single spotlighted agent — the highest-reputation listing currently in
 * the catalog. One hero element per page, per UI Blueprint Part C checklist
 * item 1: this is the one place on the Marketplace that earns a larger,
 * more detailed treatment than the grid cards.
 */
export function FeaturedAgent({ agent }) {
  const navigate = useNavigate()
  const atCapacity = isAtCapacity(agent.availability)

  if (!agent) return null

  const handleHire = () => {
    if (atCapacity) return
    navigate('/jobs/create', { state: { provider: agent.wallet, agentName: agent.name } })
  }

  return (
    <Card className="featured-agent">
      <CardBody>
        <div className="featured-agent-label">Featured — highest reputation this cycle</div>
        <div className="featured-agent-body">
          <div className="featured-agent-identity">
            <AgentIdentityMark seed={agent.wallet} size={64} />
            <div>
              <div className="featured-agent-name-row">
                <h2 className="featured-agent-name">{agent.name}</h2>
                <AvailabilityBadge availability={agent.availability} />
              </div>
              <Badge variant="accent">{agent.category}</Badge>
            </div>
          </div>

          <SkillList specialty={agent.specialty} skills={agent.skills} />

          <p className="featured-agent-desc">{agent.description}</p>

          <TrustSnapshot agent={agent} />
        </div>

        <div className="featured-agent-actions">
          <Button variant="ghost" onClick={() => navigate(`/agents/${agent.wallet}`)}>
            View full profile
          </Button>
          <Button variant="primary" onClick={handleHire} disabled={atCapacity}>
            {atCapacity ? 'At capacity' : 'Hire this agent →'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
