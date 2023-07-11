import { GoogleListedTerminator } from './google-listed-terminator'

export class GoogleNewsTerminator extends GoogleListedTerminator {

  constructor() {
    super('google-news')
  }

  private static isInCarousel(resultNode: HTMLElement): boolean {
    const classList = resultNode.classList
    return classList.contains('E7YbUb')
  }

  async init(): Promise<void> {
    // Since a.href in the result node changes when the user clicks it, we
    // need to preserve the hostname first.
    const resultNodes = this.getResultNodes()
    resultNodes.forEach(resultNode => {
      const a = resultNode.querySelector('a.WlydOe') as HTMLAnchorElement
      const domain = a.hostname
      resultNode.setAttribute('cft-hostname-preserve', domain)
    })

    super.init()
  }

  protected getResultNodes(): HTMLElement[] {
    // .v7W49e>div[data-hveid]: regular news result
    // g-scrolling-carousel: carousel news
    const selector = '.v7W49e>div[data-hveid] .ftSUBd,g-scrolling-carousel.F8yfEe .E7YbUb'
    const _resultNodes = document.querySelectorAll(selector)
    const resultNodes = Array.from(_resultNodes) as HTMLElement[]
    return resultNodes
  }

  protected getSourceDomain(resultNode: HTMLElement): string {
    return resultNode.getAttribute('cft-hostname-preserve') as string
  }

  protected addHintNode(resultNode: HTMLElement, text: string): HTMLElement {
    let button = resultNode.querySelector<HTMLAnchorElement>('a.cft-hint')

    // If button already exists, remove it.
    if (button !== null) {
      button.remove()
    }

    // Create button
    button = document.createElement('a')
    button.classList.add('cft-hint', 'cft-button')
    button.textContent = text
    button.href = '#'

    // Add button to the result node.
    let container: HTMLElement
    if (GoogleNewsTerminator.isInCarousel(resultNode)) {
      container = resultNode.querySelector('.OSrXXb.ZE0LJd')!
    }
    else {
      container = resultNode.querySelector('.CEMjEf.NUnG9d')!
    }
    const titleNode = resultNode.querySelector('.mCBkyc.y355M') as HTMLElement
    titleNode.classList.add('cft-result-title')

    container.appendChild(button)

    return button
  }

  protected addUndoHintNode(resultNode: HTMLElement, buttonText: string, undoHintText: string): HTMLElement {
    const domain = this.getSourceDomain(resultNode)

    // 4.0.3: it seems that each block hint element is now in the card
    // const parentNode = resultNode.parentElement as HTMLElement
    // const isInCard = !parentNode.classList.contains('v7W49e')

    // Create undo button. An attribute is added so that we can infer the
    // terminated domain if the user clicks it later.
    const undoButton = document.createElement('a')
    undoButton.setAttribute('cft-domain', domain)
    undoButton.classList.add('cft-hint', 'cft-button')
    undoButton.textContent = buttonText

    // Create undo hint message
    const undoHintNode = document.createElement('span')
    undoHintNode.classList.add('cft-undo-hint')
    undoHintNode.textContent = undoHintText

    // Create undo node that contains hint and button. 
    const undoDiv = document.createElement('div')
    undoDiv.classList.add('cft-blocked-hint' /* , isInCard ? 'cft-in-news-card' : 'cft-is-news-card' */)
    undoDiv.setAttribute('cft-domain', domain)
    undoDiv.appendChild(undoHintNode)
    undoDiv.appendChild(undoButton)

    // Insert undo node next to the (hidden) result node
    resultNode.parentNode!.insertBefore(undoDiv, resultNode.nextSibling)

    return undoButton
  }
}
