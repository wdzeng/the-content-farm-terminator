chrome.runtime.onInstalled.addListener(function () {

    //Set farm list into storage
    chrome.storage.sync.set({
        'farmList': farmList
    });

});