import { useEffect, useRef } from 'react'
import { Select } from '../../../ui/Field'
import { IconSearch } from '../../../ui/icons'

const SORT_OPTIONS = [
  { id: 'reputation', label: 'Reputation' },
  { id: 'jobs', label: 'Most jobs completed' },
  { id: 'rate-asc', label: 'Rate: low to high' },
]

/**
 * Marketplace search + category filter chips + sort. Chips are a proper
 * toggle group (role="group", aria-pressed) per UI Blueprint §2.9. The "/"
 * key focuses search from anywhere on the page, matching the Blueprint's
 * documented keyboard shortcut for this page.
 */
export function MarketplaceFilters({ search, onSearchChange, categories, category, onCategoryChange, sort, onSortChange }) {
  const searchRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== '/') return
      const active = document.activeElement
      const isTyping = active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)
      if (isTyping) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="marketplace-filters">
      <div className="marketplace-search">
        <IconSearch width={15} height={15} />
        <input
          ref={searchRef}
          type="text"
          className="marketplace-search-input"
          placeholder="Search by name, skill, or wallet…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search agents"
        />
        <kbd className="marketplace-search-kbd">/</kbd>
      </div>

      <div className="marketplace-filters-row">
        <div className="filter-chip-group" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-chip ${category === c ? 'is-active' : ''}`}
              aria-pressed={category === c}
              onClick={() => onCategoryChange(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <Select value={sort} onChange={(e) => onSortChange(e.target.value)} aria-label="Sort agents" className="marketplace-sort">
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>Sort: {opt.label}</option>
          ))}
        </Select>
      </div>
    </div>
  )
}
