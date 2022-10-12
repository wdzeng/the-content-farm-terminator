import { UnlistedTerminator } from '../terminator'

export class GoogleImageTerminator extends UnlistedTerminator {
  constructor() {
    super('google-image')
  }

  protected getSearchResultWrapper(): HTMLElement {
    return document.querySelector('.islrc') as HTMLDivElement
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
    const nodes = document.querySelectorAll('.islrc>.isv-r.PNCib.MSM1fd.BUooTd')
    return Array.from(nodes) as HTMLElement[]
  }

  protected getSourceDomain(resultNode: HTMLElement): string {
    return resultNode.querySelector('.fxgdke')!.textContent!
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
    p.append(
      document.createTextNode(msgLeft),
      button,
      document.createTextNode(msgRight)
    )
    p.id = 'cft-temp-show'
    p.classList.add('cft-image-temp-hint')

    const wrapper = document.querySelector('.mJxzWe') as HTMLElement
    wrapper.prepend(p)

    return button
  }
}
