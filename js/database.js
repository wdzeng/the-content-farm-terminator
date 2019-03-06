"use strict";

var DB = {

    getDefaultFarmList: function () {
        return [];
    },

    /**
     * Get the currently stored farm list array. 
     * If the user jsut installed this extension and the database is not created, this returns undefined.
     */
    getFarmList: function (callback) {
        chrome.storage.sync.get('farmList', data => callback && callback(data['farmList']));
    },

    /**
     * Clear currently stored farm list array and save a new array.
     */
    setFarmList: function (farmListArray, callback) {
        chrome.storage.sync.set({ 'farmList': farmListArray }, callback);
    },

    /**
     * Add a host into farm list database. 
     * @returns True if that host did not existed and has been added into the database.
     */
    addHost: function (host, callback) {
        DB.getFarmList(function (data) {
            if (!data.includes(host)) {
                data.unshift(host);
                DB.setFarmList(data, () => callback && callback(true));
            }
            else {
                callback && callback(false);
            }
        });
    },

    /**
     * Remove a host from farm list database.
     * @returns True if that host existed and has been deleted.
     */
    removeHost: function (host, callback) {
        DB.getFarmList(function (data) {
            let index = data.indexOf(host);
            if (index !== -1) {
                data.splice(index, 1);
                DB.setFarmList(data, () => callback && callback(true));
            }
            else {
                callback && callback(false);
            }
        });
    }
}