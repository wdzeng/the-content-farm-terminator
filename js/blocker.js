"use strict";

const __ = chrome.i18n.getMessage;
const TIME_FADING = 400;
const init = hideFarmResultItems;
init();

function one(task) {
    let flag = true;
    return function () {
        if (flag) {
            flag = false;
            task(arguments);
        }
    }
}

/**
 * Hide serach results linking to farms.
 */
function hideFarmResultItems() {
    DB.getFarmList(farmList => {
        // Get farm results
        let $farmResults = getResults(farmList);
        const nFarmResult = $farmResults.length;
        // If any serach result of farm exists
        if (nFarmResult) {
            // Hide these search results
            $farmResults.hide();
            // If the first result is removed, add some margin to make the page pretty.
            updateTopMargin();
            // Add a hint which allows user to show these results temporarily.
            addShowAllOnceHint(nFarmResult);
        }
        // After farm results are hidden, add "block this domain" hint to the remaining results.
        addBlockHint(getResults(null, true));
    })
}

/**
 * Set a hint for some search results. If the hint alreadt exists, update it. If the hint does not exists, insert a new one.
 * @param {$Object} $srItem Set a hint for these search results.
 * @param {String} text Text of hint.
 * @param {Function} onClick Listener for the hint button. The source element (jqObject) is the first argument.
 */
function setHintForSearchItem($srItem, text, onClick) {
    // Get the hint anchor of these results and check if it exists.
    let $hint = $("a.cfb-hint", $srItem);
    // If a hint exists, update this hint.
    if ($hint.length) {
        $hint.html(text)
            .one("click", function () {
                onClick($(this).parents("div.g"));
                return false;
            });
        return;
    }
    // If a hint does not exits, create a new hint.
    let hintCss = { "margin-left": "4px", "color": "#808080" };
    let hintOnClickListener = function () {
        onClick($(this).parents("div.g"));
        return false;
    }
    $hint = $(`<a class="fl cfb-hint" href="#">${text}</a>`)
        .css(hintCss)
        .one("click", hintOnClickListener);
    // Add these hints to DOM tree
    $("div.r", $srItem).append($hint);
}

/**
 * Add "Block this domain" hint to some results.
 */
function addBlockHint($srItems) {
    setHintForSearchItem($srItems, __("terminateHint"), $srItemBlocked => {
        const hostName = getHostName($srItemBlocked);
        // Get other search items linking to same host and hide them all.
        let $blockCandidates = getResults(hostName);
        $blockCandidates.fadeOut(TIME_FADING, one(() => addRedoHint($blockCandidates)));
        // Add this host to blocking list
        DB.addHosts(hostName);
        return false;
    });
}

/**
 * Add "Unblock this domain" hint to some results.
 */
function addUnblockHint($srItems) {
    setHintForSearchItem($srItems, __("unTerminatedHint"), $srItemUnblocked => {
        let hostName = getHostName($srItemUnblocked);
        let $unblocked = getResults(hostName);
        $("h3.LC20lb", $unblocked).removeClass("farm-title");
        addBlockHint($unblocked);
        DB.removeHosts(hostName);
    })
}

/**
 * Add "Redo" hint to a single result.
 */
function addRedoHint($srItems) {

    // Check host name
    const hostName = getHostName($srItems);
    const clzName = `cfb-${hostName.replace(/\./g, "-")}`
    // Create redo text
    let $txtRedo = $(`<div class="g s ${clzName}"></div>`)
        .append($(`<span style="margin-right: 8px;">${__("unTerminatedMsg", hostName)}</span>`))
    // Create redo button
    let $btnRedo = $(`<a href="#">${__("redoHint")}</a>`)
        .one("click", () => {
            $(`div.${clzName}`).remove();
            let $unblocked = $("div.g").filter((i, e) => getHostName($(e)) === hostName);
            addBlockHint($unblocked);
            $unblocked.fadeIn(TIME_FADING);
            DB.removeHosts(hostName);
            return false;
        });
    // Add button to DOM tree
    $txtRedo.append($btnRedo);
    $srItems.after($txtRedo);
}

/**
 * Get the host an result item linking to.
 */
function getHostName($srItem) {
    let $anchor = $("div.r>a:first", $srItem);
    if ($anchor.length) return $anchor[0].hostname;
    return null;
}

/**
 * Remove extra margin between image box and the top bar so that the webpage looks pretty.
 */
function updateTopMargin() {
    let first = document.querySelector("div.g:not([style*='display: none'])");
    if (first && first.id === "imagebox_bigimages") {
        first.firstChild.style.marginTop = "0";
        return true;
    }
    return false;
}

/**
 * Add hint that allows user to show farm results temporarily
 * @param {Number} nHidden Number of search results hidden. 
 */
function addShowAllOnceHint(nHidden) {
    let $div = $("<div id='tempShow'></div>");
    let $txt = $("<p></p>").css("font-style", "italic");
    let $btn = $(`<a href="#">${__("templyShowAllHint")}</a>`)
        .css("text-decoration", "none")
        .one("click", function () {
            showFarmsOnce();
            $div.hide(0);
            return false;
        })
        .hover(
            () => $btn.css("text-decoration", "underline"),
            () => $btn.css("text-decoration", "none")
        );
    let hintMsg = __("templyShowAllMsg").split("#");
    $txt.append(hintMsg[0]).append($btn).append(hintMsg[1]);
    $div.append($txt);
    $("#extrares").append($div);
}

/**
 * Show farm results temporarily.
 */
function showFarmsOnce() {
    let $farmResults = getResults(null, false);
    regFarmTitleClz();
    $farmResults.find("h3.LC20lb").addClass("farm-title");
    addUnblockHint($farmResults);
    $farmResults.fadeIn(TIME_FADING);
}

/**
 * Get some search result items by given argument.
 * @param {Array|String} host Search results linking to the hosts should be selected. If this is ommited, all results are selected.
 * @param {String} visibility Should be "visible" or "hidden". If this is ommited, both visible and invisble results are selected.
 */
function getResults(host, visibility) {
    if (arguments.length === 1) {
        visibility = "";
    }
    else {
        visibility = visibility ? ":visible" : ":hidden";
    }
    let $candidates = $(`div.g${visibility}`)
    if (!host)
        return $candidates;
    if (Array.isArray(host))
        return $candidates.filter((i, e) => host.includes(getHostName($(e))));
    return $candidates.filter((i, e) => getHostName($(e)) === host);
}

/**
 * Declare a style tag into the DOM for the top margin adjustment.
 */
function regFarmTitleClz() {
    let css = ".farm-title { font-style: italic; color: #CC0000; }";
    let head = document.head;
    let style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
}
