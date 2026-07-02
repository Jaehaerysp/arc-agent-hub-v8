import { useCallback, useEffect, useState } from 'react'
import { listJobsForAccount } from '../lib/blockchain/jobs'

const POLL_INTERVAL_MS = 20000

/**
 * Loads every ERC-8183 job where the connected account is client or
 * provider, polling lightly so Jobs dashboard/history stay fresh. Follows
 * the same provider/account/poll shape as useBalances.
 */
export function useJobs(provider, account) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!provider || !account) {
      setJobs([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await listJobsForAccount(provider, account)
      setJobs(result)
    } catch (e) {
      setError(e?.reason || e?.shortMessage || e?.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [provider, account])

  useEffect(() => {
    refresh()
    if (!provider || !account) return
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh, provider, account])

  return { jobs, loading, error, refresh }
}
