import { useNavigate } from 'react-router-dom'
import { JobStatusBadge } from './JobStatusBadge'
import { Button } from '../../../ui/Button'
import { shortAddr, formatDate, formatTime } from '../../../lib/format'
import { IconExternal } from '../../../ui/icons'

export function JobsTable({ jobs, account, arcExplorer }) {
  const navigate = useNavigate()

  return (
    <div className="jobs-table-wrap">
      <table className="jobs-table">
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Status</th>
            <th>Client</th>
            <th>Provider</th>
            <th>Budget</th>
            <th>Created</th>
            <th>Explorer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const isClient = account && job.client.toLowerCase() === account.toLowerCase()
            const isProvider = account && job.provider.toLowerCase() === account.toLowerCase()
            return (
              <tr key={job.id} className="jobs-table-row" onClick={() => navigate(`/jobs/${job.id}`)}>
                <td className="mono">#{job.id}</td>
                <td><JobStatusBadge status={job.status} label={job.statusLabel} /></td>
                <td className="mono">
                  {shortAddr(job.client)}
                  {isClient && <span className="role-pill client" style={{ marginLeft: 6 }}>You</span>}
                </td>
                <td className="mono">
                  {shortAddr(job.provider)}
                  {isProvider && <span className="role-pill provider" style={{ marginLeft: 6 }}>You</span>}
                </td>
                <td className="mono">{job.budgetFormatted} USDC</td>
                <td>{job.createdAt ? <>{formatDate(job.createdAt)} <span className="text-muted">{formatTime(job.createdAt)}</span></> : '—'}</td>
                <td>
                  {job.createdTxHash ? (
                    <a
                      href={`${arcExplorer}/tx/${job.createdTxHash}`}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tx-link"
                      title="View creation tx on ArcScan"
                    >
                      <IconExternal width={13} height={13} />
                    </a>
                  ) : '—'}
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`) }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
