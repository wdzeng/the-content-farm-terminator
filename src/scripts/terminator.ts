'use strict'

var _ = chrome.i18n.getMessage
init()

// Utilities

async function tick() {
  return new Promise(res => window.requestAnimationFrame(res))
}

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
async function fadeOut(els: HTMLElement[], now?: boolean): Promise<void> {
  return new Promise(res => {
    if (now) {
      els.forEach(el => el.style.display = 'none')
      res()
      return
    }

    function transitionEndHandler(event: Event) {
      const el = event.target as HTMLElement
      el.style.display = 'none'
      res()
    }
  
    els.forEach(el => {
      el.addEventListener('webkitTransitionEnd', transitionEndHandler, { once: true })
      el.style['transition-property'] = 'opacity'
      el.style['transition-duration'] = '200ms'
      el.style.opacity = '0'
    })
  })
}

async function fadeIn(els: HTMLElement[], now?: boolean): Promise<void> {
  return new Promise((res) => {
    if (now) {
      els.forEach((el) => {
        el.style.opacity = '1'
        el.style.display = 'block'
      })
      res()
      return
    }

    els.forEach(async el => {
      el.style.display = 'block'
      await tick()
      el.addEventListener('webkitTransitionEnd', () => res(), { once: true })
      el.style.opacity = '1'
    })
  })
}

// https://www.w3schools.com/howto/howto_js_check_hidden.asp
function isElementHidden(el: HTMLElement) {
  const style = window.getComputedStyle(el)
  return style.display === 'none' || style.visibility === 'hidden'
}

function once(callback: (_: Event) => any) {
  let flag = true
  return (e: Event) => {
    if (flag) {
      flag = false
      callback(e)
    } else {
      e.preventDefault()
    }
  }
}

// Scripts

async function init() {
  const farmList = await farmListDatabase.getFarmList()
  // Get farm results
  const farmResultNodes = getResultNodes(farmList)
  const nFarmResult = farmResultNodes.length
  // If any search result of farm exists
  if (nFarmResult) {
    // Hide these search results
    await fadeOut(farmResultNodes, true)
    // Add a hint which allows user to show these results temporarily.
    addShowResultsOnceHint(nFarmResult)
  }
  addBlockHint(getResultNodes(undefined, 'visible'))
}

/**
 * Sets a hint for some search results. If the hint already exists, update it. If the hint does not exists, insert a new one.
 */
function setHintForSearchItem(
  resultNode: HTMLDivElement | HTMLDivElement[],
  text: string,
  onClickListener: (node: HTMLDivElement) => any
) {
  if (Array.isArray(resultNode)) {
    resultNode.forEach((node) =>
      setHintForSearchItem(node, text, onClickListener)
    )
    return
  }

  // Get the hint anchor of these results and check if it exists.
  let hintNode = resultNode.querySelector<HTMLAnchorElement>('a.cft-hint')

  if (hintNode !== null) {
    // If a hint already exists, just update this hint.
    hintNode.innerHTML = text
    hintNode.onclick = once((e) => {
      onClickListener(resultNode)
      e.preventDefault()
    })
    return
  }

  // If a hint does not exits, create a new hint.
  const hintTextNode = document.createTextNode(text)
  hintNode = document.createElement('a')
  hintNode.classList.add('fl')
  hintNode.classList.add('cft-hint')
  hintNode.appendChild(hintTextNode)
  hintNode.href = '#'
  hintNode.onclick = once((e) => {
    onClickListener(resultNode)
    e.preventDefault()
  })

  // Add these hints to page
  // const $eTitles = $('div.yuRUbf', $srItem)
  const titlesNode = resultNode.querySelector('div.yuRUbf')!
  // const $eSubtitle = $('div.B6fmyf', $eTitles)
  const subtitleNode = resultNode.querySelector('div.B6fmyf')!
  // const $eTitle = $('a', $eTitles)
  const titleNode = titlesNode.querySelector<HTMLAnchorElement>('a')!
  // const $eUrl = $('div.TbwUpd', $eSubtitle)
  const urlNode = subtitleNode.querySelector('div.TbwUpd')!
  // const $eHintContainer = $('div.eFM0qc', $eSubtitle)
  const hintWrapperNode = subtitleNode.querySelector('div.eFM0qc')!
  console.log(hintWrapperNode)

  titlesNode.classList.add('cft-titles')
  titleNode.classList.add('cft-title')
  subtitleNode.classList.add('cft-subtitle')
  urlNode.classList.add('cft-url')
  hintWrapperNode.appendChild(hintNode)
}

/**
 * Adds 'Block this domain' hint ti search results
 */
function addBlockHint(resultNodes: HTMLDivElement[]) {
  setHintForSearchItem(
    resultNodes,
    _('terminateHint'),
    onBlockHintClickedListener
  )
}

/**
 * This function is called when user clicked 'block' button
 */
async function onBlockHintClickedListener(blockedNode: HTMLDivElement) {
  const hostName = getHostnameOf(blockedNode)
  // Get other search items linking to same host and hide them all.
  const blockedCandidates = getResultNodes(hostName, 'visible')
  await fadeOut(blockedCandidates)
  blockedCandidates.forEach((n) => addUndoHint(n))
  // Add this host to blocking list
  farmListDatabase.addHosts(hostName)
}

/**
 * Adds 'unblock this domain' hint to search results
 */
