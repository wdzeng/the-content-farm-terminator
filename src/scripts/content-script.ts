import {
  GoogleImageTerminator,
  GoogleNewsTerminator,
  GoogleWebsiteTerminator,
  Terminator
} from './terminator'
import * as debug from './utils/debug'

// This script is executed when google.com/search page is loaded.

async function main() {
  // https://www.sitepoint.com/get-url-parameters-with-javascript/
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  // Check if user is searching website or news.
  const tbm = urlParams.get('tbm')
  let terminator: Terminator | undefined = undefined
  switch (tbm) {
    // eslint-disable-next-line unicorn/no-null
    case null: {
      // Websites
      terminator = new GoogleWebsiteTerminator()
      break
    }
    case 'isch': {
      // Images
      terminator = new GoogleImageTerminator()
      break
    }
    case 'nws': {
      // News
      terminator = new GoogleNewsTerminator()
      break
    }
    // No default
  }

  if (terminator) {
    try {
      await terminator.run()
    } catch (e) {
      debug.error(e)
    }
  }
}

// We cannot use await at top level for extension background script.
// eslint-disable-next-line unicorn/prefer-top-level-await
void main()
