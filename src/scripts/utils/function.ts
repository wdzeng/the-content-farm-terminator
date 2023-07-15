export function once(callback: (_: Event) => unknown): (_: Event) => void {
  let flag = true
  return (e: Event): void => {
    if (flag) {
      flag = false
      // The callback here may be an async function. If it is, fire and forget.
      callback(e)
      return
    }

    e.preventDefault()
  }
}
