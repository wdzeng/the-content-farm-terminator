chrome.runtime.onInstalled.addListener(function () {

    chrome.storage.sync.set({
        'farmList': farmList
    });
});