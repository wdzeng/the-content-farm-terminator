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
