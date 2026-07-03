import { Input } from '../../../ui/Field'
import { IconSearch } from '../../../ui/icons'

/**
 * Reusable search box for the Jobs dashboard and Job history table.
 * Purely controlled — matching is left to the caller (JobHistoryPage /
 * JobsPage both filter client-side over the jobs useJobs() already loaded).
 */
export function JobsSearch({ value, onChange, placeholder = 'Search by job ID, client, or provider address…' }) {
  return (
    <div className="jobs-search-wrap">
      <IconSearch width={15} height={15} className="jobs-search-icon" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
