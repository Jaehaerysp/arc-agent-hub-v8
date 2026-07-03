import { useWalletContext } from '../../app/providers/WalletProvider'
import { useBalances } from '../../hooks/useBalances'
import { useJobs } from '../../hooks/useJobs'
import { ActivityFeed } from '../jobs/components/ActivityFeed'
import { computeJobStats } from '../jobs/components/JobStats'
import { MissionHero } from './components/MissionHero'
import { MissionStatusStrip } from './components/MissionStatusStrip'
import { AttentionList } from './components/AttentionList'
import { YourAgentsPanel } from './components/YourAgentsPanel'
import { QuickActionsPanel } from './components/QuickActionsPanel'
import { computeMissionCells, computeAttentionItems, computeMissionSummary } from './dashboardLogic'

export default function DashboardPage() {
  const wallet = useWalletContext()
  const { anvBalance, loading: balancesLoading } = useBalances(wallet.provider, wallet.account)
  const { jobs, loading: jobsLoading, error: jobsError, refresh } = useJobs(wallet.provider, wallet.account)

  const jobStats = computeJobStats(jobs)
  const cells = computeMissionCells({ wallet, jobs, jobsError, jobStats })
  const attentionItems = computeAttentionItems({ wallet, jobs, jobsError })
  const summary = computeMissionSummary({ jobStats, attentionItems })
  const trustCell = cells.find((c) => c.key === 'trust')

  return (
    <div className="mission-control">
      {/* 1. Where am I? */}
      <MissionHero wallet={wallet} summary={summary} anvBalance={anvBalance} balancesLoading={balancesLoading} />

      {/* 2. Is everything healthy? */}
      <MissionStatusStrip cells={cells} loading={jobsLoading && jobs.length === 0} />

      {/* 3. What needs my attention? */}
      <section className="mc-section">
        <div className="mc-section-title">Needs your attention</div>
        <AttentionList items={attentionItems} onSwitchNetwork={wallet.switchToArc} onRefreshJobs={refresh} />
      </section>

      {/* 4. What is happening? + 5. What do I own? — side by side, same glance */}
      <div className="mc-split">
        <section className="mc-section">
          <div className="mc-section-title">Live activity</div>
          <ActivityFeed
            activity={wallet.activity}
            arcExplorer={wallet.arcExplorer}
            limit={6}
            emptyTitle="No activity yet"
            emptyDescription="Register an agent, submit feedback, or send a transfer to see it show up here."
          />
        </section>

        <section className="mc-section">
          <div className="mc-section-title">Your agents</div>
          <YourAgentsPanel wallet={wallet} trustCell={trustCell} jobsRunning={jobsLoading ? '—' : jobStats.funded + jobStats.submitted} />
        </section>
      </div>

      {/* 6. What should I do next? */}
      <section className="mc-section">
        <div className="mc-section-title">Quick actions</div>
        <QuickActionsPanel />
      </section>
    </div>
  )
}
