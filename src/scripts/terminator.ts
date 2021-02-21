'use strict'

var _ = chrome.i18n.getMessage
hideFarmResultNodes()

// Utilities

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
function fadeOut(el: HTMLElement): Promise<void> {
  return new Promise(res => {
    let op = 1;  // initial opacity
    const timer = setInterval(function () {
      if (op <= 0.1) {
        clearInterval(timer);
        el.style.display = 'none';
        res()
        return
      }
      el.style.opacity = op.toString();
      el.style.filter = 'alpha(opacity=' + op * 100 + ")";
      op *= 0.9;
    }, 50);
  })

}
function fadeIn(element: HTMLElement): Promise<void> {
  return new Promise(res => {
    let op = 0.1;  // initial opacity
    element.style.display = 'block';
    const timer = setInterval(function () {
      if (op >= 1) {
        clearInterval(timer);
        res()
        return
      }
      element.style.opacity = op.toString();
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
      op *= 1.1;
    }, 10);
  })
}
// https://www.w3schools.com/howto/howto_js_check_hidden.asp
function isElementHidden(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  return style.display === 'none' || style.visibility === 'hidden'
}
function one(callback: (_: Event) => any) {
  let flag = true
  return (e: Event) => {
    if (flag) {
      flag = false
      callback(e)
    }
    else {
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

async function hideFarmResultNodes() {
  const farmList = await farmListDatabase.getFarmList()
  // Get farm results
  const farmResultNodes = getResultNodes(farmList)
  const nFarmResult = farmResultNodes.length
  // If any serach result of farm exists
  if (nFarmResult) {
    // Hide these search results
    farmResultNodes.forEach(fadeOut)
    // If the first result is removed, add some margin to make the page pretty.
    updateTopMarginIfFirstResultIsBlocked()
    // Add a hint which allows user to show these results temporarily.
    addShowResultsOnceHint(nFarmResult)
  }
  // After farm results are hidden, add "block this domain" hint to the remaining results.
  addBlockHint(getResultNodes(undefined, 'visible'))
}

/**
 * Set a hint for some search results. If the hint alreadt exists, update it. If the hint does not exists, insert a new one.
 */
function setHintForSearchItem(resultNode: HTMLDivElement | HTMLDivElement[], text: string, onClickListener: (node: HTMLDivElement) => any) {
  if (Array.isArray(resultNode)) {
    resultNode.forEach(node => setHintForSearchItem(node, text, onClickListener))
    return
  }

  // Get the hint anchor of these results and check if it exists.
  let hintNode = resultNode.querySelector<HTMLAnchorElement>('a.cft-hint')

  if (hintNode !== null) {
    // If a hint already exists, just update this hint.
    hintNode.innerHTML = text
    hintNode.onclick = one(() => onClickListener(resultNode))
    return
  }

  // If a hint does not exits, create a new hint.
  const hintTextNode = document.createTextNode(text)
  hintNode = document.createElement('a')
  hintNode.classList.add('fl')
  hintNode.classList.add('cft-hint')
  hintNode.appendChild(hintTextNode)
  hintNode.href = '#'
  hintNode.onclick = one(() => onClickListener(resultNode))

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

  titlesNode.classList.add('cft-title')
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
 * Add 'Block this domain' hint ti search results
 */
function addBlockHint(resultNodes: HTMLDivElement[]) {
  setHintForSearchItem(resultNodes, _('terminateHint'), blockedNode => {
    const hostName = getResultNodeHostname(blockedNode)
    // Get other search items linking to same host and hide them all.
    const blockedCandidates = getResultNodes(hostName)
    blockedCandidates.forEach(async (n) => {
      await fadeOut(n)
      addUndoHint(n)
    })
    // Add this host to blocking list
    farmListDatabase.addHosts(hostName)
  })
}

/**
 * Add 'unblock this domain' hint to search results
 */
async function addUnblockHint(resultNodes: HTMLDivElement[]) {
  setHintForSearchItem(resultNodes, _('terminateHint'), async (unblockedNode: HTMLDivElement) => {
    const hostName = getResultNodeHostname(unblockedNode)
    // Get other search items linking to same host and show them all.
    const unblockedNodes = getResultNodes(hostName)
    // $('h3.LC20lb', unblockedNodes).removeClass('cft-farm-title')
    unblockedNodes.map(n => n.querySelector('h3.LC201b')!)
      .forEach(h => h.classList.remove('cft-farm-title'))
    addBlockHint(unblockedNodes)
    // Remove this host to blocking list
    await farmListDatabase.removeHosts(hostName)
  })
}

/**
 * Add 'undo' hint to a search result
 */
function addUndoHint(resultNode: HTMLDivElement) {
  const hostname = getResultNodeHostname(resultNode)
  const undoNodeClassname = `cft-${hostname.replace(/\./g, '-')}`

  // Create undo button
  const undoButtonTextNode = document.createTextNode(_('undoHint'))
  const undoButtonNode = document.createElement('a')
  undoButtonNode.appendChild(undoButtonTextNode)
  undoButtonNode.onclick = one(e => {
    // Remove nodes that shows 'This hostname is blocked'
    const removedNodes = document.querySelectorAll(`div.${undoNodeClassname}`)
    removedNodes.forEach(n => n.remove())
    // Re-show 'Block this host' hint
    const unblockedNodes = Array.from(document.querySelectorAll<HTMLDivElement>('div.g'))
      .filter(node => getResultNodeHostname(node) === hostname)
    addBlockHint(unblockedNodes)
    // Remove this host from database
    farmListDatabase.removeHosts(hostname)
    e.preventDefault()
  })

  // Create undo node
  const undoMsgTextNode = document.createTextNode(_('unTerminatedMsg', hostname))
  const undoMsgNode = document.createElement('span')
  undoMsgNode.appendChild(undoMsgTextNode)
  const undoNode = document.createElement('div')
  undoNode.classList.add('g')
  undoNode.classList.add('s')
  undoNode.classList.add(undoNodeClassname)
  undoNode.appendChild(undoMsgNode)
  undoNode.appendChild(undoButtonNode);

  // Insert undo node to the page
  // $srItems.after($txtUndo)
  resultNode.parentNode!.insertBefore(undoNode, resultNode.nextSibling)
}

/**
 * Get the hostname where a result node points to
 * @param resultNode 
 */
function getResultNodeHostname(resultNode: HTMLDivElement) {
  const anchorNode = resultNode.querySelector<HTMLAnchorElement>('div.yuRUbf > a:first-child')!
  return anchorNode.hostname
}

/**
 * Remove extra margin between image-box and the top-bar so that the webpage looks pretty.
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

function addShowResultsOnceHint(nHidden: number) {
  const hintNode = document.createElement('div')
  hintNode.id = 'cft-temp-show'
  hintNode.classList.add('med')

  const anchorTextNode = document.createTextNode(_('templyShowAllHint'))
  const anchorNode = document.createElement('a')
  anchorNode.href = '#'
  anchorNode.classList.add('cft')
  anchorNode.appendChild(anchorTextNode)
  anchorNode.onclick = one(e => {
    showFarmResultsOnce()
    fadeOut(hintNode)
    e.preventDefault()
  })

  const hintMessageTextNodes = _('templyShowAllMsg', nHidden.toString()).split('#').map(document.createTextNode)
  const hintMessageNode = document.createElement('p')
  hintMessageNode.appendChild(hintMessageTextNodes[0])
  hintMessageNode.appendChild(anchorNode)
  hintMessageNode.appendChild(hintMessageTextNodes[1])

  hintNode.appendChild(hintMessageNode)
  const resultNode = document.getElementById('res') as HTMLElement
  //  $('#res').after($div)
  resultNode.parentNode!.insertBefore(hintNode, resultNode.nextSibling)
}

function showFarmResultsOnce() {
  const farmResults = getResultNodes(undefined, 'hidden')
  farmResults.forEach(fr => {
    const resultTitleNode = fr.querySelector('h3.LC201b')!
    resultTitleNode.classList.add('cft-farm-title')
    addUnblockHint([fr])
  })
  farmResults.forEach(fadeIn)
}

function getResultNodes(host?: string | string[], visibility?: 'visible' | 'hidden'): HTMLDivElement[] {
  let candidates = Array.from(document.querySelectorAll<HTMLDivElement>('div.g'))
  if (host === undefined) {
    return candidates
  }
  if (visibility === 'hidden') {
    candidates = candidates.filter(isElementHidden)
  }
  else {
    candidates = candidates.filter(e => !isElementHidden(e))
  }

  if (typeof host === 'string') {
    return candidates.filter((value) => getResultNodeHostname(value) === host)
  }

  return candidates.filter((value) => host.includes(getResultNodeHostname(value)))
}
