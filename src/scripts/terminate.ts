import * as db from './database.js'
import { hideElements, isElementHidden, once, showElements, getI18nMessage as _ } from './util.js'

export abstract class ContentFarmTerminator {

  constructor() { }

  async init(): Promise<void> {
    // Get farm result nodes.
    const farmList = new Set(await db.getFarmList())
    const farmResultNodes = this.getResultNodes(farmList)

    if (farmResultNodes.length > 0) {
      // Hide farm result nodes.
      await hideElements(farmResultNodes, false)
      // Add a hint which allows user to show these results temporarily onto the
      // page.
      this.addShowFarmResultsOnceHint(farmResultNodes.length)
    }

    // Add "Terminate!" button to each search result. Already hidden farm result
    // nodes are excluded.
    const nonfarmResultNodes = this.getAllResultNodes().filter(resultNode => {
      const domain = this.getSourceDomain(resultNode)
      return !farmList.has(domain)
    })
    console.log('Non-farm result nodes')
    console.log(nonfarmResultNodes)
    nonfarmResultNodes.forEach(e => this.addTerminateHint(e))
  }

  private getResultNodes(domains: Set<string>): HTMLElement[] {
    return this.getAllResultNodes()
      .filter(resultNode => domains.has(this.getSourceDomain(resultNode)))
  }

  private addShowFarmResultsOnceHint(farmCount: number): void {
    const msg = _('showFarmResultsOnce', farmCount.toString())
    const [msgLeft, msgRight] = msg.split('#')
    const buttonText = _('showFarmResultsOneHint')

    const button = this.addShowFarmResultsOnceNode(msgLeft, buttonText, msgRight)
    button.onclick = once(async (e) => {
      e.preventDefault()

      // Add Get all blocked results that going to be shown.
      let blockedResultNodes = this.getAllResultNodes()
      blockedResultNodes = blockedResultNodes.filter(isElementHidden)
      const determinateHintText = _('determinateHint')

      blockedResultNodes.forEach(resultNode => {
        // Set there title to farm (red).
        this.markResultTitle(resultNode, true)

        // Add a "Determinate" hint to these results.
        const button = this.addHintNode(resultNode, determinateHintText)

        button.onclick = once(async (e) => {
          e.preventDefault()

          // Get other search items linking to same host and show them all.
          const domain = this.getSourceDomain(resultNode)
          const unblockedResultNodes = this.getResultNodes(new Set([domain]))
          // Since these results are unblocked, we should re-add the
          // "Terminate!" hint to them, and set title to safe (default font).
          unblockedResultNodes.forEach(unblockedResultNode => {
            this.markResultTitle(unblockedResultNode, false)
            this.addTerminateHint(unblockedResultNode)
          })

          // Remove this host to blocking list
          await db.removeHosts([domain])
        })
      })

      // Then we show the blocked results and hide the show-once hint.
      await Promise.all([
        showElements(blockedResultNodes, true),
        hideElements([this.getShowFarmResultsOnceNode()], true)
      ])
    })
  }

  private addTerminateHint(resultNode: HTMLElement): void {
    const domain = this.getSourceDomain(resultNode)
    const hintNode = this.addHintNode(resultNode, _('terminateHint'))

    hintNode.onclick = once(async (e) => {
      e.preventDefault()

      // Get other search items linking to same host and hide them all.
      const resultNodes = this.getAllResultNodes()
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
      const undoNodes = this.getUndoNodes(domain)
      undoNodes.forEach(undoNode => undoNode.remove())

      // Show hidden result nodes that are previous hidden.
      let unblockedResultNodes = this.getAllResultNodes()
      unblockedResultNodes = unblockedResultNodes.filter(resultNode => this.getSourceDomain(resultNode) === domain)
      unblockedResultNodes = unblockedResultNodes.filter(isElementHidden)
      await showElements(unblockedResultNodes, true)

      // No need to re-add "Terminate!" button since they are already added.
      //// Re-add 'Terminate!' button to these nodes
      //// unblockedResultNodes.forEach(this.addTerminateHint)

      // Remove domain from database
      await db.removeHosts([domain])
    })
  }

  // Queries all result nodes.
  protected abstract getAllResultNodes(): HTMLElement[]

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

  // Queries all undo node (elements having the same level as search results but
  // showing xxx is terminated hint) that matches the domain. These nodes are to
  // be hidden when the user clicks the undo button.
  protected abstract getUndoNodes(domain: string): HTMLElement[]

  // Marks the result title as farm result (red font) or non-farm (default).
  protected abstract markResultTitle(resultNode: HTMLElement, isFarm: boolean): void

  // Add a hint banner at the end of the webpage. Returns the button to be
  // click. Do not add listener to the button. It is super class's
  // responsibility.
  protected abstract addShowFarmResultsOnceNode(msgLeft: string, buttonText: string, msgRight: string): HTMLElement

  // Queries the banner node at the end of the webpage. This node is to be
  // hidden when the user clicks the show once button.
  protected abstract getShowFarmResultsOnceNode(): HTMLElement
}
