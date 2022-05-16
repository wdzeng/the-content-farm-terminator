import { ContentFarmTerminator } from './terminate.js'

export class GoogleWebsiteTerminator extends ContentFarmTerminator {

  constructor() {
    super()
  }

  protected markSearchCategory(): void {
    const search = document.getElementById('search') as HTMLElement
    search.setAttribute('cft-search-category', 'news')
  }

  protected getResultNodes(): HTMLElement[] {
    const selector = '.v7W49e>div[data-hveid],.v7W49e g-card div[data-hveid]:not(:only-child)'
    const _resultNodes = document.querySelectorAll(selector)
    const resultNodes = Array.from(_resultNodes) as HTMLElement[]
    return resultNodes
  }

  protected getSourceDomain(resultNode: HTMLElement): string {
    const a = resultNode.querySelector('a.WlydOe') as HTMLAnchorElement
    return a.hostname
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
    const titleNode = resultNode.querySelector('.mCBkyc.y355M.nDgy9d,.mCBkyc.y355M.JQe2Ld.nDgy9d') as HTMLElement
    titleNode.classList.add('cft-result-title')

    const sourceNewsNode = resultNode.querySelector('.CEMjEf.NUnG9d') as HTMLElement
    sourceNewsNode.appendChild(button)

    return button
  }

  protected addShowFarmResultsOnceNode(msgLeft: string, buttonText: string, msgRight: string): HTMLElement {
    const a = document.createElement('a')
    a.href = '#'
    a.classList.add('cft-button')
    a.textContent = buttonText

    const leftMessage = document.createTextNode(msgLeft)
    const rightMessage = document.createTextNode(msgRight)
    const hintMessageNode = document.createElement('p')
    hintMessageNode.appendChild(leftMessage)
    hintMessageNode.appendChild(a)
    hintMessageNode.appendChild(rightMessage)

    const hintNode = document.createElement('div')
    hintNode.id = 'cft-temp-show'
    hintNode.classList.add('cft-bottom-hint')
    hintNode.appendChild(hintMessageNode)

    // Add the hint node to the bottom of the page.
    const botStuff = document.getElementById('botstuff') as HTMLElement
    botStuff.prepend(hintNode)

    return a
  }

  protected addUndoHintNode(resultNode: HTMLElement, buttonText: string, undoHintText: string): HTMLElement {
    const domain = this.getSourceDomain(resultNode)

    const parentNode = resultNode.parentElement as HTMLElement
    const isInCard = !parentNode.classList.contains('v7W49e')

    // Create undo button. An attribute is added so that we can infer the
    // terminated domain if the user clicks it later.
    const undoButton = document.createElement('a')
    undoButton.setAttribute('cft-domain', domain)
    undoButton.classList.add('cft-hint', 'cft-button')
    undoButton.textContent = buttonText

    // Create undo hint message
    const undoHintNode = document.createElement('span')
    undoHintNode.textContent = undoHintText

    // Create undo node that contains hint and button. 
    const undoDiv = document.createElement('div')
    undoDiv.classList.add('cft-blocked-hint', isInCard ? 'cft-in-news-card' : 'cft-is-news-card')
    undoDiv.setAttribute('cft-domain', domain)
    undoDiv.appendChild(undoHintNode)
    undoDiv.appendChild(undoButton)

    // Insert undo node next to the (hidden) result node
    resultNode.parentNode!.insertBefore(undoDiv, resultNode.nextSibling)

    return undoButton
  }
}

export async function init() {
  const terminator = new GoogleWebsiteTerminator()
  await terminator.init()
}
