export * from './array'

export async function tick() {
  return new Promise(res => window.requestAnimationFrame(res))
}

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
export async function hideElements(elements: HTMLElement[], fade: boolean): Promise<void> {
  if (elements.length === 0) {
    return
  }
  
  if (!fade) {
    elements.forEach(el => { el.style.display = 'none' })
    return
  }

  return new Promise(res => {
    function transitionEndHandler(event: Event) {
      const el = event.target as HTMLElement
      el.style.display = 'none'
      res()
    }

    elements.forEach(el => {
      el.addEventListener('transitionend', transitionEndHandler, { once: true })
      el.style['transition-property'] = 'opacity'
      el.style['transition-duration'] = '200ms'
      el.style.opacity = '0'
    })
  })
}

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
export async function showElements(elements: HTMLElement[], fade: boolean): Promise<void> {
  if (elements.length === 0) {
    return
  }
  
  if (!fade) {
    elements.forEach((element) => {
      element.style.opacity = '1'
      element.style.display = 'block'
    })
    return
  }

  return new Promise((res) => {
    elements.forEach(async el => {
      el.style.display = 'block'
      await tick()
      el.addEventListener('webkitTransitionEnd', () => res(), { once: true })
      el.style.opacity = '1'
    })
  })
}

export async function greyOutElements(elements: HTMLElement[], fade: boolean): Promise<void> {
  if (elements.length === 0) {
    return
  }
  
  if (!fade) {
    elements.forEach(el => {
      el.style.filter = 'grayscale(100%)'
      el.style.opacity = '0.2'
    })
    return
  }

  return new Promise(res => {
    elements.forEach(el => {
      el.addEventListener('transitionend', () => res(), { once: true })
      el.style['transition-property'] = 'opacity filter'
      el.style['transition-duration'] = '200ms'
      el.style.filter = 'grayscale(100%)'
      el.style.opacity = '0.2'
    })
  })
}

export async function greyInElements(elements: HTMLElement[], fade: boolean): Promise<void> {
  if (elements.length === 0) {
    return
  }
  
  if (!fade) {
    elements.forEach(el => {
      el.style.filter = 'initial'
      el.style.opacity = '1'
    })
    return
  }

  return new Promise(res => {
    elements.forEach(el => {
      el.addEventListener('transitionend', () => res(), { once: true })
      el.style['transition-property'] = 'opacity filter'
      el.style['transition-duration'] = '200ms'
      el.style.filter = 'initial'
      el.style.opacity = '1'
    })
  })
}

// https://www.w3schools.com/howto/howto_js_check_hidden.asp
export function isElementHidden(el: HTMLElement) {
  const style = window.getComputedStyle(el)
  return style.display === 'none' || style.visibility === 'hidden'
}

export function once(callback: (_: Event) => any) {
  let flag = true
  return (e: Event) => {
    if (flag) {
      flag = false
      callback(e)
    } else {
      e.preventDefault()
    }
  }
}

export function isValidHostname(s: string): boolean {
  return /^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)+([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/.test(s)
}

export function isValidUrl(s: string): boolean {
  return /^http[s]{0,1}:\/\/.*?\/.*$/.test(s)
}