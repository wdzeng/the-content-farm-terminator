import {
  greyInElements,
  greyOutElements,
  hideElements,
  showElements,
} from '../../util'
import { GoogleListedTerminator } from './google-listed-terminator'

export class GoogleNewsTerminator extends GoogleListedTerminator {
  constructor() {
    super('google-news')
  }

  private static isInCarousel(resultNode: HTMLElement): boolean {
    const classList = resultNode.classList
    return classList.contains('E7YbUb')
  }

  protected async init(): Promise<void> {
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
    const selector ='.SoaBEf'
    const _resultNodes = document.querySelectorAll(selector)
    const resultNodes = Array.from(_resultNodes) as HTMLElement[]
    return resultNodes
  }

  protected getSourceDomain(resultNode: HTMLElement): string {
    return resultNode.getAttribute('cft-hostname-preserve') as string
  }

  protected addHintNode(
    resultNode: HTMLElement,
    text: string
  ): HTMLElement | null {
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
    } else {
      container = resultNode.querySelector('.CEMjEf.NUnG9d')!
    }
    container.appendChild(button)
    return button
    // const titleNode = resultNode.querySelector('.mCBkyc.y355M') as HTMLElement
    // titleNode.classList.add('cft-result-title')
  }

  protected addUndoHintNode(
    resultNode: HTMLElement,
    buttonText: string,
    undoHintText: string
  ): HTMLElement | null {
    const domain = this.getSourceDomain(resultNode)

    // 4.1.0: it seems that each block hint element is now in the card
    // const parentNode = resultNode.parentElement as HTMLElement
    // const isInCard = !parentNode.classList.contains('v7W49e')

    // Create undo button. An attribute is added so that we can infer the
    // terminated domain if the user clicks it later.
    const undoButton = document.createElement('a')
    undoButton.setAttribute('cft-domain', domain)
    undoButton.classList.add('cft-hint', 'cft-button')
    undoButton.textContent = buttonText

    // For result node in carousel, simply add a button for it.
    if (GoogleNewsTerminator.isInCarousel(resultNode)) {
      // Since the result is not removed from the page, remove the terminate
      // button.
      const termButton = resultNode.querySelector('.cft-button')!
      termButton.remove()

      const container = resultNode.querySelector('.OSrXXb.ZE0LJd')!
      container.appendChild(undoButton)
    }

    // For regular result node, add button and a hint message.
    else {
      // Create undo hint message
      const undoHintNode = document.createElement('span')
      undoHintNode.classList.add('cft-undo-hint')
      undoHintNode.textContent = undoHintText

      // Create undo node that contains hint and button.
      const undoDiv = document.createElement('div')
      undoDiv.classList.add(
        'cft-blocked-hint' /* , isInCard ? 'cft-in-news-card' : 'cft-is-news-card' */
      )
      undoDiv.setAttribute('cft-domain', domain)
      undoDiv.appendChild(undoHintNode)
      undoDiv.appendChild(undoButton)

      // Insert undo node next to the (hidden) result node
      resultNode.parentNode!.insertBefore(undoDiv, resultNode.nextSibling)
    }

    return undoButton
  }

  protected async hideResults(
    resultNodes: HTMLElement[],
    init: boolean
  ): Promise<void> {
    const regular: HTMLElement[] = []
    const carousel: HTMLElement[] = []

    resultNodes.forEach(x => {
      GoogleNewsTerminator.isInCarousel(x) ? carousel.push(x) : regular.push(x)
    })
    await Promise.all([
      greyOutElements(carousel, !init),
      hideElements(regular, !init),
    ])
  }

  protected async showResults(resultNodes: HTMLElement[]): Promise<void> {
    const regular: HTMLElement[] = []
    const carousel: HTMLElement[] = []

    resultNodes.forEach(x => {
      GoogleNewsTerminator.isInCarousel(x) ? carousel.push(x) : regular.push(x)
    })

    await Promise.all([
      greyInElements(carousel, true),
      showElements(regular, true),
    ])
  }
}
