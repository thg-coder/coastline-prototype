import { siteConfig } from '../config/siteConfig.js';

// Effective pricing mode for a service: a per-service override if present,
// otherwise the global siteConfig default.
//   'show'        → "$50"
//   'starting_at' → "from $50"
//   'hide'        → price not surfaced anywhere user-facing
export function getPricingMode(service) {
  return service?.pricingVisibility ?? siteConfig.pricingVisibility;
}

// Display string for a service's price, or null when the price should not
// be shown. Callers MUST omit the price element entirely when this is null.
export function priceLabel(service) {
  if (!service) return null;
  const mode = getPricingMode(service);
  if (mode === 'hide') return null;
  if (mode === 'starting_at') return `from $${service.fee}`;
  // 'show' and any unrecognized value fall back to the literal price.
  return `$${service.fee}`;
}
