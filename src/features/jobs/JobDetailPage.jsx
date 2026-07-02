import { useParams, useNavigate } from 'react-router-dom'
import { useWalletContext } from '../../app/providers/WalletProvider'
import { useJob } from '../../hooks/useJob'
import { Card, CardBody, PanelHeader } from '../../ui/Card'
import { Alert } from '../../ui/Alert'
import { Button } from '../../ui/Button'
import { Skeleton } from '../../ui/Skeleton'
import { CopyButton } from '../../ui/CopyButton'
import { EmptyState } from '../../ui/EmptyState'
import { formatExpiry, isExpired, shortAddr } from '../../lib/format'
import { ZERO_ADDRESS } from '../../lib/blockchain/constants'
import { IconJob, IconExternal } from '../../ui/icons'
import { JobStatusBadge } from './components/JobStatusBadge'
import { JobTimeline } from './components/JobTimeline'
import { JobActionPanel } from './components/JobActionPanel'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { account, signer, provider, addActivity, arcExplorer } = useWalletContext()
  const { job, allowance, loading, error, notFound, refresh } = useJob(provider, account, id)

  if (loading && !job) {
    return (
      <Card>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Skeleton height={28} width={180} />
            <Skeleton height={120} />
            <Skeleton height={120} />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (notFound || (!loading && !job && error)) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<IconJob width={22} height={22} />}
            title={`Job #${id} not found`}
            description="This job ID doesn't exist yet on Arc Testnet, or the RPC request failed."
            action={<Button variant="primary" onClick={() => navigate('/jobs')} style={{ marginTop: 12 }}>Back to Jobs</Button>}
          />
        </CardBody>
      </Card>
    )
  }

  if (!job) return null

  const expired = isExpired(job.expiredAt) && job.status !== 3

  return (
    <div className="two-col">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card>
          <CardBody>
            <PanelHeader icon={<IconJob width={18} height={18} />} title={`Job #${job.id}`} subtitle="ERC-8183 Agentic Commerce" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <JobStatusBadge status={job.status} label={job.statusLabel} />
              {expired && <Alert variant="warning" title="Past expiration">This job&apos;s expiration has passed.</Alert>}
            </div>

            {error && <Alert variant="error" title="Refresh failed">{error}</Alert>}

            <div className="kv-grid">
              <div className="kv-row">
                <span className="kv-label">Client</span>
                <span className="kv-value">{shortAddr(job.client)} <CopyButton value={job.client} label="" /></span>
              </div>
              <div className="kv-row">
                <span className="kv-label">Provider</span>
                <span className="kv-value">{shortAddr(job.provider)} <CopyButton value={job.provider} label="" /></span>
              </div>
              <div className="kv-row">
                <span className="kv-label">Evaluator</span>
                <span className="kv-value">
                  {job.evaluator === ZERO_ADDRESS ? 'None (client approves)' : <>{shortAddr(job.evaluator)} <CopyButton value={job.evaluator} label="" /></>}
                </span>
              </div>
              <div className="kv-row">
                <span className="kv-label">Budget</span>
                <span className="kv-value">{job.budgetFormatted} USDC</span>
              </div>
              <div className="kv-row">
                <span className="kv-label">Expiration</span>
                <span className="kv-value">{formatExpiry(job.expiredAt)}</span>
              </div>
              <div className="kv-row">
                <span className="kv-label">Hook</span>
                <span className="kv-value">{job.hook === ZERO_ADDRESS ? 'None' : <>{shortAddr(job.hook)} <CopyButton value={job.hook} label="" /></>}</span>
              </div>
              {job.createdTxHash && (
                <div className="kv-row">
                  <span className="kv-label">Creation tx</span>
                  <span className="kv-value">
                    <a href={`${arcExplorer}/tx/${job.createdTxHash}`} target="_blank" rel="noopener noreferrer" className="tx-link">
                      {shortAddr(job.createdTxHash)} <IconExternal width={12} height={12} />
                    </a>
                  </span>
                </div>
              )}
            </div>

            {job.description && (
              <div style={{ marginTop: 16 }}>
                <div className="kv-label" style={{ marginBottom: 6 }}>Description</div>
                <p className="panel-desc" style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <PanelHeader title="Progress" />
            <JobTimeline job={job} allowance={allowance} account={account} />
          </CardBody>
        </Card>
      </div>

      <JobActionPanel
        job={job}
        account={account}
        signer={signer}
        allowance={allowance}
        arcExplorer={arcExplorer}
        addActivity={addActivity}
        onChanged={refresh}
      />
    </div>
  )
}
