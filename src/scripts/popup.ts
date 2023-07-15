import is from '@sindresorhus/is'

import * as db from './utils/database'
import { isValidHostname, isValidUrl } from './utils/hostname'
import { getI18nMessage as _, parseDocument } from './utils/i18n'

const EMOJI_PASS = '😀'
const EMOJI_DUPLICATED = '🤨'
const EMOJI_FOUL = '😭'
const textarea = document.getElementById('txtArea') as HTMLTextAreaElement
const btnAdd = document.getElementById('btnAdd') as HTMLInputElement
const btnDelete = document.getElementById('btnDelete') as HTMLInputElement
const btnView = document.getElementById('btnViewAll') as HTMLInputElement
const divHint = document.getElementById('hint') as HTMLSpanElement

function actionResult(hostArray: (string | undefined)[], passedHosts: string[]) {
  return hostArray.map((value, index) => {
    if (value === undefined) {
      return EMOJI_FOUL
    }
    if (!passedHosts.includes(value)) {
      return EMOJI_DUPLICATED
    }
    return hostArray.indexOf(value) === index ? EMOJI_PASS : EMOJI_DUPLICATED
  })
}

function updateHint(title: string, content: string[]) {
  const pTitle = document.createElement('p')
  pTitle.textContent = title
  const pHint = document.createElement('p')
  let first = true
  for (const contentLine of content) {
    if (first) {
      first = false
    } else {
      pHint.appendChild(document.createElement('br'))
    }
    pHint.appendChild(document.createTextNode(contentLine))
  }
  divHint.replaceChildren(pTitle, pHint)
}

async function onAddHostsListener() {
  if (isTextAreaEmpty()) {
    return
  }

  const lines = textarea.value
    .split('\n')
    .map(str => str.trim())
    .filter(isValidLine)
  if (lines.length === 0) {
    return
  }

  const hosts = lines.map(getHostnameFromLine)
  const validHosts = hosts.filter(is.string)
  const newlyBlockedHosts = await db.addHosts(validHosts)

  const resultList = actionResult(hosts, newlyBlockedHosts)
  const text = lines.map((line, index) => `${resultList[index]} ${line}`).join('\n')
  const nNewlyBlocked = resultList.filter(e => e === EMOJI_PASS).length

  let title: string
  if (nNewlyBlocked === lines.length) {
    title = _('allAdded', nNewlyBlocked.toString())
  } else if (nNewlyBlocked === 0) {
    title = _('nothingChanged')
  } else {
    title = _('notAllAdded', nNewlyBlocked.toString())
  }
  const hint = _('addActionHint', [EMOJI_PASS, EMOJI_DUPLICATED, EMOJI_FOUL])

  textarea.value = text
  updateHint(title, hint.split('#'))
}

async function onRemoveHostsListener() {
  if (isTextAreaEmpty()) {
    return
  }

  const lines = textarea.value
    .split('\n')
    .map(str => str.trim())
    .filter(isValidLine)
  if (lines.length === 0) {
    return
  }

  const hosts = lines.map(getHostnameFromLine)
  const validHosts = hosts.filter(is.string)
  const removed = await db.removeHosts(validHosts)

  const resultList = actionResult(hosts, removed)
  const text = lines.map((line, index) => `${resultList[index]} ${line}`).join('\n')
  const nNewlyUnblocked = resultList.filter(e => e === EMOJI_PASS).length

  let title: string
  if (nNewlyUnblocked === lines.length) {
    title = _('allRemoved', nNewlyUnblocked.toString())
  } else if (nNewlyUnblocked === 0) {
    title = _('nothingChanged')
  } else {
    title = _('notAllRemoved', nNewlyUnblocked.toString())
  }
  const hint = _('removeActionHint', [EMOJI_PASS, EMOJI_DUPLICATED, EMOJI_FOUL])

  textarea.value = text
  updateHint(title, hint.split('#'))
}

async function onViewAllHostsListener() {
  let list = await db.getFarmList()
  list = list.reverse()

  let msg: string
  if (list.length === 0) {
    msg = `# ${_('emptyList')}`
  } else {
    const fix = `# ${list.length}`
    msg = `${fix}\n${list.map(h => `${EMOJI_PASS} ${h}`).join('\n')}\n${fix}`
  }

  textarea.value = msg
}

// Queries the hostname from an url or hostname; returns undefined if this
// string is an invalid hostname.
function getHostnameFromLine(text: string): string | undefined {
  // Trim the string
  text = text.trim().toLowerCase()
  let hostname: string

  // If this is an url, that is, start with http(s), gets its hostname.
  if (isValidUrl(text)) {
    const fromIndex = text.indexOf('://') + 3
    const toIndex = text.indexOf('/', fromIndex)
    hostname = text.slice(fromIndex, toIndex)
  }
  // Otherwise considers it to be a hostname
  else {
    hostname = text
  }

  return isValidHostname(hostname) ? hostname : undefined
}

// Queries if a line does not start with '#' or emojis.
function isValidLine(line: string) {
  return (
    line.length &&
    !line.startsWith('#') &&
    !line.startsWith(EMOJI_PASS) &&
    !line.startsWith(EMOJI_DUPLICATED) &&
    !line.startsWith(EMOJI_FOUL)
  )
}

// Queries if the textarea is empty. That is, contains any line that is not
// empty or not starts with '#' or emojis.
function isTextAreaEmpty() {
  return textarea.value.split('\n').filter(isValidLine).length === 0
}

// Initialization.
btnAdd.onclick = onAddHostsListener
btnDelete.onclick = onRemoveHostsListener
btnView.onclick = onViewAllHostsListener
parseDocument()
