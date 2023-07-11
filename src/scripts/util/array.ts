export function removeDuplicates(a: string[]): string[] {
  const set = new Set<string>()
  return a.filter(e => !set.has(e) && set.add(e))
}

export function subtractArray(a: string[], b: string[]): string[] {
  const set = new Set(b)
  return a.filter(x => !set.has(x))
}

export function intersectArray(a: string[], b: string[]): string[] {
  if (a.length < b.length) return intersectArray(b, a)
  // a.length >= b.length
  const set = new Set(a)
  return b.filter(e => set.has(e))
}
