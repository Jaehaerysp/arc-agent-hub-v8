import { useCallback } from 'react'
import { ethers } from 'ethers'
import { useContractWrite } from '../../../hooks/useContractWrite'
import { ERC20_ABI } from '../../../contracts/abis/erc20'
import { USDC_TOKEN } from '../services/usdcPaymentService'
import { shortAddr } from '../../../lib/format'

/**
 * Sends a USDC payment using the same tx lifecycle (loading/error/success,
 * activity logging) every other write in this app already shares via
 * `useContractWrite` — Transfer's ANV send, Agents' registration, etc. This
 * hook only adds the payment-specific bits: parsing the human amount at
 * USDC's 6 decimals and building a readable activity `detail` string.
 *
 * Signing always goes through the browser wallet's `signer` passed in —
 * never a raw private key.
 */
export function usePaymentSend(signer, addActivity) {
  const { execute, loading, error, success, reset } = useContractWrite({
    address: USDC_TOKEN.address,
    abi: ERC20_ABI,
    signer,
    addActivity,
  })

  const sendPayment = useCallback(
    async (to, amount) => {
      const parsedAmount = ethers.parseUnits(amount, USDC_TOKEN.decimals)

      return execute('transfer', [to, parsedAmount], {
        type: 'payment',
        label: 'USDC payment',
        failLabel: 'Payment failed',
        detail: `${amount} USDC → ${shortAddr(to)}`,
      })
    },
    [execute]
  )

  return { sendPayment, loading, error, success, reset }
}
