import { ContentFarmTerminator } from './terminate.js'

export abstract class GoogleListedTerminator extends ContentFarmTerminator {
  
  private category: string

  constructor(category: string) {
    super()
    this.category = category
  }

  protected markSearchCategory(): void {
    const search = document.getElementById('search') as HTMLElement
    search.setAttribute('cft-search-category', this.category)
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
}

