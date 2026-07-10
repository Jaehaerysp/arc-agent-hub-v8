import { HeroCard, Skeleton } from '../../../ui/design-system'
import { AnimatedCounter } from '../../../ui/AnimatedCounter'
import { NETWORK_LABEL } from '../../wallet/walletAnalytics'

/**
 * Payments Hero — same HeroCard language as Wallet/Transfer. Shows the
 * one figure that matters before sending: available USDC balance, read
 * live via the same `useTokenBalances` hook (and the same on-chain USDC
 * contract) the Wallet page's Asset Balances panel already uses.
 */
export function PaymentsHero({ usdcBalance, loading }) {
  return (
    <HeroCard
      className="wv7-hero wv7-transfer-hero"
      eyebrow="Payments"
      title="Send USDC"
      description={`Send Circle USDC to any address on ${NETWORK_LABEL}`}
      actions={
        <div className="wv7-hero-facts" role="list">
          <div className="wv7-hero-fact wv7-hero-fact-hero" role="listitem" aria-label="Available USDC balance">
            <span className="wv7-hero-fact-label">Available Balance</span>
            <span className="wv7-hero-fact-value wv7-hero-gradient">
              {loading && usdcBalance === null ? (
                <Skeleton width={90} height={26} />
              ) : (
                <AnimatedCounter value={Number(usdcBalance) || 0} decimals={2} duration={1000} suffix=" USDC" />
              )}
            </span>
          </div>
        </div>
      }
    />
  )
}
