import { greyInElements, greyOutElements, hideElements, showElements } from '../../util'
import { GoogleListedTerminator } from './google-listed-terminator'

export class GoogleWebsiteTerminator extends GoogleListedTerminator {

  private static isNewsResultNode(resultNode: HTMLElement): boolean {
    return resultNode.classList.contains('MkXWrd')
  }

  constructor() {
    super('google-website')
  }

  protected getResultNodes(): HTMLElement[] {
    // Regular result nodes
    // div.g is regular result node
    let commonResultNodes: HTMLElement[] = Array.from(document.querySelectorAll('div.g'))
    commonResultNodes = commonResultNodes.filter(candidateNode => {
      // If a div.g has parent also div.g, it is not a result node
      let parentNode = candidateNode.parentElement
      if (parentNode?.closest('div.g')) {
        return false
      }

      return candidateNode.classList.contains('tF2Cxc') // single result node
        || candidateNode.querySelector('.tF2Cxc') !== null // group result node that contains another div.g
        || candidateNode.querySelector('.jtfYYd') !== null // group result node that contains no div.g

      // there is a little possibilities of mis-selections...
    })

    // News result nodes may appear on Google Website Search
    const newsResultNodes = Array.from(document.querySelectorAll('.MkXWrd')) as HTMLElement[]

    return commonResultNodes.concat(newsResultNodes)
  }

  protected getSourceDomain(resultNode: HTMLElement): string {
    if (GoogleWebsiteTerminator.isNewsResultNode(resultNode)) {
      // news result node
      const a = resultNode.querySelector('a.WlydOe') as HTMLAnchorElement
      return a.hostname
    }

    // common result node
    const selector = '.yuRUbf>a:first-child'
    const a = resultNode.querySelector(selector) as HTMLAnchorElement
    return a.hostname
  }

  protected addHintNode(resultNode: HTMLElement, text: string): HTMLElement | null {
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
    if (GoogleWebsiteTerminator.isNewsResultNode(resultNode)) {
      // news result node
      const wrapper = resultNode.querySelector('.OSrXXb.ZE0LJd') as HTMLElement
      wrapper.appendChild(button)
    }
    else {
      // common result node
      const titleWrapperNode = resultNode.querySelector('.yuRUbf') as HTMLElement
      // const titleNode = titleWrapperNode.querySelector('a') as HTMLAnchorElement
      const subtitleNode = resultNode.querySelector('.B6fmyf') as HTMLElement
      const urlNode = subtitleNode.querySelector('.TbwUpd') as HTMLElement
      titleWrapperNode.classList.add('cft-result-title-wrapper')
      // titleNode.classList.add('cft-result-title')
      subtitleNode.classList.add('cft-result-subtitle')
      urlNode.classList.add('cft-url')

      const hintWrapperNode = subtitleNode.querySelector('.eFM0qc') as HTMLElement
      hintWrapperNode.appendChild(button)
    }

    return button
  }

  protected addUndoHintNode(resultNode: HTMLElement, buttonText: string, undoHintText: string): HTMLElement | null {
    const domain = this.getSourceDomain(resultNode)

    // Create undo button. An attribute is added so that we can infer the
    // terminated domain if the user clicks it later.
    const undoButton = document.createElement('a')
    undoButton.setAttribute('cft-domain', domain)
    undoButton.classList.add('cft-hint', 'cft-button')
    undoButton.textContent = buttonText

    if (GoogleWebsiteTerminator.isNewsResultNode(resultNode)) {
      const wrapper = resultNode.querySelector('.OSrXXb.ZE0LJd')!
      wrapper.appendChild(undoButton)
    }
    else {
      // Create undo hint message
      const undoHintNode = document.createElement('span')
      undoHintNode.textContent = undoHintText

      // Create undo node that contains hint and button. 
      const undoDiv = document.createElement('div')
      undoDiv.classList.add('cft-blocked-hint')
      undoDiv.classList.add(GoogleWebsiteTerminator.isNewsResultNode(resultNode) ? 'MkXWrd' : 'g')
      undoDiv.setAttribute('cft-domain', domain)
      undoDiv.appendChild(undoHintNode)
      undoDiv.appendChild(undoButton)

      // Insert undo node next to the (hidden) result node
      resultNode.parentNode!.insertBefore(undoDiv, resultNode.nextSibling)
    }

    return undoButton
  }

  protected async hideResults(elements: HTMLElement[], init: boolean): Promise<void> {
    const regular: HTMLElement[] = []
    const news: HTMLElement[] = []
    elements.forEach(x => GoogleWebsiteTerminator.isNewsResultNode(x) ? news.push(x) : regular.push(x))
    await Promise.all([
      greyOutElements(news, !init),
      hideElements(regular, !init)
    ])
  }

  protected async showResults(elements: HTMLElement[]): Promise<void> {
    const regular: HTMLElement[] = []
    const news: HTMLElement[] = []
    elements.forEach(x => GoogleWebsiteTerminator.isNewsResultNode(x) ? news.push(x) : regular.push(x))
    await Promise.all([
      greyInElements(news, true),
      showElements(regular, true)
    ])
  }
}
