import { useNavigate } from 'react-router-dom'
import { useWalletContext } from '../../app/providers/WalletProvider'
import { useBalances } from '../../hooks/useBalances'
import { useJobs } from '../../hooks/useJobs'
import { StatCard } from '../../ui/StatCard'
import { Skeleton } from '../../ui/Skeleton'
import { formatTokenAmount } from '../../lib/format'
import { IconAgent, IconStar, IconShield, IconTransfer } from '../../ui/icons'
import { JobStats } from '../jobs/components/JobStats'
import { ActivityFeed } from '../jobs/components/ActivityFeed'

const QUICK_ACTIONS = [
  { path: '/agents', label: 'Register agent', desc: 'Create an on-chain identity', icon: IconAgent },
  { path: '/reputation', label: 'Give feedback', desc: 'Submit a reputation score', icon: IconStar },
  { path: '/validation', label: 'Request validation', desc: 'Ask a validator to review', icon: IconShield },
  { path: '/transfer', label: 'Send ANV', desc: 'Transfer tokens instantly', icon: IconTransfer },
]

export default function DashboardPage() {
  const wallet = useWalletContext()
  const { nativeBalance, anvBalance, loading: balancesLoading } = useBalances(wallet.provider, wallet.account)
  const { jobs, loading: jobsLoading } = useJobs(wallet.provider, wallet.account)
  const navigate = useNavigate()

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard
          label="Network"
          value={wallet.isArcNetwork ? 'Arc Testnet' : 'Wrong network'}
          accent={wallet.isArcNetwork}
          sub={wallet.isArcNetwork ? 'Connected & healthy' : 'Switch network to continue'}
        />
        <StatCard
          label="Agent ID"
          value={wallet.agentId ? `#${wallet.agentId}` : 'Not registered'}
          accent={!!wallet.agentId}
          sub={wallet.agentId ? 'Reused across features' : 'Register to get started'}
        />
        <StatCard
          label="USDC Balance"
          value={balancesLoading && nativeBalance === null ? <Skeleton width={70} height={26} /> : formatTokenAmount(nativeBalance, 4)}
          sub="Native gas token"
        />
        <StatCard
          label="ANV Balance"
          value={balancesLoading && anvBalance === null ? <Skeleton width={70} height={26} /> : formatTokenAmount(anvBalance, 4)}
          sub="ERC-20 utility token"
        />
      </div>

      <div className="dashboard-section-title">
        Job overview
        <span className="field-hint" style={{ margin: 0 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/jobs') }} className="tx-link">View all jobs →</a>
        </span>
      </div>
      <JobStats jobs={jobs} loading={jobsLoading} />

      <div className="dashboard-section-title">Quick actions</div>
      <div className="quick-actions-grid">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon
          return (
            <button key={a.path} className="quick-action" onClick={() => navigate(a.path)}>
              <div className="panel-icon-wrap" style={{ width: 32, height: 32 }}>
                <Icon width={15} height={15} />
              </div>
              <div>
                <div className="quick-action-title">{a.label}</div>
                <div className="quick-action-desc">{a.desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="dashboard-section-title">Recent activity</div>
      <ActivityFeed
        activity={wallet.activity}
        arcExplorer={wallet.arcExplorer}
        limit={8}
        emptyTitle="No activity yet"
        emptyDescription="Register an agent, submit feedback, or send a transfer to see it show up here."
      />
    </div>
  )
}
