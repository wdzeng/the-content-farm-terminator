export * from './array'

export function tick() {
  return new Promise(window.requestAnimationFrame)
}

function waitWebkitTransactionEndEvent(
  el: HTMLElement,
  callback: ((el: HTMLElement) => void) | undefined
): Promise<void> {
  return new Promise(res => {
    el.addEventListener(
      'webkitTransitionEnd',
      (_: Event) => {
        callback && callback(el)
        res()
      },
      { once: true }
    )
  })
}

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
export async function hideElements(elements: HTMLElement[], fade: boolean): Promise<void> {
  if (elements.length === 0) {
    return
  }

  if (!fade) {
    for (const el of elements) {
      el.style.display = 'none'
    }
    return
  }

  const tasks = Promise.all(
    elements.map(el => waitWebkitTransactionEndEvent(el, () => (el.style.display = 'none')))
  )
  for (const el of elements) {
    el.style['transition-property'] = 'opacity'
    el.style['transition-duration'] = '200ms'
    el.style.opacity = '0'
  }
  await tasks
}

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
export async function showElements(elements: HTMLElement[], fade: boolean): Promise<void> {
  if (elements.length === 0) {
    return
  }

  if (!fade) {
    for (const element of elements) {
      element.style.opacity = '1'
      element.style.display = 'block'
    }
    return
  }

  for (const el of elements) {
    el.style.display = 'block'
  }
  await tick()
  const tasks = Promise.all(elements.map(el => waitWebkitTransactionEndEvent(el, undefined)))
  for (const el of elements) {
    el.style.opacity = '1'
  }
  await tasks
}

export async function greyOutElements(elements: HTMLElement[], fade: boolean): Promise<void> {
  if (elements.length === 0) {
    return
  }

  if (!fade) {
    for (const el of elements) {
      el.style.filter = 'grayscale(100%)'
      el.style.opacity = '0.2'
    }
    return
  }

  const tasks = Promise.all(elements.map(el => waitWebkitTransactionEndEvent(el, undefined)))
  for (const el of elements) {
    el.style['transition-property'] = 'opacity filter'
    el.style['transition-duration'] = '200ms'
    el.style.filter = 'grayscale(100%)'
    el.style.opacity = '0.2'
  }
  await tasks
}

export async function greyInElements(elements: HTMLElement[], fade: boolean): Promise<void> {
  if (elements.length === 0) {
    return
  }

  if (!fade) {
    for (const el of elements) {
      el.style.filter = 'initial'
      el.style.opacity = '1'
    }
    return
  }

  const tasks = Promise.all(elements.map(el => waitWebkitTransactionEndEvent(el, undefined)))
  for (const el of elements) {
    el.style['transition-property'] = 'opacity filter'
    el.style['transition-duration'] = '200ms'
    el.style.filter = 'initial'
    el.style.opacity = '1'
  }
  await tasks
}

// https://www.w3schools.com/howto/howto_js_check_hidden.asp
export function isElementHidden(el: HTMLElement) {
  const style = window.getComputedStyle(el)
  return style.display === 'none' || style.visibility === 'hidden'
}

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

export function isValidHostname(s: string): boolean {
  return /^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)+([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/.test(s)
}

export function isValidUrl(s: string): boolean {
  return /^http[s]{0,1}:\/\/.*?\/.*$/.test(s)
}

export function isDevMode(): boolean {
  // @ts-expect-error: process.env.NODE_ENV will be replaced by rollup on
  // bundling.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return process.env.NODE_ENV === 'DEVELOPMENT'
}
