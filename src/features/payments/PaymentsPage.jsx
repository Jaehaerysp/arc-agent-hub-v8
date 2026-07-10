import { useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { useWalletContext } from '../../app/providers/WalletProvider'
import { useTokenBalances } from '../wallet/hooks/useTokenBalances'
import { useFeeEstimate } from './hooks/useFeeEstimate'
import { usePaymentSend } from './hooks/usePaymentSend'
import { Container, Section } from '../../ui/design-system'
import { PaymentsHero } from './components/PaymentsHero'
import { PaymentForm } from './components/PaymentForm'
import { PaymentSuccessDialog } from './components/PaymentSuccessDialog'
import { PaymentHistoryTable } from './components/PaymentHistoryTable'
import { computePaymentHistory } from './paymentsAnalytics'
import { USDC_TOKEN } from './services/usdcPaymentService'

/**
 * Payments — sends Circle USDC on Arc Testnet through the connected
 * browser wallet. Reuses the Wallet feature's architecture from Sprint 1
 * end to end:
 *   - `useTokenBalances` (Wallet's own hook) reads the live USDC balance,
 *     the same way it reads every other token on the Wallet page.
 *   - `usdcPaymentService`/`useFeeEstimate`/`usePaymentSend` follow the
 *     same "pure service + thin hook" shape as `tokenBalanceService`.
 *   - The send itself goes through the same `useContractWrite` every
 *     other write in this app (Transfer, Agents, Trust) already shares.
 *
 * No private keys anywhere in this flow — every read and write uses the
 * `provider`/`signer` from the connected browser wallet.
 */
export default function PaymentsPage() {
  const { signer, account, provider, addActivity, activity, arcExplorer } = useWalletContext()
  const { balances, loading: balanceLoading, refresh: refreshBalance } = useTokenBalances(provider, account, [USDC_TOKEN])
  const usdcBalance = balances[0]?.balance ?? null

  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { fee, loading: feeLoading, error: feeError } = useFeeEstimate(provider, account, to, amount)
  const { sendPayment, loading, error, success, reset } = usePaymentSend(signer, addActivity)

  const clearState = () => {
    setSubmitted(false)
    setFormError(null)
    reset()
  }

  const handleMax = () => {
    if (usdcBalance !== null) {
      clearState()
      setAmount(usdcBalance.toString())
    }
  }

  const handleSubmit = async () => {
    setFormError(null)
    const toTrimmed = to.trim()

    if (!toTrimmed || !ethers.isAddress(toTrimmed)) return setFormError('Valid recipient address required')
    if (!amount || Number(amount) <= 0) return setFormError('Valid amount required')

    const result = await sendPayment(toTrimmed, amount)

    if (result) {
      setSubmitted(true)
      setDialogOpen(true)
      refreshBalance()
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setTo('')
    setAmount('')
    clearState()
  }

  const payments = useMemo(() => computePaymentHistory(activity, 8), [activity])

  return (
    <Container size="wide" className="wv7-transfer-page">
      <Section spacing="md">
        <PaymentsHero usdcBalance={usdcBalance} loading={balanceLoading} />
      </Section>

      <Section spacing="md">
        <PaymentForm
          to={to}
          amount={amount}
          usdcBalance={usdcBalance}
          signer={signer}
          loading={loading}
          submitted={submitted}
          formError={formError}
          sendError={error}
          fee={fee}
          feeLoading={feeLoading}
          feeError={feeError}
          onToChange={(v) => { clearState(); setTo(v) }}
          onAmountChange={(v) => { clearState(); setAmount(v) }}
          onMax={handleMax}
          onSubmit={handleSubmit}
        />
      </Section>

      <Section spacing="md">
        <PaymentHistoryTable payments={payments} arcExplorer={arcExplorer} />
      </Section>

      <PaymentSuccessDialog
        open={dialogOpen}
        txHash={success?.txHash}
        amount={amount}
        to={to.trim()}
        arcExplorer={arcExplorer}
        onClose={handleDialogClose}
      />
    </Container>
  )
}
