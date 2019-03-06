"use strict";

// Set default farm list on first installed.
chrome.runtime.onInstalled.addListener(function () {
    DB.getFarmList(function (data) {
        // If the user first installed this extension, add default farm list.
        if (data === undefined) {
            DB.setFarmList(DB.getDefaultFarmList());
        }
    });
});