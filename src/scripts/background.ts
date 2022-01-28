'use strict'

function onInstalledListener(details: chrome.runtime.InstalledDetails) {
  if (details.reason !== 'install') return
  
  chrome.storage.sync.get({ farmListSize: null }, function (data) {
    if (data['farmListSize'] === null) {
      // Newly installed
      chrome.storage.sync.set({ farmListSize: '0' })
    }
  })
}

chrome.runtime.onInstalled.addListener(onInstalledListener)
