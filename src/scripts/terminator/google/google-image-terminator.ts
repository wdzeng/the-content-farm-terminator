import { assert } from '@sindresorhus/is'

import { UnlistedTerminator } from '../terminator'

export class GoogleImageTerminator extends UnlistedTerminator {
  constructor() {
    super('google-image')
  }

  protected getSearchResultWrapper(): HTMLElement {
    const wrapper = document.querySelector('.islrc')
    assert.domElement(wrapper)
    return wrapper
  }

  protected isSearchResult(e: HTMLElement): boolean {
    return (
      e.classList.contains('isv-r') &&
      e.classList.contains('PNCib') &&
      e.classList.contains('MSM1fd') &&
      e.classList.contains('BUooTd')
    )
  }

  protected getCurrentSearchResults(): HTMLElement[] {
    const nodes = document.querySelectorAll<HTMLElement>('.islrc>.isv-r.PNCib.MSM1fd.BUooTd')
    return [...nodes]
  }

  protected override getSourceDomain(resultNode: HTMLElement): string {
    const domainTextElement = resultNode.querySelector('.fxgdke')
    assert.domElement(domainTextElement)
    assert.nonEmptyStringAndNotWhitespace(domainTextElement.textContent)
    return domainTextElement.textContent
  }

  protected addCancelTerminatorHint(
    msgLeft: string,
    buttonText: string,
    msgRight: string
  ): HTMLElement {
    const button = document.createElement('a')
    button.href = '#'
    button.classList.add('cft-button')
    button.textContent = buttonText

    const p = document.createElement('p')
    p.append(document.createTextNode(msgLeft), button, document.createTextNode(msgRight))
    p.id = 'cft-temp-show'
    p.classList.add('cft-image-temp-hint')

    const wrapper = document.querySelector('.mJxzWe')
    assert.domElement(wrapper)
    wrapper.prepend(p)

    return button
  }
}
