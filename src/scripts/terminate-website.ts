import { ContentFarmTerminator } from './terminate.js'

export class GoogleWebsiteTerminator extends ContentFarmTerminator {

  constructor() {
    super()
  }

  protected getResultNodes(): HTMLDivElement[] {
    const divGNodes: HTMLDivElement[] = Array.from(document.querySelectorAll('.v7W49e>*'))
    return divGNodes.filter(candidateNode =>
      candidateNode.classList.contains('tF2Cxc')
      || candidateNode.querySelector('.tF2Cxc') !== null
      || candidateNode.querySelector('.jtfYYd') !== null
    )
  }

  protected getSourceDomain(resultNode: HTMLElement): string {
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
    undoDiv.classList.add('g', 'cft-blocked-hint')
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
