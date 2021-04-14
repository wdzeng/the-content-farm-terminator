'use strict'

var _ = chrome.i18n.getMessage
init()

// Utilities

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
function fadeOut(els: HTMLElement[], now?: boolean): Promise<void> {
  return new Promise((res) => {
    if (now) {
      els.forEach((el) => (el.style.display = 'none'))
      res()
      return
    }

    let op = 1 // initial opacity
    const timer = setInterval(function () {
      if (op <= 0.1) {
        clearInterval(timer)
        els.forEach((el) => (el.style.display = 'none'))
        res()
        return
      }

      els.forEach((el) => {
        el.style.opacity = op.toString()
        el.style.filter = 'alpha(opacity=' + op * 100 + ')'
      })
      op *= 0.8
    }, 30)
  })
}
function fadeIn(els: HTMLElement[], now?: boolean): Promise<void> {
  return new Promise((res) => {
    if (now) {
      els.forEach((el) => {
        el.style.display = 'block'
        el.style.opacity = '1'
        el.style.filter = 'alpha(opacity=100)'
      })
      res()
      return
    }

    let op = 0.1 // initial opacity
    els.forEach((el) => (el.style.display = 'block'))
    const timer = setInterval(function () {
      if (op >= 1) {
        clearInterval(timer)
        res()
        return
      }
      els.forEach((el) => {
        el.style.opacity = op.toString()
        el.style.filter = `alpha(opacity=${op * 100})`
      })
      op *= 1.25
    }, 30)
  })
}
// https://www.w3schools.com/howto/howto_js_check_hidden.asp
function isElementHidden(el: HTMLElement) {
  const style = window.getComputedStyle(el)
  return style.display === 'none' || style.visibility === 'hidden'
}
function makeInvokedOnceOnly(callback: (_: Event) => any) {
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

/**
 * Check whether an google account is logged in.
 */
/*
function isLogin() {
  const citeNode = document.querySelector('cite.iUh30')!
  const citeNodeStyle = getComputedStyle(citeNode)
  return citeNodeStyle.color === 'rgb(0, 102, 33)'
}
*/

async function init() {
  const farmList = await farmListDatabase.getFarmList()
  // Get farm results
  const farmResultNodes = getResultNodes(farmList)
  const nFarmResult = farmResultNodes.length
  // If any serach result of farm exists
  if (nFarmResult) {
    // Hide these search results
    await fadeOut(farmResultNodes, true)
    // If the first result is removed, add some margin to make the page pretty.
    updateTopMarginIfFirstResultIsBlocked()
    // Add a hint which allows user to show these results temporarily.
    addShowResultsOnceHint(nFarmResult)
  }
  addBlockHint(getResultNodes(undefined, 'visible'))
}

/**
 * Sets a hint for some search results. If the hint alreadt exists, update it. If the hint does not exists, insert a new one.
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
    hintNode.onclick = makeInvokedOnceOnly((e) => {
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
  hintNode.onclick = makeInvokedOnceOnly((e) => {
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
  const urlNode = subtitleNode?.querySelector('div.TbwUpd')!
  // const $eHintContainer = $('div.eFM0qc', $eSubtitle)
  const hintWrapperNode = subtitleNode.querySelector('div.eFM0qc')!

  titlesNode.classList.add('cft-titles')
  titleNode.classList.add('cft-title')
  subtitleNode.classList.add('cft-subtitle')
  urlNode.classList.add('cft-url')
  hintWrapperNode.appendChild(hintNode)

  // If the url hint is too long
  // the layout will be broken
  // We should limit the url length
  /*$('cite.iUh30').each(function () {
        const pWidth = $(this).parent("g").width();
        const tWidth = $(this).width();
        if (pWidth - tWidth >= 95) return;
        let url = $(this).html();
        if (url.endsWith('...')) url = url.substring(0, url.length - 3);
        let slen = url.length;
        slen -= parseInt(text.length * 2.5);
        slen = Math.max(0, slen);
        url = url.substring(0, slen);
        url += '...';
        $(this).html(url);
    })*/
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
    _('terminateHint'),
    async (unblockedNode: HTMLDivElement) => {
      const hostName = getHostnameOf(unblockedNode)
      // Get other search items linking to same host and show them all.
      const unblockedNodes = getResultNodes(hostName)
      // $('h3.LC20lb', unblockedNodes).removeClass('cft-farm-title')
      unblockedNodes
        .map((n) => n.querySelector('h3.LC20lb')!)
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
  const undoNodeClassname = `cft-${hostname.replace(/\./g, '-')}`

  // Create undo button
  const undoButtonTextNode = document.createTextNode(_('undoHint'))
  const undoButtonNode = document.createElement('a')
  undoButtonNode.appendChild(undoButtonTextNode)
  undoButtonNode.onclick = makeInvokedOnceOnly(async (e) => {
    // Remove nodes that shows 'This hostname is blocked'
    const removedNodes = document.querySelectorAll(`div.${undoNodeClassname}`)
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
    _('unTerminatedMsg', hostname)
  )
  const undoMsgNode = document.createElement('span')
  undoMsgNode.appendChild(undoMsgTextNode)
  const undoNode = document.createElement('div')
  undoNode.classList.add('g')
  undoNode.classList.add('cft-blocked-hint')
  undoNode.classList.add(undoNodeClassname)
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
 * Removes extra margin between image-box and the top-bar so that the webpage looks pretty.
 */
function updateTopMarginIfFirstResultIsBlocked() {
  /* 
  let first = document.querySelector('div.g:not([style*=\'display: none\'])')
   if (first && first.id === 'imagebox_bigimages') {
     first.firstChild.style.marginTop = '0'
     return true
   }
   return false
   */
}

/**
 * Shows hint message that allows user to show all blocker results for once
 */
function addShowResultsOnceHint(nHidden: number) {
  const hintNode = document.createElement('div')
  hintNode.id = 'cft-temp-show'
  hintNode.classList.add('med')

  const anchorTextNode = document.createTextNode(_('templyShowAllHint'))
  const anchorNode = document.createElement('a')
  anchorNode.href = '#'
  anchorNode.classList.add('cft')
  anchorNode.appendChild(anchorTextNode)
  anchorNode.onclick = makeInvokedOnceOnly((e) => {
    showFarmResultsOnce()
    fadeOut([hintNode])
    e.preventDefault()
  })

  const hintMessageTextNodes = _('templyShowAllMsg', nHidden.toString())
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
    const resultTitleNode = fr.querySelector('h3.LC20lb')!
    resultTitleNode.classList.add('cft-farm-title')
    addUnblockHint([fr])
  })
  fadeIn(farmResults)
}

/**
 * Qeuries all result nodes which match given hostname and visibility restricts.
 */
function getResultNodes(
  host?: string | string[],
  visibility?: 'visible' | 'hidden'
): HTMLDivElement[] {
  
  function isResultNode(resultNodeCaididate: HTMLDivElement) {
    // const firstChild = resultNodeCaididate.firstChild as
    //  | HTMLDivElement
    //  | undefined
    // return firstChild && firstChild.classList.contains('tF2Cxc')
    const testedTarget = resultNodeCaididate.querySelector('div.tF2Cxc');
    return testedTarget !== null;
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
