import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../../ui/Card'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { CopyButton } from '../../../ui/CopyButton'
import { EmptyState } from '../../../ui/EmptyState'
import { IconStar, IconActivity } from '../../../ui/icons'

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/** Large profile view for a single agent — used by the Agent Profile page (/agents/:wallet). */
export function AgentProfileCard({ agent }) {
  const navigate = useNavigate()

  const handleHire = () => {
    navigate('/jobs/create', { state: { provider: agent.wallet, agentName: agent.name } })
  }

  return (
    <div className="two-col">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card>
          <CardBody>
            <div className="agent-profile-header">
              <div className="agent-avatar agent-avatar-lg" style={{ background: agent.avatarColor }}>
                {initials(agent.name)}
              </div>
              <div>
                <h2 className="agent-profile-name">{agent.name}</h2>
                <Badge variant="accent">{agent.category}</Badge>
              </div>
            </div>

            <div className="agent-card-wallet" style={{ marginTop: 16 }}>
              <span className="mono">{agent.wallet}</span>
              <CopyButton value={agent.wallet} label="" />
            </div>

            <p className="panel-desc">{agent.description}</p>

            <div className="kv-grid">
              <div className="kv-row">
                <span className="kv-label agent-kv-icon-label"><IconStar width={13} height={13} /> Reputation</span>
                <span className="kv-value">{agent.reputation.toFixed(1)} / 5.0</span>
              </div>
              <div className="kv-row">
                <span className="kv-label">Completed Jobs</span>
                <span className="kv-value">{agent.completedJobs}</span>
              </div>
              <div className="kv-row">
                <span className="kv-label">Success Rate</span>
                <span className="kv-value">{agent.successRate}%</span>
              </div>
              <div className="kv-row">
                <span className="kv-label">Average Budget</span>
                <span className="kv-value">{agent.averageBudget} USDC</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="dashboard-section-title" style={{ margin: 0 }}>Recent activity</div>
            <EmptyState
              icon={<IconActivity width={20} height={20} />}
              title="No activity to show yet"
              description="This is a placeholder — on-chain job history for this agent will appear here in a future sprint."
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="dashboard-section-title" style={{ margin: 0 }}>Hire this agent</div>
          <p className="panel-desc">
            Starts a new ERC-8183 job with {agent.name} pre-filled as the provider. You can still change the
            provider address before submitting.
          </p>
          <Button variant="primary" className="btn-block" onClick={handleHire}>Hire Agent</Button>
        </CardBody>
      </Card>
    </div>
  )
}
