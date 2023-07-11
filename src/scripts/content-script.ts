import { GoogleImageTerminator, GoogleWebsiteTerminator, GoogleNewsTerminator, Terminator } from './terminator'

// This script is executed when google.com/search page is loaded.

// suppress eslint warning

async function init() {
  // https://www.sitepoint.com/get-url-parameters-with-javascript/
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  // Check if user is searching website or news.
  const tbm = urlParams.get('tbm')
  let terminator: Terminator | null = null
  if (tbm === null) {
    // websites
    terminator = new GoogleWebsiteTerminator()
  }
  else if (tbm === 'isch') {
    // images
    terminator = new GoogleImageTerminator()
  }
  else if (tbm === 'nws') {
    // news
    terminator = new GoogleNewsTerminator()
  }

  if (terminator !== null) {
    await terminator.run()
  }
}

init()
