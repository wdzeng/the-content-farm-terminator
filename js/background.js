"use strict";

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.storage.sync.set({ farmListSize: "0" });
    }
    else if (details.reason == "update") {
        let oldVersion = details.previousVersion.split(".")[0];
        if (oldVersion < 2) {
            chrome.storage.sync.set({ farmListSize: "0" }, updateList);
        }
    }
});

function updateList() {
    chrome.storage.sync.get("farmList", function (data) {
        let list = data["farmList"];
        DB.addHosts(list);
        chrome.storage.sync.remove("farmList");
    })
}