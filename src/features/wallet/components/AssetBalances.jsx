import { Panel, Grid, GlassCard, Badge, Skeleton, SearchInput, Chip, EmptyState } from '../../../ui/design-system'
import { Alert } from '../../../ui/Alert'
import { CopyButton } from '../../../ui/CopyButton'
import { shortAddr } from '../../../lib/format'
import { explorerTokenUrl } from '../../../chains/arc'
import { WALLET_CATEGORIES } from '../services/tokenRegistry'
import { IconWallet, IconLink, IconLayers, IconZap, IconSearch } from '../../../ui/icons'

const ICONS = { native: IconLink, anv: IconWallet }

const CATEGORY_ICONS = {
  native: IconLink,
  custom: IconWallet,
  ai: IconZap,
  defi: IconLayers,
}

const CATEGORY_LABELS = Object.fromEntries(WALLET_CATEGORIES.map((c) => [c.id, c.label]))

const STATUS_BADGE = {
  connected: { variant: 'success', label: 'Connected' },
  'wrong-network': { variant: 'warning', label: 'Wrong network' },
  error: { variant: 'error', label: 'Read failed' },
}

// Send/Receive/Swap/Bridge are placeholders per the Sprint 1 brief —
// wired up as disabled affordances so the card layout is final, but no
// action is implemented yet.
const PLACEHOLDER_ACTIONS = ['Send', 'Receive', 'Swap', 'Bridge']

/**
 * Premium asset cards — one per token this app tracks (native + ANV,
 * plus the full Custom / AI Agent / DeFi registry read live by
 * `useTokenBalances`). Sprint 1 (v8 Wallet Module) adds: category tabs,
 * name/symbol/address search, per-card copy address + ArcScan link +
 * single-token refresh, and disabled Send/Receive/Swap/Bridge
 * placeholders. See walletAnalytics.js for why "USD Value" is
 * intentionally omitted rather than fabricated, and for how per-token
 * read errors are surfaced instead of silently shown as a zero balance.
 */
export function AssetBalances({ assets, allAssetsCount, loading, error, search, onSearchChange, category, onCategoryChange, onRefreshToken }) {
  return (
    <Panel title="Asset Balances" subtitle="Tokens held on Arc Testnet" className="wv7-assets-panel">
      {error && (
        <Alert variant="warning" title="Some token balances could not be loaded">
          {error}
        </Alert>
      )}

      <div className="wv7-assets-filters">
        <SearchInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search assets…"
          className="wv7-assets-search"
        />

        <div className="wv7-assets-category-row" role="group" aria-label="Filter by category">
          {WALLET_CATEGORIES.map((c) => (
            <Chip key={c.id} selected={category === c.id} onClick={() => onCategoryChange(c.id)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={<IconSearch width={20} height={20} />}
          title="No matching assets"
          description={`Nothing in ${allAssetsCount} tracked tokens matches this search or category.`}
        />
      ) : (
        <Grid minColWidth="260px" gap="md" aria-label="Asset balances">
          {assets.map((asset) => {
            const Icon = ICONS[asset.key] || CATEGORY_ICONS[asset.category] || IconWallet
            const badge = STATUS_BADGE[asset.status] || STATUS_BADGE['wrong-network']
            return (
              <GlassCard key={asset.key} className="wv7-asset-card" padding="md">
                <div className="wv7-asset-card-top">
                  <div className="wv7-asset-icon" aria-hidden="true">
                    <Icon width={16} height={16} />
                  </div>
                  <Badge variant={badge.variant} size="sm" dot>
                    {badge.label}
                  </Badge>
                </div>

                <div className="wv7-asset-symbol">{asset.symbol}</div>
                <div className="wv7-asset-name">{asset.name}</div>

                {asset.category && (
                  <Badge variant="muted" size="sm" dot={false} className="wv7-asset-category-badge">
                    {CATEGORY_LABELS[asset.category] || asset.category}
                  </Badge>
                )}

                <div className="wv7-asset-balance">
                  {loading && asset.balance === null && !asset.error ? <Skeleton width={90} height={24} /> : asset.balanceFormatted}
                </div>

                <div className="wv7-asset-foot">
                  <span className="wv7-asset-network">{asset.network}</span>
                  {asset.address && (
                    <span className="wv7-asset-address mono" title={asset.address}>
                      {shortAddr(asset.address)}
                    </span>
                  )}
                </div>

                {asset.address && (
                  <div className="wv7-asset-onchain-actions">
                    <CopyButton value={asset.address} label="Copy Address" />
                    <a
                      href={explorerTokenUrl(asset.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ds-btn ds-btn-ghost ds-btn-sm"
                    >
                      <span className="ds-btn-label">ArcScan ↗</span>
                    </a>
                    <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => onRefreshToken?.(asset.key)}>
                      <span className="ds-btn-label">Refresh</span>
                    </button>
                  </div>
                )}

                <div className="wv7-asset-placeholder-actions" aria-label={`${asset.symbol} actions (coming soon)`}>
                  {PLACEHOLDER_ACTIONS.map((action) => (
                    <button key={action} type="button" className="ds-btn ds-btn-ghost ds-btn-sm" disabled title="Coming soon">
                      <span className="ds-btn-label">{action}</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
            )
          })}
        </Grid>
      )}
    </Panel>
  )
}
