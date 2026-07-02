import { useNavigate } from 'react-router-dom'
import { useWalletContext } from '../../app/providers/WalletProvider'
import { useJobs } from '../../hooks/useJobs'
import { StatCard } from '../../ui/StatCard'
import { Card, CardBody } from '../../ui/Card'
import { EmptyState } from '../../ui/EmptyState'
import { Button } from '../../ui/Button'
import { Skeleton } from '../../ui/Skeleton'
import { Alert } from '../../ui/Alert'
import { formatTokenAmount } from '../../lib/format'
import { IconJob } from '../../ui/icons'
import { JobsTable } from './components/JobsTable'

export default function JobsPage() {
  const { account, provider, arcExplorer } = useWalletContext()
  const { jobs, loading, error, refresh } = useJobs(provider, account)
  const navigate = useNavigate()

  const openJobs = jobs.filter((j) => j.status === 0)
  const completedJobs = jobs.filter((j) => j.status === 3)
  const escrowLocked = jobs
    .filter((j) => j.status === 1 || j.status === 2)
    .reduce((sum, j) => sum + Number(j.budgetFormatted), 0)
  const usdcEarned = jobs
    .filter((j) => j.status === 3 && account && j.provider.toLowerCase() === account.toLowerCase())
    .reduce((sum, j) => sum + Number(j.budgetFormatted), 0)

  const recentJobs = jobs.slice(0, 8)

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard
          label="Open Jobs"
          value={loading && jobs.length === 0 ? <Skeleton width={40} height={26} /> : openJobs.length}
          sub="Awaiting budget, approval or funding"
        />
        <StatCard
          label="Completed Jobs"
          value={loading && jobs.length === 0 ? <Skeleton width={40} height={26} /> : completedJobs.length}
          accent
          sub="Fully settled on-chain"
        />
        <StatCard
          label="Escrow Locked"
          value={loading && jobs.length === 0 ? <Skeleton width={70} height={26} /> : `${formatTokenAmount(escrowLocked, 2)} USDC`}
          sub="Funded, awaiting completion"
        />
        <StatCard
          label="USDC Earned"
          value={loading && jobs.length === 0 ? <Skeleton width={70} height={26} /> : `${formatTokenAmount(usdcEarned, 2)} USDC`}
          sub="As provider, completed jobs"
        />
      </div>

      <div className="dashboard-section-title">Quick actions</div>
      <div className="quick-actions-grid">
        <button className="quick-action" onClick={() => navigate('/jobs/create')}>
          <div className="panel-icon-wrap" style={{ width: 32, height: 32 }}>
            <IconJob width={15} height={15} />
          </div>
          <div>
            <div className="quick-action-title">Create Job</div>
            <div className="quick-action-desc">Post a new ERC-8183 job</div>
          </div>
        </button>
        <button className="quick-action" onClick={refresh}>
          <div className="panel-icon-wrap" style={{ width: 32, height: 32 }}>
            <IconJob width={15} height={15} />
          </div>
          <div>
            <div className="quick-action-title">Refresh</div>
            <div className="quick-action-desc">Reload jobs from Arc Testnet</div>
          </div>
        </button>
        <button className="quick-action" onClick={() => navigate('/jobs/history')}>
          <div className="panel-icon-wrap" style={{ width: 32, height: 32 }}>
            <IconJob width={15} height={15} />
          </div>
          <div>
            <div className="quick-action-title">History</div>
            <div className="quick-action-desc">Search and filter past jobs</div>
          </div>
        </button>
      </div>

      <div className="dashboard-section-title">
        Recent jobs
        {!loading && <Button variant="ghost" size="sm" onClick={refresh}>Refresh</Button>}
      </div>

      {error && <Alert variant="error" title="Failed to load jobs">{error}</Alert>}

      <Card>
        <CardBody>
          {!error && loading && jobs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton height={36} />
              <Skeleton height={36} />
              <Skeleton height={36} />
            </div>
          ) : recentJobs.length === 0 ? (
            <EmptyState
              icon={<IconJob width={22} height={22} />}
              title="No jobs yet"
              description="Jobs where you're the client or provider will appear here."
              action={<Button variant="primary" onClick={() => navigate('/jobs/create')} style={{ marginTop: 12 }}>Create your first job</Button>}
            />
          ) : (
            <JobsTable jobs={recentJobs} account={account} arcExplorer={arcExplorer} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
