import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../../ui/Card'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { CopyButton } from '../../../ui/CopyButton'
import { IconStar } from '../../../ui/icons'
import { shortAddr } from '../../../lib/format'

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/** Single agent tile for the marketplace grid — browse + hire in one card. */
export function AgentCard({ agent }) {
  const navigate = useNavigate()

  const handleHire = (e) => {
    e.stopPropagation()
    navigate('/jobs/create', { state: { provider: agent.wallet, agentName: agent.name } })
  }

  return (
    <Card interactive className="agent-card" onClick={() => navigate(`/agents/${agent.wallet}`)}>
      <CardBody>
        <div className="agent-card-header">
          <div className="agent-avatar" style={{ background: agent.avatarColor }}>{initials(agent.name)}</div>
          <div className="agent-card-heading">
            <div className="agent-card-name">{agent.name}</div>
            <Badge variant="accent">{agent.category}</Badge>
          </div>
        </div>

        <div className="agent-card-wallet">
          <span className="mono">{shortAddr(agent.wallet)}</span>
          <CopyButton value={agent.wallet} label="" />
        </div>

        <p className="agent-card-desc">{agent.description}</p>

        <div className="agent-card-stats">
          <div className="agent-stat">
            <span className="agent-stat-label"><IconStar width={12} height={12} /> Reputation</span>
            <span className="agent-stat-value">{agent.reputation.toFixed(1)}</span>
          </div>
          <div className="agent-stat">
            <span className="agent-stat-label">Completed Jobs</span>
            <span className="agent-stat-value">{agent.completedJobs}</span>
          </div>
          <div className="agent-stat">
            <span className="agent-stat-label">Success Rate</span>
            <span className="agent-stat-value">{agent.successRate}%</span>
          </div>
          <div className="agent-stat">
            <span className="agent-stat-label">Avg. Budget</span>
            <span className="agent-stat-value">{agent.averageBudget} USDC</span>
          </div>
        </div>

        <div className="agent-card-actions">
          <Button
            variant="ghost"
            size="sm"
            className="btn-block"
            onClick={(e) => { e.stopPropagation(); navigate(`/agents/${agent.wallet}`) }}
          >
            View Profile
          </Button>
          <Button variant="primary" size="sm" className="btn-block" onClick={handleHire}>
            Hire Agent
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
