import { Panel, FieldGroup, Input, Select, Button } from '../../../ui/design-system'
import { Alert } from '../../../ui/Alert'
import { formatTokenAmount, shortAddr } from '../../../lib/format'
import { formatFeeEstimate } from '../paymentsAnalytics'
import { IconZap } from '../../../ui/icons'

/**
 * Payment Form — recipient, amount, token selector, live fee estimate,
 * and a transaction preview, mirroring Transfer's form/preview shape
 * (`wv7-transfer-*` classes, same Panel/FieldGroup/Input primitives) so
 * Payments reads as part of the same Treasury surface rather than a new
 * visual language.
 *
 * Only "USDC" is offered in the token selector today — this app tracks
 * one Circle-issued USDC contract (see usdcPaymentService.js) — but the
 * selector is left in place so a second token is a data change, not a
 * UI change.
 */
export function PaymentForm({
  to,
  amount,
  usdcBalance,
  signer,
  loading,
  submitted,
  formError,
  sendError,
  fee,
  feeLoading,
  feeError,
  onToChange,
  onAmountChange,
  onMax,
  onSubmit,
}) {
  const toTrimmed = to.trim()

  return (
    <Panel
      icon={<IconZap width={18} height={18} />}
      title="Payment Form"
      subtitle="Send Circle USDC on Arc Testnet"
      className="wv7-transfer-form-panel"
    >
      <div className="wv7-transfer-balance-row">
        <span className="wv7-transfer-balance-label">Available balance</span>
        <span className="wv7-transfer-balance-value mono">{formatTokenAmount(usdcBalance, 4)} USDC</span>
      </div>

      <FieldGroup label="Recipient address">
        <Input
          type="text"
          placeholder="0x..."
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          disabled={loading}
        />
      </FieldGroup>

      <FieldGroup label="Token">
        <Select value="USDC" disabled onChange={() => {}} aria-label="Token">
          <option value="USDC">USDC — Circle USDC</option>
        </Select>
      </FieldGroup>

      <FieldGroup label="Amount">
        <div style={{ display: 'flex', gap: 8 }}>
          <Input type="number" value={amount} onChange={(e) => onAmountChange(e.target.value)} disabled={loading} />
          <Button variant="secondary" size="sm" onClick={onMax} disabled={loading || usdcBalance === null}>
            Max
          </Button>
        </div>
      </FieldGroup>

      {toTrimmed && amount && Number(amount) > 0 && (
        <div className="wv7-transfer-preview" aria-label="Transaction preview">
          <div className="wv7-transfer-preview-title">Transaction Preview</div>
          <div className="wv7-transfer-preview-row">
            <span>Sending</span>
            <span className="mono">{amount} USDC</span>
          </div>
          <div className="wv7-transfer-preview-row">
            <span>To</span>
            <span className="mono">{shortAddr(toTrimmed)}</span>
          </div>
          <div className="wv7-transfer-preview-row">
            <span>Estimated fee</span>
            <span className="mono">{formatFeeEstimate(fee, feeLoading, feeError)}</span>
          </div>
          <div className="wv7-transfer-preview-row">
            <span>Network</span>
            <span>Arc Testnet</span>
          </div>
        </div>
      )}

      {(formError || sendError) && (
        <Alert variant="error" title="Payment failed">
          {formError || sendError}
        </Alert>
      )}

      <div className="wv7-transfer-progress" aria-live="polite">
        <Button variant="primary" block loading={loading} onClick={onSubmit} disabled={loading || !signer || submitted}>
          {submitted ? '✓ Sent' : 'Send USDC'}
        </Button>
        {!signer && (
          <p className="field-hint" style={{ marginTop: 10, textAlign: 'center' }}>
            Connect your wallet to send a payment
          </p>
        )}
      </div>
    </Panel>
  )
}
