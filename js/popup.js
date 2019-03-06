"use strict";

const __ = chrome.i18n.getMessage;

const eHint = document.getElementById('hint');
const eArea = document.getElementById('area');
const eAdd = document.getElementById('add');
const eDelete = document.getElementById('delete');
const eView = document.getElementById('view');

eArea.placeholder = __('areaPlaceHolder');
eAdd.innerHTML = __('btnAdd');
eDelete.innerHTML = __('btnDelete');
eView.innerHTML = __('btnView');
eAdd.onclick = onAddListener;
eDelete.onclick = onDeleteListener;
eView.onclick = onViewListener;

function onAddListener() {

    const candidates = list(text());
    const nCandidates = candidates.length;
    if (nCandidates === 0) {
        if (isAreaEmpty())
            eHint.innerHTML = '';
        else
            eHint.innerHTML = __('errorHostNames');
        return;
    }

    DB.getFarmList(farmList => {
        console.log(farmList);
        const nRow = getRowCount();
        let nAdded = 0;
        for (let i = 0; i < nCandidates; i++)
            nAdded += addHostIntoArray(farmList, candidates[i]);
        const resMsg = getOnAddMessage(nAdded, nRow, candidates);
        if (nAdded === 0) {
            eHint.innerHTML = resMsg;
            return;
        }
        DB.setFarmList(farmList, () => eHint.innerHTML = resMsg);
    });
}

function getOnAddMessage(nAdded, nRow, candidates) {
    if (nAdded === 0) {
        return __('nothingChanged');
    }
    if (nAdded === 1) {
        if (nRow == 1)
            return __('oneAdded', candidates[0]);
        else
            return __('onlyOneAdded', candidates[0]);
    }
    if (nAdded === nRow) {
        return __('allAdded', nAdded.toString());
    }
    return __('onlySomeAdded', nAdded.toString());
}

function onDeleteListener() {

    const candidates = list(text());
    const nCandidates = candidates.length;
    if (nCandidates === 0) {
        if (isAreaEmpty())
            eHint.innerHTML = '';
        else
            eHint.innerHTML = __('errorHostNames');
    }
    else {
        DB.getFarmList(farmList => {
            const nRow = getRowCount();
            let nRemoved = 0;
            for (let i = 0; i < nCandidates; i++)
                nRemoved += removeHostFromArray(farmList, candidates[i]);
            const resMsg = getOnDeleteMessage(nRemoved, nRow, candidates);
            if (nRemoved === 0) {
                eHint.innerHTML = resMsg;
                return;
            }
            DB.setFarmList(farmList, () => eHint.innerHTML = resMsg);
        });
    }
}

function getOnDeleteMessage(nDeleted, nRow, candidates) {
    if (nDeleted === 1) {
        if (nRow === 1)
            return __('oneRemoved', candidates[0]);
        else
            return __('onlyOneRemoved');
    }
    if (nDeleted === nRow) {
        return __('allRemoved', nDeleted.toString());
    }
    return __('onlySomeRemoved', nDeleted.toString());
}

function onViewListener() {
    eHint.innerHTML = ''; // Clear the hint area.
    DB.getFarmList(farmList => {
        let msg;
        if (farmList.length === 0) {
            msg = `# ${__('emptyList')}`;
        }
        else {
            const fix = `# ${farmList.length}`;
            msg = `${fix}\n${farmList.join('\n')}\n${fix}`;
        }
        eArea.value = msg;
    });
}

// Add a host into array.
function addHostIntoArray(array, host) {
    if (array.includes(host)) {
        return 0;
    }
    array.unshift(host);
    return 1;
}

// Remove a host from array.
function removeHostFromArray(array, host) {
    const index = array.indexOf(host);
    if (index === -1) {
        return 0;
    }
    array.splice(index, 1);
    return 1;
}

// Get the text of text area.
function text() {
    return eArea.value;
}

// Get the list of host name from text area.
function list(text) {
    return text.split('\n')
        .map(line => getHost(line))
        .filter(host => host)
}

// Get the host name from a text, or return null if this string is invalid
const getHost = (function () {

    const regUrl = new RegExp('http[s]{0,1}:\\/\\/.*?\\/.*');
    const regHost = new RegExp('^(([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])\\.)+([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])$');

    return function (text) {
        text = text && text.trim().toLowerCase();
        // Check text and trim it
        if (!text) {
            return null;
        }
        let host;
        if (regUrl.test(text)) {
            let fromIndex = text.indexOf('://') + 3;
            let toIndex = text.indexOf('/', fromIndex);
            host = text.substring(fromIndex, toIndex);
        }
        else {
            host = text;
        }
        return regHost.test(host) ? host : null;
    }
})();

function isAreaEmpty() {
    return eArea.value.trim().length == 0;
}

function getRowCount() {
    return eArea.value
        .trim()
        .split('\n')
        .filter(line => !line.startsWith("#"))
        .length;
}