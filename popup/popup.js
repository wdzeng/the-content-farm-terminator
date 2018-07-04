"use strict";

(function () {

    const hint = document.getElementById('hint');
    const area = document.getElementById('area');
    setAreaPlaceHolderAndButtonHtml();
    setADDListener();
    setDELETEListener();
    setSHOWALLListener();

    function setAreaPlaceHolderAndButtonHtml() {
        area.placeholder = chrome.i18n.getMessage('areaPlaceHolder');
        document.getElementById('add').innerHTML = chrome.i18n.getMessage('addButton');
        document.getElementById('delete').innerHTML = chrome.i18n.getMessage('deleteButton');
        document.getElementById('showAll').innerHTML = chrome.i18n.getMessage('showAllButton');
    }

    function setADDListener() {

        document.getElementById('add').onclick = function () {

            let added = getList(getText());
            const len = added.length;
            const nRow = getRowCount();

            if (!len) {
                if (isAreaEmpty()) {
                    hint.innerHTML = '';
                }
                else {
                    hint.innerHTML = chrome.i18n.getMessage('errorHostNames');
                }
                return;
            }

            //Save new list
            getFarmList(function (origin) {

                let count = 0;
                for (let i = 0; i < len; i++) {
                    count += addHostIntoArray(origin, added[i]);
                }

                if (count) {

                    //Save new list
                    setFarmList(origin);

                    if (count == 1) {
                        if (nRow == 1) {
                            hint.innerHTML = chrome.i18n.getMessage('oneAdded', origin[0]);
                        }
                        else {
                            hint.innerHTML = chrome.i18n.getMessage('onlyOneAdded', origin[0]);
                        }
                    }
                    else if (count == nRow) {
                        hint.innerHTML = chrome.i18n.getMessage('allAdded', count.toString());
                    }
                    else {
                        hint.innerHTML = chrome.i18n.getMessage('onlySomeAdded', count.toString());
                    }

                } else {

                    hint.innerHTML = chrome.i18n.getMessage('nothingChanged');
                }
            });
        }
    }

    function setDELETEListener() {

        document.getElementById('delete').onclick = function () {

            let removed = getList(getText());
            const len = removed.length;
            const nRow = getRowCount();

            if (!len) {
                if (isAreaEmpty()) {
                    hint.innerHTML = '';
                }
                else {
                    hint.innerHTML = chrome.i18n.getMessage('errorHostNames');
                }
                return;
            }

            //Save new list
            getFarmList(function (origin) {

                let count = 0;
                for (let i = 0; i < len; i++) {
                    count += removeHostFromArray(origin, removed[i]);
                }

                if (count) {

                    //Save new list
                    setFarmList(origin);

                    if (count == 1) {
                        if (nRow == 1) {
                            hint.innerHTML = chrome.i18n.getMessage('oneRemoved', removed[0]);
                        }
                        else {
                            hint.innerHTML = chrome.i18n.getMessage('onlyOneRemoved');
                        }
                    }
                    else if (count == nRow) {
                        hint.innerHTML = chrome.i18n.getMessage('allRemoved', count.toString());
                    }
                    else {
                        hint.innerHTML = chrome.i18n.getMessage('onlySomeRemoved', count.toString());
                    }

                }
                else {
                    hint.innerHTML = chrome.i18n.getMessage('nothingChanged');
                }
            });
        }
    }

    function setSHOWALLListener() {
        document.getElementById('showAll').onclick = function () {
            getFarmList(function (data) {
                hint.innerHTML = '';
                if (data.length) {
                    let context = '---- [' + data.length + '] ----';
                    let text = context + '\n' + data.join('\n') + '\n' + context;
                    area.value = text;
                } else {
                    area.value = '---- ' + chrome.i18n.getMessage('emptyList') + ' ----';
                }
            });
        }
    }

    //Add a host into array
    function addHostIntoArray(array, host) {

        if (array.indexOf(host) == -1) {
            array.unshift(host);
            return 1;
        }

        return 0;
    }

    //Remove a host from array
    function removeHostFromArray(array, host) {

        let index = array.indexOf(host);
        if (index != -1) {
            array.splice(index, 1);
            return 1;
        }

        return 0;
    }

    //Get the text of text area
    function getText() {

        return area.value;
    }

    //Get the list of host name from text area
    function getList(text) {

        //Split contents by lines
        let lines = text.split('\n');
        const len = lines.length;

        //Read lines
        let array = [];
        let host = null;
        for (let i = 0; i < len; i++) {
            host = getHost(lines[i]);
            if (host) {
                array.push(host);
            }
        }

        return array;
    }

    //Get the host name from a text, or return null if this string is invalid
    function getHost(text) {

        //Check text and trim it
        if (!text) {
            return null;
        }
        text = text.trim();

        let host = null;
        let httpInit = new RegExp('http[s]{0,1}:\\/\\/.*?\\/.*');
        if (httpInit.test(text)) {
            let fromIndex = text.indexOf('://') + 3;
            let toIndex = text.indexOf('/', fromIndex);
            host = text.substring(fromIndex, toIndex);
        } else {
            host = text;
        }

        host = host.toLowerCase();
        let hostReg = new RegExp('^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9])$');
        return hostReg.test(host) ? host : null;
    }

    function isAreaEmpty() {

        return area.value.trim().length == 0;
    }

    function getRowCount() {

        return area.value.trim().split('\n').length;
    }

})();