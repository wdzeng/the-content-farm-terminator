"use strict";

//Set default farm-list on first installed
chrome.runtime.onInstalled.addListener(function () {
    getFarmList(function (data) {
        if (data === undefined) {
            setFarmList(getDefaultFarmList());
        }
    });
});