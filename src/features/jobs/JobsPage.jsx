import { useNavigate } from 'react-router-dom'
import { useWalletContext } from '../../app/providers/WalletProvider'
import { useJobs } from '../../hooks/useJobs'
import { Card, CardBody } from '../../ui/Card'
import { EmptyState } from '../../ui/EmptyState'
import { Button } from '../../ui/Button'
import { Skeleton } from '../../ui/Skeleton'
import { Alert } from '../../ui/Alert'
import { IconJob } from '../../ui/icons'
import { JobsTable } from './components/JobsTable'
import { JobStats } from './components/JobStats'
import { ActivityFeed } from './components/ActivityFeed'

export default function JobsPage() {
  const { account, provider, arcExplorer, activity } = useWalletContext()
  const { jobs, loading, error, refresh } = useJobs(provider, account)
  const navigate = useNavigate()

  const recentJobs = jobs.slice(0, 8)
  const jobActivity = activity.filter((a) => a.type === 'job')

  return (
    <div className="dashboard">
      <JobStats jobs={jobs} loading={loading} />

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

      <div className="dashboard-section-title">Job activity</div>
      <ActivityFeed
        activity={jobActivity}
        arcExplorer={arcExplorer}
        limit={6}
        emptyTitle="No job activity yet"
        emptyDescription="Job creation, funding, submissions and completions will show up here."
      />
    </div>
  )
}
