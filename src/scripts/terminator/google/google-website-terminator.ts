import { GoogleListedTerminator } from './google-listed-terminator'

function isNewsResultNode(resultNode: HTMLElement): boolean {
  return resultNode.classList.contains('MkXWrd')
}

export class GoogleWebsiteTerminator extends GoogleListedTerminator {

  constructor() {
    super('google-website')
  }

  protected getResultNodes(): HTMLElement[] {
    // Regular result nodes
    let commonResultNodes: HTMLElement[] = Array.from(document.querySelectorAll('.v7W49e>*,[data-hveid="CAEQNw"]'))
    commonResultNodes = commonResultNodes.filter(candidateNode =>
      candidateNode.classList.contains('tF2Cxc')
      || candidateNode.querySelector('.tF2Cxc') !== null
      || candidateNode.querySelector('.jtfYYd') !== null
    )

    // News result nodes may appear on Google Website Search
    const newsResultNodes = Array.from(document.querySelectorAll('.MkXWrd')) as HTMLElement[]

    return commonResultNodes.concat(newsResultNodes)
  }

  protected getSourceDomain(resultNode: HTMLElement): string {
    if (isNewsResultNode(resultNode)) {
      // news result node
      const a = resultNode.querySelector('a.WlydOe') as HTMLAnchorElement
      return a.hostname
    }

    // common result node
    const selector = '.yuRUbf>a:first-child'
    const a = resultNode.querySelector(selector) as HTMLAnchorElement
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
    if (isNewsResultNode(resultNode)) {
      // news result node
      const wrapper = resultNode.querySelector('.CEMjEf.NUnG9d') as HTMLElement
      wrapper.appendChild(button)
    }
    else {
      // common result node
      const titleWrapperNode = resultNode.querySelector('.yuRUbf') as HTMLElement
      const titleNode = titleWrapperNode.querySelector('a') as HTMLAnchorElement
      const subtitleNode = resultNode.querySelector('.B6fmyf') as HTMLElement
      const urlNode = subtitleNode.querySelector('.TbwUpd') as HTMLElement
      titleWrapperNode.classList.add('cft-result-title-wrapper')
      titleNode.classList.add('cft-result-title')
      subtitleNode.classList.add('cft-result-subtitle')
      urlNode.classList.add('cft-url')

      const hintWrapperNode = subtitleNode.querySelector('.eFM0qc') as HTMLElement
      hintWrapperNode.appendChild(button)
    }

    return button
  }

  protected addUndoHintNode(resultNode: HTMLElement, buttonText: string, undoHintText: string): HTMLElement {
    const domain = this.getSourceDomain(resultNode)

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
    undoDiv.classList.add('cft-blocked-hint')
    undoDiv.classList.add(isNewsResultNode(resultNode) ? 'MkXWrd' : 'g')
    undoDiv.setAttribute('cft-domain', domain)
    undoDiv.appendChild(undoHintNode)
    undoDiv.appendChild(undoButton)

    // Insert undo node next to the (hidden) result node
    resultNode.parentNode!.insertBefore(undoDiv, resultNode.nextSibling)

    return undoButton
  }
}
