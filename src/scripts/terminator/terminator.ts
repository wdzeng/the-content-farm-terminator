import * as db from '../util/database'
import { hideElements, isElementHidden, once, showElements } from "../util"
import { getI18nMessage as _ } from '../util/i18n'

export abstract class Terminator {

  constructor(private category: string) { }

  async run(): Promise<void> {
    this.markSearchCategory()
    await this.init()
  }

  protected abstract init(): Promise<void>

  private markSearchCategory() {
    document.body.setAttribute('cft-search-category', this.category)
  }
}

export abstract class ListedTerminator extends Terminator {

  async init(): Promise<void> {
    // Get farm result nodes and non farm result nodes.
    const farmList = new Set(await db.getFarmList())
    const resultNodes = this.getResultNodes()
    const farmResultNodes: HTMLElement[] = []
    const nonfarmResultNodes: HTMLElement[] = []
    for (const resultNode of resultNodes) {
      const domain = this.getSourceDomain(resultNode)
      if (farmList.has(domain)) farmResultNodes.push(resultNode)
      else nonfarmResultNodes.push(resultNode)
    }

    // Add class to result nodes.
    resultNodes.forEach(resultNode => resultNode.classList.add('cft-result'))

    if (farmResultNodes.length > 0) {
      // Hide farm result nodes.
      farmResultNodes.forEach(resultNode => resultNode.classList.add('cft-farm-result'))
      hideElements(farmResultNodes, false) // fire and forget
      // Add a hint which allows user to show these results temporarily onto the
      // page.
      this.addShowFarmResultsOnceHint(farmResultNodes.length)
    }

    // Add "Terminate!" button to each search result. Already hidden farm result
    // nodes are excluded.
    nonfarmResultNodes.forEach(e => this.addTerminateHint(e))
  }

  private addShowFarmResultsOnceHint(farmCount: number): void {
    const msg = _('showFarmResultsOnce', farmCount.toString())
    const [msgLeft, msgRight] = msg.split('#')
    const buttonText = _('showFarmResultsOneHint')

    const button = this.addShowFarmResultsOnceNode(msgLeft, buttonText, msgRight)
    button.onclick = once(async (e) => {
      e.preventDefault()

      // Add Get blocked results that are going to be shown. Noted that not 
      // all hidden result nodes are selected. There may be result nodes that
      // are hidden on page loaded or on user clicks the "Terminate!" button,
      // and only the former ones are selected.
      let blockedResultNodes = this.getResultNodes()
      blockedResultNodes = blockedResultNodes.filter(resultNode => resultNode.classList.contains('cft-farm-result'))
      const determinateHintText = _('determinateHint')

      blockedResultNodes.forEach(resultNode => {
        // Set there title to farm (red).
        // resultNode.classList.add('')
        // this.markResultTitle(resultNode, true)

        // Add a "Determinate" hint to these results.
        const button = this.addHintNode(resultNode, determinateHintText)

        // Mark the result node as shown temporarily
        resultNode.classList.add('cft-farm-result-shown')

        button.onclick = once(async (e) => {
          e.preventDefault()

          // Get other search items linking to same host and show them all.
          const domain = this.getSourceDomain(resultNode)
          const unblockedResultNodes = this.getResultNodes().filter(resultNode => this.getSourceDomain(resultNode) === domain)
          // Since these results are unblocked, we should re-add the
          // "Terminate!" hint to them, and set title to safe (default font).
          unblockedResultNodes.forEach(unblockedResultNode => {
            unblockedResultNode.classList.remove('cft-farm-result', 'cft-farm-result-shown')
            this.addTerminateHint(unblockedResultNode)
          })

          // Remove this host to blocking list
          await db.removeHosts([domain])
        })
      })

      // Then we show the blocked results and hide the show-once hint.
      await Promise.all([
        showElements(blockedResultNodes, true),
        hideElements([document.getElementById('cft-temp-show') as HTMLElement], true)
      ])
    })
  }

  private addTerminateHint(resultNode: HTMLElement): void {
    const domain = this.getSourceDomain(resultNode)
    const hintNode = this.addHintNode(resultNode, _('terminateHint'))

    hintNode.onclick = once(async (e) => {
      e.preventDefault()

      // Get other search items linking to same host and hide them all.
      const resultNodes = this.getResultNodes()
      const nodesToBeHidden = resultNodes.filter(e => this.getSourceDomain(e) === domain)
      await hideElements(nodesToBeHidden, true) // wait for fade effect

      // THEN add undo hints to these nodes
      nodesToBeHidden.forEach(e => this.addUndoHint(e))

      // Add this host to blocking list
      await db.addHosts([domain])
    })
  }

