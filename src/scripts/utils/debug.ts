/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-console */

export function info(...messages: unknown[]): void {
  // @ts-expect-error: process.env.NODE_ENV will be replaced by rollup on
  if (process.env.NODE_ENV === 'development') {
    console.log(...messages)
  }
}

export function error(...messages: unknown[]): void {
  // @ts-expect-error: process.env.NODE_ENV will be replaced by rollup on
  if (process.env.NODE_ENV === 'development') {
    console.error(...messages)
  }
}
