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

function addHost(host, callback) {
    return getFarmList(function (data) {
        if (!data.includes(host)) {
            data.unshift(host);
            setFarmList(data, callback);
            return true;
        } else {
            callback && callback();
            return false;
        }
    })
}

function removeHost(host, callback) {
    return getFarmList(function (data) {
        let index = data.indexOf(host);
        if (index != -1) {
            data.splice(index, 1);
            setFarmList(data, callback);
            return true;
        } else {
            callback && callback();
            return false;
        }
    });
}