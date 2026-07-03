import { Select } from '../../../ui/Field'
import { JOB_STATUS } from '../../../lib/blockchain/constants'
import { IconFilter } from '../../../ui/icons'

// 'all' + every on-chain status. The ticket's Sprint-3 list calls out
// All/Open/Funded/Submitted/Completed/Expired explicitly; Rejected is kept
// too since it's a real terminal status on-chain and hiding it would make
// rejected jobs disappear from search/history entirely.
const FILTERS = [{ id: 'all', label: 'All' }, ...JOB_STATUS.map((label, i) => ({ id: String(i), label }))]

export const JOB_SORTS = [
  { id: 'created_desc', label: 'Newest' },
  { id: 'created_asc', label: 'Oldest' },
  { id: 'budget_desc', label: 'Highest budget' },
  { id: 'budget_asc', label: 'Lowest budget' },
]

/** Reusable status-filter pill row + sort dropdown, shared by JobsPage and JobHistoryPage. */
export function JobsFilters({ status, onStatusChange, sort, onSortChange }) {
  return (
    <div className="jobs-filters-row">
      <div className="jobs-filter-pills">
        <IconFilter width={14} height={14} className="jobs-filter-icon" />
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`jobs-filter-pill ${status === f.id ? 'active' : ''}`}
            onClick={() => onStatusChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {onSortChange && (
        <div className="jobs-sort-wrap">
          <Select value={sort} onChange={(e) => onSortChange(e.target.value)}>
            {JOB_SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
        </div>
      )}
    </div>
  )
}
