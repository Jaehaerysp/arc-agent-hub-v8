import { useEffect, useRef, useState } from 'react'
import { ethers } from 'ethers'
import { estimateUsdcTransferFee } from '../services/usdcPaymentService'

const DEBOUNCE_MS = 500

/**
 * Debounced live fee estimate for a pending USDC payment. Re-estimates
 * whenever `to`/`amount` change to a valid pair, using the connected
 * wallet's provider — never runs against an invalid recipient/amount, and
 * never blocks the Send button (see PaymentForm: a stale/failed estimate
 * doesn't stop `usePaymentSend`, it's advisory only, same as
 * `kit.estimateSend()` being a separate call from `kit.send()` in
 * send-usdc.ts).
 */
export function useFeeEstimate(provider, account, to, amount) {
  const [fee, setFee] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const toTrimmed = (to || '').trim()
  const isValid = provider && account && ethers.isAddress(toTrimmed) && amount && Number(amount) > 0

  useEffect(() => {
    if (!isValid) {
      setFee(null)
      setError(null)
      setLoading(false)
      return
    }

    const currentRequest = ++requestId.current
    setLoading(true)

    const timer = setTimeout(async () => {
      const result = await estimateUsdcTransferFee(provider, account, toTrimmed, amount)
      if (requestId.current !== currentRequest) return // a newer request superseded this one

      setFee(result.error ? null : result)
      setError(result.error)
      setLoading(false)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, account, toTrimmed, amount, isValid])

  return { fee, loading, error }
}
