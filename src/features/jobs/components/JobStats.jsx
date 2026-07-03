import { StatCard } from '../../../ui/StatCard'
import { Skeleton } from '../../../ui/Skeleton'
import { formatTokenAmount } from '../../../lib/format'

/**
 * Derives the Sprint-3 dashboard numbers (Total / Open / Funded / Submitted /
 * Completed / Total Escrow / Average Budget) from a jobs array. Pure and
 * read-only — every value comes from the job objects useJobs() already
 * returns, so this never re-touches the chain.
 */
export function computeJobStats(jobs) {
  const total = jobs.length
  const open = jobs.filter((j) => j.status === 0).length
  const funded = jobs.filter((j) => j.status === 1).length
  const submitted = jobs.filter((j) => j.status === 2).length
  const completed = jobs.filter((j) => j.status === 3).length

  const totalEscrow = jobs
    .filter((j) => j.status === 1 || j.status === 2)
    .reduce((sum, j) => sum + Number(j.budgetFormatted), 0)

  const budgetsSet = jobs.filter((j) => Number(j.budgetFormatted) > 0)
  const averageBudget = budgetsSet.length
    ? budgetsSet.reduce((sum, j) => sum + Number(j.budgetFormatted), 0) / budgetsSet.length
    : 0

  return { total, open, funded, submitted, completed, totalEscrow, averageBudget }
}

/** Reusable 7-card stats grid for the Jobs dashboard. */
export function JobStats({ jobs, loading }) {
  const isEmpty = loading && jobs.length === 0
  const stats = computeJobStats(jobs)

  return (
    <div className="stats-grid stats-grid-jobs">
      <StatCard label="Total Jobs" value={isEmpty ? <Skeleton width={36} height={26} /> : stats.total} sub="Client or provider" />
      <StatCard label="Open Jobs" value={isEmpty ? <Skeleton width={36} height={26} /> : stats.open} sub="Awaiting budget or funding" />
      <StatCard label="Funded Jobs" value={isEmpty ? <Skeleton width={36} height={26} /> : stats.funded} accent sub="Escrow locked" />
      <StatCard label="Submitted Jobs" value={isEmpty ? <Skeleton width={36} height={26} /> : stats.submitted} sub="Awaiting review" />
      <StatCard label="Completed Jobs" value={isEmpty ? <Skeleton width={36} height={26} /> : stats.completed} accent sub="Fully settled on-chain" />
      <StatCard
        label="Total Escrow Value"
        value={isEmpty ? <Skeleton width={70} height={26} /> : `${formatTokenAmount(stats.totalEscrow, 2)} USDC`}
        sub="Funded + submitted jobs"
      />
      <StatCard
        label="Average Budget"
        value={isEmpty ? <Skeleton width={70} height={26} /> : `${formatTokenAmount(stats.averageBudget, 2)} USDC`}
        sub="Across jobs with a budget"
      />
    </div>
  )
}
