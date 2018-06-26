//Set default farm-list on installed
chrome.runtime.onInstalled.addListener(function () {
    getFarmList(function (data) {
        if (data === undefined) {
            setFarmList(getDefaultFarmList());
        }
    });
});