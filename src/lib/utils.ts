export function domainHue(domain: string | null): number {
  if (!domain) return 220
  let hash = 0
  for (const char of domain) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0
  }
  return Math.abs(hash) % 360
}
