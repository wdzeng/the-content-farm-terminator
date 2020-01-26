"use strict";

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.storage.sync.get({ farmListSize: null }, function (data) {
            if (data['farmListSize'] === null) {
                // Newly installed
                chrome.storage.sync.set({ farmListSize: "0" });
            }
        })
    }
});