  private addUndoHint(hiddenResultNode: HTMLElement): void {
    const domain = this.getSourceDomain(hiddenResultNode)
    const undoButton = this.addUndoHintNode(hiddenResultNode, _('undoHint'), _('terminatedMsg', domain))

    undoButton.onclick = once(async (e) => {
      e.preventDefault()

      // Get all undo node for the domain and removes them
      const undoNodes = document.querySelectorAll(`.cft-blocked-hint[cft-domain="${domain}"]`)
      undoNodes.forEach(undoNode => undoNode.remove())

      // Show hidden result nodes that are previous hidden.
      let unblockedResultNodes = this.getResultNodes()
      unblockedResultNodes = unblockedResultNodes.filter(resultNode => this.getSourceDomain(resultNode) === domain)
      unblockedResultNodes = unblockedResultNodes.filter(isElementHidden)
      await showElements(unblockedResultNodes, true)

      // Re-add 'Terminate!' button to these nodes
      unblockedResultNodes.forEach(resultNode => this.addTerminateHint(resultNode))

      // Remove domain from database
      await db.removeHosts([domain])
    })
  }

  // Queries all result nodes.
  protected abstract getResultNodes(): HTMLElement[]

  // Queries the domain name of a result node.
  protected abstract getSourceDomain(resultNode: HTMLElement): string

  // Add or set a hint to a result node. This function may be called for three 
  // scenario.
  // - The search page is just loaded so add "Terminate!" hint to each search
  //   results.
  // - The user clicks the "show farm result once" button, so hidden farm results
  //   are shown and added "Determinate" hint.
  // - The user clicks the "Determinate" hint mentioned above, so the hint
  //   is set to "Terminate!" as same as the first one.
  //
  // Returns the button element.
  protected abstract addHintNode(resultNode: HTMLElement, text: string): HTMLElement

  // Add an undo hint and button onto the page. Returns the button element. The
  // result node should be invisible but remains in the DOM tree. Do not add
  // click listener for the undo button. It is super class's responsibility.
  protected abstract addUndoHintNode(hiddenResultNode: HTMLElement, buttonText: string, undoHintText: string): HTMLElement

  // Add a hint banner at the end of the webpage. Returns the button to be
  // click. Do not add listener to the button. It is super class's
  // responsibility.
  protected abstract addShowFarmResultsOnceNode(msgLeft: string, buttonText: string, msgRight: string): HTMLElement
}

// Unlisted terminator is used for webpage whose search results are not a
// static list; for example Google Images, which search results are dynamically
// loaded blocks.
// Unlisted terminator does not support terminate or determinate on click
// action. Users must key in their own farm list via the popup. However this
// terminator still allows user to show farm results once.
export abstract class UnlistedTerminator extends Terminator {

  async init(): Promise<void> {
    const farmList = new Set(await db.getFarmList())

    // Since search results are dynamically loaded, an mutation observer is
    // needed.
    const ma = new MutationObserver((muts) => {
      for (const mut of muts) {
        for (let i = 0; i < mut.addedNodes.length; i++) {
          const addedNode = mut.addedNodes.item(i)
          if (addedNode instanceof HTMLElement && this.isSearchResult(addedNode)) {
            addedNode.classList.add('cft-result')
            const domain = this.getSourceDomain(addedNode)
            if (farmList.has(domain)) {
              addedNode.classList.add('cft-farm-result')
              hideElements([addedNode], false) // fire and forget
            }
          }
        }
      }
    })
    const resultContainer = this.getSearchResultWrapper()
    ma.observe(resultContainer, { childList: true })

    // Hide current appeared farm results
    const resultNodes = this.getCurrentSearchResults()
    resultNodes.forEach(e => e.classList.add('cft-result'))

    const farmResultNodes = resultNodes.filter(e => farmList.has(this.getSourceDomain(e)))
    farmResultNodes.forEach(e => e.classList.add('cft-farm-result'))
    // hideElements(farmResultNodes, false) // fire and forget

    // Add option to allow user stops the terminator
    const [msgLeft, buttonText, msgRight] = _('imageTerminatorRunningHint').split('#')
    const cancelButton = this.addCancelTerminatorHint(msgLeft, buttonText, msgRight)
    cancelButton.onclick = once(async (e) => {
      e.preventDefault()
      ma.disconnect()

      const tempHintNode = document.getElementById('cft-temp-show') as HTMLElement
      const hiddenFarmImageResults = Array.from(resultContainer.querySelectorAll('.cft-farm-result')) as HTMLElement[]
      hiddenFarmImageResults.forEach(e => e.classList.remove('cft-farm-result'))
      await hideElements([tempHintNode], true)
    })
  }

  abstract getSearchResultWrapper(): HTMLElement

  abstract isSearchResult(e: HTMLElement): boolean

  abstract getCurrentSearchResults(): HTMLElement[]

  abstract getSourceDomain(resultNode: HTMLElement): string

  abstract addCancelTerminatorHint(msgLeft: string, buttonText: string, msgRight: string): HTMLElement
}
