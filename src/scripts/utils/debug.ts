export function isDevMode(): boolean {
  // @ts-expect-error: process.env.NODE_ENV will be replaced by rollup on
  // bundling.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return process.env.NODE_ENV === 'development'
}
