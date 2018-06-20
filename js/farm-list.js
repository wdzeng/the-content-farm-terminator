function getDefaultFarmList() {

    return [];
}

function getFarmList(callback) {
    
    chrome.storage.sync.get('farmList', function (data) {
        callback(data['farmList']);
    });
}

function setFarmList(array, callback) {
    
    chrome.storage.sync.set({
        'farmList': array
    }, callback);
}