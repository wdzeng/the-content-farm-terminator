// https://stackoverflow.com/a/53033388
(async () => {
  const src = chrome.runtime.getURL('/scripts/terminator.js')
  const contentMain = await import(src)
  contentMain.init()
})()
