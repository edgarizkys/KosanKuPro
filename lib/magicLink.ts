/**
 * KosanKu Pro — Dynamic Multi-Tenant Subdomain Magic Link Generator
 * Automatically formats URLs with property subdomains:
 * e.g., https://rshs.kosankupro.cloud/portal/owner-report
 *       https://dago.kosankupro.cloud/portal/dispatch
 *       https://suci.kosankupro.cloud/portal/smartlock
 */

export function buildMagicLink(
  path: string,
  params: Record<string, string | number | boolean | null | undefined> = {},
  propertySlug?: string
): string {
  const rawSlug = propertySlug || 'rshs';
  const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  // Subdomain generation:
  // If specific property (e.g. rshs, dago, suci) -> https://rshs.kosankupro.cloud
  // If root/default -> https://kosankupro.cloud
  const baseDomain =
    cleanSlug && cleanSlug !== 'default' && cleanSlug !== 'all'
      ? `https://${cleanSlug}.kosankupro.cloud`
      : 'https://kosankupro.cloud';

  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, String(value));
    }
  }

  const queryString = queryParams.toString();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseDomain}${normalizedPath}${queryString ? `?${queryString}` : ''}`;
}

export function extractPropertySlugFromHost(hostHeader: string | null): string {
  if (!hostHeader) return 'rshs';
  const host = hostHeader.toLowerCase().split(':')[0]; // remove port if any
  
  if (host.startsWith('rshs.') || host.includes('rshs')) return 'rshs';
  if (host.startsWith('dago.') || host.includes('dago')) return 'dago';
  if (host.startsWith('suci.') || host.includes('suci')) return 'suci';
  
  const parts = host.split('.');
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') {
    return parts[0];
  }
  return 'rshs';
}
