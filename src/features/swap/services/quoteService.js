// Universal Token Swap (Sprint 4) — quote/estimate service.
//
// Wraps Circle App Kit's `kit.estimateSwap()` — the SDK's dedicated
// pre-swap estimate call (see the Arc Docs "Estimate swap rate" how-to:
// `const estimate = await kit.estimateSwap(params)`), which takes the
// exact same `SwapParams` shape as `kit.swap()` in `swapService.js` but
// never submits a transaction. Kept as its own service (rather than
// folded into `swapService.js`) because it's read-only and safe to call on
// every keystroke via `useSwap.js`'s debounce, same as Bridge's
// `bridgeEstimator.js` is a separate module from `bridgeService.js`.

import { AppKit } from '@circle-fin/app-kit'
import logger from '../../../utils/logger'
import { SWAP_CHAIN } from './swapService'

// Own module-level `AppKit` instance, same convention as `swapService.js`'s
// `kit` — estimates are read-only (no signing), so sharing one instance
// across every debounced quote call is safe and avoids re-constructing the
// SDK on every keystroke.
const kit = new AppKit()

/**
 * Gets a pre-swap estimate for `amountIn` of `tokenIn` -> `tokenOut`.
 * Never throws: a failed estimate resolves to `{ ...null fields, error }`
 * so the form can still show a stale/absent quote without blocking input.
 *
 * `adapter`/`kitKey` are passed in rather than re-resolved here so a
 * single adapter (and its wallet-signature-free read calls) can be shared
 * between the estimate and the eventual `kit.swap()` call.
 */
export async function getSwapQuote({ adapter, kitKey, tokenIn, tokenOut, amountIn, slippageBps }) {
  try {
    if (!adapter) throw new Error('Connect your wallet to continue')
    if (!kitKey) throw new Error('KIT_KEY missing — set VITE_SWAP_KIT_KEY in your .env')
    if (tokenIn.key === tokenOut.key) throw new Error('Token In and Token Out must be different')
    if (!amountIn || Number(amountIn) <= 0) throw new Error('Invalid amount')

    const estimate = await kit.estimateSwap({
      from: { adapter, chain: SWAP_CHAIN },
      tokenIn: tokenIn.symbol,
      tokenOut: tokenOut.symbol,
      amountIn,
      config: { kitKey, ...(slippageBps ? { slippageBps } : {}) },
    })

    return {
      estimatedOutput: estimate.estimatedOutput ?? null,
      stopLimit: estimate.stopLimit ?? null,
      fees: estimate.fees ?? [],
      error: null,
    }
  } catch (e) {
    logger.error('Quote failed', e)
    return {
      estimatedOutput: null,
      stopLimit: null,
      fees: [],
      error: e?.reason || e?.shortMessage || e?.message || 'Quote unavailable',
    }
  }
}
