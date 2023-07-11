export function removeDuplicates(a: string[]): string[] {
  const set = new Set(a)
  return a.filter(e => set.add(e))
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

export async function tick() {
  return new Promise(res => window.requestAnimationFrame(res))
}

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
export async function fadeOut(els: HTMLElement[], now?: boolean): Promise<void> {
  return new Promise(res => {
    if (now) {
      els.forEach(el => el.style.display = 'none')
      res()
      return
    }

    function transitionEndHandler(event: Event) {
      const el = event.target as HTMLElement
      el.style.display = 'none'
      res()
    }

    els.forEach(el => {
      el.addEventListener('webkitTransitionEnd', transitionEndHandler, { once: true })
      el.style['transition-property'] = 'opacity'
      el.style['transition-duration'] = '200ms'
      el.style.opacity = '0'
    })
  })
}

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
export async function fadeIn(els: HTMLElement[], now?: boolean): Promise<void> {
  return new Promise((res) => {
    if (now) {
      els.forEach((el) => {
        el.style.opacity = '1'
        el.style.display = 'block'
      })
      res()
      return
    }

    els.forEach(async el => {
      el.style.display = 'block'
      await tick()
      el.addEventListener('webkitTransitionEnd', () => res(), { once: true })
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
  const reg = new RegExp('^(([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])\\.)+([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])$')
  return reg.test(s)
}

export function isValidUrl(s: string): boolean {
  const reg = new RegExp('http[s]{0,1}:\\/\\/.*?\\/.*')
  return reg.test(s)
}

const i18n = process.env.BROWSER === 'chrome' ? chrome.i18n : browser.i18n
export const i18nMessage = i18n.getMessage
