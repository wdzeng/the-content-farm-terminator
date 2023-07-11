"use strict";

const VAR_NAME = "farmList";
const SIZE_NAME = "farmListSize";
const MAX_LIST_SIZE = 400;
const db = chrome.storage.sync;
const ceil = Math.ceil;

function requireUniqueItems(array) {
    return array.filter(
        (value, index, self) => self.indexOf(value) === index
    );
}

function getFarmListSize(cb) {
    db.get(SIZE_NAME, data => cb && cb(data[SIZE_NAME]));
}

var DB = {

    /**
     * Get the currently stored farm list array.
     */
    getFarmList: function (cb) {

        function getList(listSize) {
            if (listSize == 0) {
                cb && cb([]);
                return;
            }
            let keys = [];
            for (let i = 0; i < listSize; i++) {
                keys.push(VAR_NAME + i);
            }
            db.get(keys, data => {
                let mergedList = Object.values(data).flat();
                cb && cb(mergedList);
            });
        }

        getFarmListSize(getList);
    },

    /**
     * Add some hosts into farm list database. 
     * @returns an array is passed in to the callback function containing all newly added hosts.
     */
    addHosts: function (hosts, cb) {

        if (!Array.isArray(hosts)) {
            // If hosts is a string, converts to array.
            DB.addHosts([hosts], cb);
            return;
        }

        if (hosts.length === 0) {
            cb && cb([]);
            return;
        }

        hosts = requireUniqueItems(hosts);
        DB.getFarmList(function (list) {
            let newList = requireUniqueItems(list.concat(hosts));
            // No new hosts are added; hence return
            if (list.length === newList.length) {
                cb && cb([]);
                return;
            }
            
            let startIndex = ceil(list.length / MAX_LIST_SIZE) - 1;
            if (startIndex < 0) startIndex = 0;
            let endIndex = ceil(newList.length / MAX_LIST_SIZE);
            let updated = {};
            for (let i = startIndex; i < endIndex; i++) {
                let index = i * MAX_LIST_SIZE;
                updated[VAR_NAME + i] = newList.slice(index, index + MAX_LIST_SIZE)
            }
            updated[SIZE_NAME] = endIndex;
            db.set(updated, () => cb && cb(hosts));
        });
    },

    /**
     * Remove a host from farm list database.
     * @returns True if that host existed and has been deleted.
     */
    removeHosts: function (hosts, cb) {

        if (!Array.isArray(hosts)) {
            // If hosts is a string, converts to array.
            DB.removeHosts([hosts], cb);
            return;
        }

        hosts = requireUniqueItems(hosts);
        if (hosts.length === 0) {
            cb && cb([]);
            return;
        }

        DB.getFarmList(function (list) {
            let newList = list.filter(e => !hosts.includes(e));
            if (newList.length == list) {
                cb && cb([]);
                return;
            }

            let removed = list.filter(e => hosts.includes(e));
            // No matter what update all key-values ....
            let obj = {};
            let length = ceil(newList.length / MAX_LIST_SIZE);
            for (let i = 0; i < length; i++) {
                let index = i * MAX_LIST_SIZE;
                obj[VAR_NAME + i] = newList.slice(index, index + MAX_LIST_SIZE);
            }
            obj[SIZE_NAME] = length;
            db.set(obj, () => cb && cb(removed));
        });
    }
} 