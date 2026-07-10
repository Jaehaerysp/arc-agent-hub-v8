import { useCallback, useState } from 'react'
import { usePolling } from '../../../hooks/usePolling'
import { fetchTokenBalance, fetchTokenBalances } from '../services/tokenBalanceService'
import { WALLET_TOKENS } from '../services/tokenRegistry'

const POLL_INTERVAL_MS = 15000

/**
 * Live balances for the extended Wallet token registry (everything beyond
 * native + ANV, which `useBalances` already covers). Same shape and polling
 * cadence as `useBalances` so the two hooks feel identical to consume.
 *
 * `tokens` are read from `provider` only — never from a private key — so
 * this only ever returns what the connected browser wallet actually holds.
 */
export function useTokenBalances(provider, account, tokens = WALLET_TOKENS) {
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!provider || !account) {
      setBalances([])
      setError(null)
      return
    }

    setLoading(true)
    const { results, error: batchError } = await fetchTokenBalances(provider, account, tokens)

    setBalances(results)
    setError(batchError)
    setLoading(false)
  }, [provider, account, tokens])

  usePolling(refresh, POLL_INTERVAL_MS, Boolean(provider && account))

  /**
   * Re-reads a single token's balance (the per-card "Refresh Balance"
   * affordance) without disturbing the rest of the list or the loading
   * flag for the whole batch.
   */
  const refreshOne = useCallback(
    async (key) => {
      if (!provider || !account) return
      const token = tokens.find((t) => t.key === key)
      if (!token) return

      const result = await fetchTokenBalance(provider, token, account)
      setBalances((prev) => prev.map((b) => (b.key === key ? result : b)))
    },
    [provider, account, tokens]
  )

  return { balances, loading, error, refresh, refreshOne }
}
