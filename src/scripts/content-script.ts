// https://stackoverflow.com/a/53033388
(async () => {
  const src = chrome.runtime.getURL('/scripts/inject.js')
  const contentMain = await import(src)
  contentMain.init()
})()