async function addUnblockHint(resultNodes: HTMLDivElement[]) {
  setHintForSearchItem(
    resultNodes,
    _('unTerminatedHint'),
    async (unblockedNode: HTMLDivElement) => {
      const hostName = getHostnameOf(unblockedNode)
      // Get other search items linking to same host and show them all.
      const unblockedNodes = getResultNodes(hostName)
      unblockedNodes
        .map((n) => n.querySelectorAll('h3.LC20lb')!)
        .flatMap(els => Array.from(els))
        .forEach((h) => h.classList.remove('cft-farm-title'))
      addBlockHint(unblockedNodes)
      // Remove this host to blocking list
      await farmListDatabase.removeHosts(hostName)
    }
  )
}

/**
 * Adds 'undo' hint to a search result
 */
function addUndoHint(resultNode: HTMLDivElement) {
  const hostname = getHostnameOf(resultNode)
  const undoNodeClass = `cft-${hostname.replace(/\./g, '-')}`

  // Create undo button
  const undoButtonTextNode = document.createTextNode(_('undoHint'))
  const undoButtonNode = document.createElement('a')
  undoButtonNode.appendChild(undoButtonTextNode)
  undoButtonNode.classList.add('cft-undo-hint')
  undoButtonNode.onclick = once(async (e) => {
    // Remove nodes that shows 'This hostname is blocked'
    const removedNodes = document.querySelectorAll(`div.${undoNodeClass}`)
    removedNodes.forEach((n) => n.remove())
    // Re-show 'Block this host' hint
    const unblockedNodes = getResultNodes(hostname, 'hidden')
    await fadeIn(unblockedNodes)
    addBlockHint(unblockedNodes)
    // Remove this host from database
    farmListDatabase.removeHosts(hostname)
    e.preventDefault()
  })

  // Create undo node
  const undoMsgTextNode = document.createTextNode(
    _('terminatedMsg', hostname)
  )
  const undoMsgNode = document.createElement('span')
  undoMsgNode.appendChild(undoMsgTextNode)
  const undoNode = document.createElement('div')
  undoNode.classList.add('g')
  undoNode.classList.add('cft-blocked-hint')
  undoNode.classList.add(undoNodeClass)
  undoNode.appendChild(undoMsgNode)
  undoNode.appendChild(undoButtonNode)

  // Insert undo node to the page
  // $srItems.after($txtUndo)
  resultNode.parentNode!.insertBefore(undoNode, resultNode.nextSibling)
}

/**
 * Queries the hostname where a result node points to
 */
function getHostnameOf(resultNode: HTMLDivElement): string {
  const anchorNode = resultNode.querySelector<HTMLAnchorElement>(
    'div.yuRUbf > a:first-child'
  )!
  return anchorNode.hostname
}

/**
 * Shows hint message that allows user to show all blocker results for once
 */
function addShowResultsOnceHint(nHidden: number) {
  const hintNode = document.createElement('div')
  hintNode.id = 'cft-temp-show'
  hintNode.classList.add('med')

  const anchorTextNode = document.createTextNode(_('showFarmResultsOneHint'))
  const anchorNode = document.createElement('a')
  anchorNode.href = '#'
  anchorNode.classList.add('cft')
  anchorNode.appendChild(anchorTextNode)
  anchorNode.onclick = once((e) => {
    showFarmResultsOnce()
    fadeOut([hintNode])
    e.preventDefault()
  })

  const hintMessageTextNodes = _('showFarmResultsOnce', nHidden.toString())
    .split('#')
    .map((txt) => document.createTextNode(txt))
  const hintMessageNode = document.createElement('p')
  hintMessageNode.appendChild(hintMessageTextNodes[0])
  hintMessageNode.appendChild(anchorNode)
  hintMessageNode.appendChild(hintMessageTextNodes[1])

  hintNode.appendChild(hintMessageNode)
  const resultNode = document.getElementById('res') as HTMLElement
  //  $('#res').after($div)
  resultNode.parentNode!.insertBefore(hintNode, resultNode.nextSibling)
}

/**
 * Shows all blocked search result for once
 */
function showFarmResultsOnce() {
  const farmResults = getResultNodes(undefined, 'hidden')
  farmResults.forEach((fr) => {
    const resultTitleNodes = fr.querySelectorAll('h3.LC20lb')
    resultTitleNodes.forEach(el => el.classList.add('cft-farm-title') )
    addUnblockHint([fr])
  })
  fadeIn(farmResults)
}

/**
 * Queries all result nodes which match given hostname and visibility restricts.
 */
function getResultNodes(
  host?: string | string[],
  visibility?: 'visible' | 'hidden'
): HTMLDivElement[] {
  function isResultNode(resultNodeCandidate: HTMLDivElement) {
    return (
      resultNodeCandidate.classList.contains('tF2Cxc') ||
      resultNodeCandidate.querySelector('div.tF2Cxc') !== null ||
      resultNodeCandidate.querySelector('div.jtfYYd') !== null
    )
  }

  let candidates = Array.from(
    document.querySelectorAll<HTMLDivElement>('div.g')
  ).filter((c) => !c.classList.contains('cft-blocked-hint') && isResultNode(c))

  if (visibility === 'hidden') {
    candidates = candidates.filter(isElementHidden)
  } else {
    candidates = candidates.filter((e) => !isElementHidden(e))
  }

  if (typeof host === 'string') {
    return candidates.filter((value) => getHostnameOf(value) === host)
  }
  if (Array.isArray(host)) {
    return candidates.filter((value) => host.includes(getHostnameOf(value)))
  }
  return candidates
}
