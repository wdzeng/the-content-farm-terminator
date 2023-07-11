'use strict'

const EMOJI_PASS = '😀'
const EMOJI_DULPLICATED = '🤨'
const EMOJI_FOUL = '😭'
var _ = chrome.i18n.getMessage
const REG_URL = new RegExp('http[s]{0,1}:\\/\\/.*?\\/.*')
const REG_HOST = new RegExp('^(([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])\\.)+([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])$')

const textarea = document.getElementById('txtArea') as HTMLTextAreaElement
const btnAdd = document.getElementById('btnAdd') as HTMLInputElement
const btnDelete = document.getElementById('btnDelete') as HTMLInputElement
const btnView = document.getElementById('btnViewAll') as HTMLInputElement
const eHint = document.getElementById('btnHint') as HTMLInputElement

textarea.placeholder = _('areaPlaceHolder')
btnAdd.innerHTML = _('btnAdd')
btnDelete.innerHTML = _('btnDelete')
btnView.innerHTML = _('btnView')
btnAdd.onclick = onAddHostsListener
btnDelete.onclick = onRemoveHostsListener
btnView.onclick = onViewAllHostsListener

function actionResult(hostArray: Array<string | null>, passedHosts: string[]) {
  return hostArray.map((value, index) => {
    if (value === null) return EMOJI_FOUL
    if (!passedHosts.includes(value)) return EMOJI_DULPLICATED
    return hostArray.indexOf(value) === index ? EMOJI_PASS : EMOJI_DULPLICATED
  })
}

async function onAddHostsListener() {
  if (isTextAreaEmpty()) return

  const lines = textarea.value.split('\n').map(str => str.trim()).filter(isValidLine)
  if (lines.length === 0) return

  const hosts = lines.map(toHost)
  const validHosts = hosts.filter(h => h !== null) as string[]
  const newlyBlockedHosts = await farmListDatabase.addHosts(validHosts)

  const resultList = actionResult(hosts, newlyBlockedHosts)
  const text = lines.map((line, index) => `${resultList[index]} ${line}`).join('\n')
  const nNewlyBlocked = resultList.filter(e => e === EMOJI_PASS).length

  let title
  if (nNewlyBlocked === lines.length) {
    title = _('allAdded', nNewlyBlocked.toString())
  }
  else if (nNewlyBlocked === 0) {
    title = _('nothingChanged')
  }
  else {
    title = _('notAllAdded', nNewlyBlocked.toString())
  }
  const hint = _('addActionHint', [EMOJI_PASS, EMOJI_DULPLICATED, EMOJI_FOUL])

  textarea.value = text
  eHint.innerHTML = `<p>${title}</p><p>${hint}</p>`
}

async function onRemoveHostsListener() {
  if (isTextAreaEmpty()) return

  const lines = textarea.value.split('\n').map(str => str.trim()).filter(isValidLine)
  if (lines.length === 0) return

  const hosts = lines.map(toHost)
  const validHosts = hosts.filter(h => h !== null) as string[]
  const removed = await farmListDatabase.removeHosts(validHosts)

  const resultList = actionResult(hosts, removed)
  const text = lines.map((line, index) => `${resultList[index]} ${line}`).join('\n')
  const nNewlyUnblocked = resultList.filter(e => e === EMOJI_PASS).length

  let title
  if (nNewlyUnblocked === lines.length) {
    title = _('allRemoved', nNewlyUnblocked.toString())
  }
  else if (nNewlyUnblocked === 0) {
    title = _('nothingChanged')
  }
  else {
    title = _('notAllRemoved', nNewlyUnblocked.toString())
  }
  let hint = _('removeActionHint', [EMOJI_PASS, EMOJI_DULPLICATED, EMOJI_FOUL])

  textarea.value = text
  eHint.innerHTML = `<p>${title}</p><p>${hint}</p>`
}

async function onViewAllHostsListener() {
  let list = await farmListDatabase.getFarmList()
  list = list.reverse()

  let msg
  if (list.length === 0) {
    msg = `# ${_('emptyList')}`
  }
  else {
    const fix = `# ${list.length}`
    msg = `${fix}\n${list.map(h => `${EMOJI_PASS} ${h}`).join('\n')}\n${fix}`
  }

  textarea.value = msg
}

// Get the hostname from a text line, or return null if this string is invalid
function toHost(text: string): string | null {
  text = text && text.trim().toLowerCase()
  let host
  if (REG_URL.test(text)) {
    let fromIndex = text.indexOf('://') + 3
    let toIndex = text.indexOf('/', fromIndex)
    host = text.substring(fromIndex, toIndex)
  }
  else {
    host = text
  }
  return REG_HOST.test(host) ? host : null
}

function isValidLine(line: string) {
  return line.length
    && !line.startsWith('#')
    && !line.startsWith(EMOJI_PASS)
    && !line.startsWith(EMOJI_DULPLICATED)
    && !line.startsWith(EMOJI_FOUL)
}

function isTextAreaEmpty() {
  return textarea.value.split('\n').filter(isValidLine).length === 0
}
