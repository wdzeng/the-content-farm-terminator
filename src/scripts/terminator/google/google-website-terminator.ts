import { assert } from '@sindresorhus/is'

import { GoogleListedTerminator } from './google-listed-terminator'
import { greyInElements, greyOutElements, hideElements, showElements } from '../../util'

export class GoogleWebsiteTerminator extends GoogleListedTerminator {
  private static isNewsResultNode(resultNode: HTMLElement): boolean {
    return resultNode.classList.contains('MkXWrd')
  }

  constructor() {
    super('google-website')
  }

  static isVideoResultNode(resultNode: HTMLElement): boolean {
    return resultNode.classList.contains('dFd2Tb')
  }

  protected override getResultNodes(): HTMLElement[] {
    // Regular result nodes
    // div.g is regular result node
    let commonResultNodes = [...document.querySelectorAll<HTMLDivElement>('div.g')]
    commonResultNodes = commonResultNodes.filter(candidateNode => {
      // If a div.g has parent also div.g, it is not a result node
      const parentNode = candidateNode.parentElement
      assert.domElement(parentNode)
      if (parentNode.closest('div.g')) {
        return false
      }

      return (
        // Single result node.
        candidateNode.classList.contains('tF2Cxc') ||
        // Group result node that contains another `div.g`.
        candidateNode.querySelector('.tF2Cxc') !== null ||
        // Group result node that contains no `div.g`.
        // https://github.com/wdzeng/the-content-farm-terminator/issues/16
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        candidateNode.querySelector('.kvH3mc.BToiNc.UK95Uc') ||
        // Result node with a video; usually YouTube.
        GoogleWebsiteTerminator.isVideoResultNode(candidateNode)
      )

      // There is a little possibilities of mis-selections ...
    })

    // News result nodes may appear on Google Website Search
    const newsResultNodes = [...document.querySelectorAll<HTMLElement>('.MkXWrd')]

    return [...commonResultNodes, ...newsResultNodes]
  }

  protected override getSourceDomain(resultNode: HTMLElement): string {
    if (GoogleWebsiteTerminator.isNewsResultNode(resultNode)) {
      // News result node
      const a = resultNode.querySelector<HTMLAnchorElement>('a.WlydOe')
      assert.domElement(a)
      return a.hostname
    }

    const selector = GoogleWebsiteTerminator.isVideoResultNode(resultNode)
      ? '.DhN8Cf>a:first-child'
      : '.yuRUbf>a:first-child'

    const a = resultNode.querySelector<HTMLAnchorElement>(selector)
    assert.domElement(a)
    return a.hostname
  }

  protected override addHintNode(resultNode: HTMLElement, text: string): HTMLElement | null {
    let button = resultNode.querySelector<HTMLAnchorElement>('a.cft-hint')

    // If button already exists, remove it.
    if (button !== null) {
      button.remove()
    }

    // Create button.
    button = document.createElement('a')
    button.classList.add('cft-hint', 'cft-button')
    button.textContent = text
    button.href = '#'

    // Add button to the result node.
    if (GoogleWebsiteTerminator.isNewsResultNode(resultNode)) {
      // News result node.
      const wrapper = resultNode.querySelector('.OSrXXb.ZE0LJd')
      assert.domElement(wrapper)
      wrapper.appendChild(button)
    } else {
      const titleWrapperNode = GoogleWebsiteTerminator.isVideoResultNode(resultNode)
        ? resultNode.querySelector('.DhN8Cf')
        : resultNode.querySelector('.yuRUbf')
      assert.domElement(titleWrapperNode)
      titleWrapperNode.classList.add('cft-result-title-wrapper')

      const subtitleNode = resultNode.querySelector('.B6fmyf')
      assert.domElement(subtitleNode)
      subtitleNode.classList.add('cft-result-subtitle')

      const hintWrapperNode = subtitleNode.querySelector('.byrV5b')
      assert.domElement(hintWrapperNode)
      hintWrapperNode.appendChild(button)
    }

    return button
  }

  protected override addUndoHintNode(
    resultNode: HTMLElement,
    buttonText: string,
    undoHintText: string
  ): HTMLElement | null {
    const domain = this.getSourceDomain(resultNode)

    // Create undo button. An attribute is added so that we can infer the
    // terminated domain if the user clicks it later.
    const undoButton = document.createElement('a')
    undoButton.setAttribute('cft-domain', domain)
    undoButton.classList.add('cft-hint', 'cft-button')
    undoButton.textContent = buttonText

    // For news search result, simply add an undo button.
    if (GoogleWebsiteTerminator.isNewsResultNode(resultNode)) {
      // Since the result is not removed from the page, remove the terminate
      // button.
      const termButton = resultNode.querySelector('.cft-button')
      assert.domElement(termButton)
      termButton.remove()

      const wrapper = resultNode.querySelector('.OSrXXb.ZE0LJd')
      assert.domElement(wrapper)
      wrapper.appendChild(undoButton)
    }

    // For regular search result, add hint message.
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

      // Insert undo node next to the (hidden) result node.
      assert.domElement(resultNode.parentNode)
      resultNode.parentNode.insertBefore(undoDiv, resultNode.nextSibling)
    }

    return undoButton
  }

  protected override async hideResults(elements: HTMLElement[], init: boolean): Promise<void> {
    const regular: HTMLElement[] = []
    const news: HTMLElement[] = []
    for (const x of elements) {
      GoogleWebsiteTerminator.isNewsResultNode(x) ? news.push(x) : regular.push(x)
    }

    await Promise.all([greyOutElements(news, !init), hideElements(regular, !init)])
  }

  protected override async showResults(elements: HTMLElement[]): Promise<void> {
    const regular: HTMLElement[] = []
    const news: HTMLElement[] = []
    for (const x of elements) {
      GoogleWebsiteTerminator.isNewsResultNode(x) ? news.push(x) : regular.push(x)
    }

    await Promise.all([greyInElements(news, true), showElements(regular, true)])
  }
}
