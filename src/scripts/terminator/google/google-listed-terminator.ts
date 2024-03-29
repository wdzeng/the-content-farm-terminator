import { assert } from '@sindresorhus/is'

import { ListedTerminator } from '../terminator'

export abstract class GoogleListedTerminator extends ListedTerminator {
  protected override addShowFarmResultsOnceNode(
    msgLeft: string,
    buttonText: string,
    msgRight: string
  ): HTMLElement {
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
    const botStuff = document.getElementById('botstuff')
    assert.domElement(botStuff)
    botStuff.prepend(hintNode)

    return a
  }
}
