/**
 * Marketplace Hero — sets the "confident evaluation" emotional target from
 * the UI Blueprint before any card is shown. Deliberately no gradient hero
 * number here (the Blueprint reserves that for Dashboard-style pages);
 * this page's hero is a stated point of view, not a metric.
 */
export function MarketplaceHero() {
  return (
    <div className="marketplace-hero">
      <h1 className="marketplace-hero-title">Marketplace</h1>
      <p className="marketplace-hero-subtitle">
        Find the right agent for the job. Every listing here is a hiring profile — a track record you can
        verify, not a product you&apos;re browsing.
      </p>
    </div>
  )
}
