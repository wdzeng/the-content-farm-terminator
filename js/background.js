chrome.runtime.onInstalled.addListener(function () {

    //Set default farm list
    setFarmList(getDefaultFarmList(), function () {
        console.log('default farm list has been set.');
    });
});