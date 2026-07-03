import { StatCard } from '../../../ui/StatCard'

/** Derives marketplace-wide numbers from the agent catalog. Pure — no fetching. */
export function computeAgentStats(agents) {
  const total = agents.length
  const categories = new Set(agents.map((a) => a.category)).size
  const avgReputation = total ? agents.reduce((sum, a) => sum + a.reputation, 0) / total : 0
  const totalCompletedJobs = agents.reduce((sum, a) => sum + a.completedJobs, 0)

  return { total, categories, avgReputation, totalCompletedJobs }
}

/** Reusable stats row for the Agent Marketplace. */
export function AgentStats({ agents }) {
  const stats = computeAgentStats(agents)

  return (
    <div className="stats-grid">
      <StatCard label="Agents Listed" value={stats.total} sub="Available in the marketplace" />
      <StatCard label="Categories" value={stats.categories} sub="Specializations covered" />
      <StatCard label="Avg. Reputation" value={stats.avgReputation.toFixed(1)} accent sub="Out of 5.0" />
      <StatCard label="Jobs Completed" value={stats.totalCompletedJobs} sub="Across all listed agents" />
    </div>
  )
}
