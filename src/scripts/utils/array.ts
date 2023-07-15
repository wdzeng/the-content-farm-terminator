// Removes duplicated elements in an array. The order of elements are preserved.
export function removeDuplicates(a: string[]): string[] {
  const set = new Set<string>()
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return a.filter(e => !set.has(e) && set.add(e))
}

// Returns elements in array `a` but not in array `b` while preserves the order
// in array `a`.
export function subtractArray(a: string[], b: string[]): string[] {
  const set = new Set(b)
  return a.filter(x => !set.has(x))
}

// Returns elements appearing in both array `a` and `b` while the order is not
// cared.
export function intersectArray(a: string[], b: string[]): string[] {
  if (a.length < b.length) {
    return intersectArray(b, a)
  }

  // Here a.length >= b.length.
  const set = new Set(a)
  return b.filter(e => set.has(e))
}
