import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'
import { IconAgent } from '../../ui/icons'
import { getAgentByWallet } from '../../data/agents'
import { AgentProfileCard } from './components/AgentProfileCard'

export default function AgentProfilePage() {
  const { wallet } = useParams()
  const navigate = useNavigate()
  const agent = getAgentByWallet(wallet)

  if (!agent) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<IconAgent width={22} height={22} />}
            title="Agent not found"
            description="This wallet address doesn't match a listed marketplace agent."
            action={<Button variant="primary" onClick={() => navigate('/agents')} style={{ marginTop: 12 }}>Back to Marketplace</Button>}
          />
        </CardBody>
      </Card>
    )
  }

  return <AgentProfileCard agent={agent} />
}
