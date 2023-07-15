export function isValidHostname(s: string): boolean {
  return /^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)+([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/.test(s)
}

export function isValidUrl(s: string): boolean {
  return /^http[s]{0,1}:\/\/.*?\/.*$/.test(s)
}
