//Set default farm-list on installed
chrome.runtime.onInstalled.addListener(function () {
    setFarmList(getDefaultFarmList());
});