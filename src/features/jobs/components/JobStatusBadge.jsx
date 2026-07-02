import { Badge } from '../../../ui/Badge'

// Mirrors JOB_STATUS order from lib/blockchain/constants.js exactly —
// ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired'].
const VARIANT_BY_STATUS = ['muted', 'accent', 'warning', 'success', 'error', 'error']

export function JobStatusBadge({ status, label }) {
  const variant = VARIANT_BY_STATUS[Number(status)] ?? 'muted'
  return <Badge variant={variant}>{label}</Badge>
}
