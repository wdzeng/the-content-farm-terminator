// https://stackoverflow.com/a/53033388

// This script is executed when google.com/search page is loaded.
(async () => {
  // https://www.sitepoint.com/get-url-parameters-with-javascript/
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  // Check if user is searching website or news.
  const tbm = urlParams.get('tbm')
  if (tbm === null) {
    // websites
    const src = (window.browser || window.chrome).runtime.getURL('/scripts/google-website-terminator.js')
    const contentMain = await import(src)
    contentMain.init()
  }
  else if (tbm === 'isch') {
    // images
    const src = (window.browser || window.chrome).runtime.getURL('/scripts/google-image-terminator.js')
    const contentMain = await import(src)
    contentMain.init()
  }
  else if (tbm === 'nws') {
    // news
    const src = (window.browser || window.chrome).runtime.getURL('/scripts/google-news-terminator.js')
    const contentMain = await import(src)
    contentMain.init()
  }
})()
