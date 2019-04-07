"use strict";

const PASS = "😀";
const DULPLICATED = "🤨";
const FOUL = "😭";
const __ = chrome.i18n.getMessage;
const eArea = document.getElementById("txtArea");
const eAdd = document.getElementById("btnAdd");
const eDelete = document.getElementById("btnDelete");
const eViewAll = document.getElementById("btnViewAll");
const eHint = document.getElementById("btnHint");

eArea.placeholder = __("areaPlaceHolder");
eAdd.innerHTML = __("btnAdd");
eDelete.innerHTML = __("btnDelete");
eViewAll.innerHTML = __("btnView");
eAdd.onclick = onAdd;
eDelete.onclick = onDelete;
eViewAll.onclick = onViewAll;

function actionResult(hostArray, passedHosts) {
    return hostArray.map((e, i) => {
        if (e === null) return FOUL;
        if (!passedHosts.includes(e)) return DULPLICATED;
        return hostArray.indexOf(e) === i ? PASS : DULPLICATED;
    });
}

function onAdd() {

    if (isAreaEmpty()) return;

    let lines = eArea.value.split("\n").map(str => str.trim()).filter(validLine);
    if (lines.length === 0) return;

    let hosts = lines.map(toHost);
    let validHosts = hosts.filter(h => h);
    DB.addHosts(validHosts, function (added) {
        let resultList = actionResult(hosts, added);
        let str = lines.map((line, index) => `${resultList[index]} ${line}`).join("\n");
        let nPass = resultList.filter(e => e === PASS).length;
        let title;
        if (nPass === lines.length) {
            title = __("allAdded", nPass.toString());
        }
        else if (nPass === 0) {
            title = __("nothingChanged");
        }
        else {
            title = __("notAllAdded", nPass.toString());
        }
        let hint = __("addActionHint", [PASS, DULPLICATED, FOUL]);
        eArea.value = str;
        eHint.innerHTML = `<p>${title}</p><p>${hint}</p>`;
    });
}

function onDelete() {

    if (isAreaEmpty()) return;

    let lines = eArea.value.split("\n").map(str => str.trim()).filter(validLine);
    if (lines.length === 0) return;

    let hosts = lines.map(toHost);
    let validHosts = hosts.filter(h => h);
    DB.removeHosts(validHosts, function (removed) {
        let resultList = actionResult(hosts, removed);
        let str = lines.map((line, index) => `${resultList[index]} ${line}`).join("\n");
        let nPass = resultList.filter(e => e === PASS).length;
        let title
        if (nPass === lines.length) {
            title = __("allRemoved", nPass.toString());
        }
        else if (nPass === 0) {
            title = __("nothingChanged");
        }
        else {
            title = __("notAllRemoved", nPass.toString());
        }
        let hint = __("removeActionHint", [PASS, DULPLICATED, FOUL]);
        eArea.value = str;
        eHint.innerHTML = `<p>${title}</p><p>${hint}</p>`;
    });
}

function onViewAll() {
    DB.getFarmList(list => {
        list = list.reverse();
        let msg;
        if (list.length === 0) {
            msg = `# ${__("emptyList")}`;
        }
        else {
            const fix = `# ${list.length}`;
            msg = `${fix}\n${list.map(h => `${PASS} ${h}`).join("\n")}\n${fix}`;
        }
        eArea.value = msg;
    });
}

// Get the host name from a text, or return null if this string is invalid
const toHost = (function () {

    const REG_URL = new RegExp("http[s]{0,1}:\\/\\/.*?\\/.*");
    const REG_HOST = new RegExp("^(([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])\\.)+([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])$");

    return function (text) {
        text = text && text.trim().toLowerCase();
        let host;
        if (REG_URL.test(text)) {
            let fromIndex = text.indexOf("://") + 3;
            let toIndex = text.indexOf("/", fromIndex);
            host = text.substring(fromIndex, toIndex);
        }
        else {
            host = text;
        }
        return REG_HOST.test(host) ? host : null;
    }
})();

function validLine(string) {
    return string.length
        && !string.startsWith("#")
        && !string.startsWith(PASS)
        && !string.startsWith(DULPLICATED)
        && !string.startsWith(FOUL);
}

function isAreaEmpty() {
    return eArea.value.split("\n").filter(validLine).length === 0;
}