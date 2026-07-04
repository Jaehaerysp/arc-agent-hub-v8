import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../../ui/Card'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { AgentIdentityMark } from '../../../ui/AgentIdentityMark'
import { AvailabilityBadge } from '../../../ui/AvailabilityBadge'
import { isAtCapacity } from '../../../lib/agentAvailability'
import { shortAddr } from '../../../lib/format'
import { TrustSnapshot } from './TrustSnapshot'
import { SkillList } from './SkillList'

/**
 * Marketplace tile — an editorial "hiring profile," not a product listing.
 * Identity + specialty lead; reputation (as a trust bar, not stars) comes
 * before the rate; the rate itself is deliberately the smallest fact on
 * the card (UI Blueprint §2.10).
 *
 * Accessibility note: the card is a static container, not itself a click
 * target — "View Profile" and "Hire" are real <button> elements and the
 * only interactive controls here. An earlier draft made the whole card a
 * role="link" click target, but that nests interactive buttons inside
 * another interactive element, which is invalid ARIA (a link/button must
 * not contain further interactive descendants) and confuses both screen
 * readers and keyboard tabbing. Two explicit, clearly labeled buttons are
 * simpler and fully accessible.
 */
export function AgentCard({ agent }) {
  const navigate = useNavigate()
  const atCapacity = isAtCapacity(agent.availability)

  const handleHire = () => {
    if (atCapacity) return
    navigate('/jobs/create', { state: { provider: agent.wallet, agentName: agent.name } })
  }

  const goToProfile = () => navigate(`/agents/${agent.wallet}`)

  return (
    <Card interactive className={`agent-card ${atCapacity ? 'is-at-capacity' : ''}`}>
      <CardBody>
        <div className="agent-card-header">
          <AgentIdentityMark seed={agent.wallet} size={44} />
          <div className="agent-card-heading">
            <div className="agent-card-name-row">
              <span className="agent-card-name">{agent.name}</span>
              <AvailabilityBadge availability={agent.availability} />
            </div>
            <Badge variant="accent">{agent.category}</Badge>
          </div>
        </div>

        <SkillList specialty={agent.specialty} skills={agent.skills} limit={2} />

        <TrustSnapshot agent={agent} compact />

        <div className="agent-card-rate">
          <span>{agent.averageBudget} USDC / job</span>
          <span className="agent-card-wallet mono">{shortAddr(agent.wallet)}</span>
        </div>

        <div className="agent-card-actions">
          <Button variant="ghost" size="sm" className="btn-block" onClick={goToProfile} aria-label={`View profile for ${agent.name}`}>
            View Profile
          </Button>
          {atCapacity ? (
            <Button variant="ghost" size="sm" className="btn-block" disabled aria-label={`${agent.name} is at capacity`}>
              At capacity
            </Button>
          ) : (
            <Button variant="primary" size="sm" className="btn-block" onClick={handleHire} aria-label={`Hire ${agent.name}`}>
              Hire →
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
