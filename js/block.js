"use strict";
(function () {

    const fadeTime = 400;
    run();

    //Run content farm blocker
    function run() {
        removeFarmResults();
    }

    //Remove content farm results from google search page
    function removeFarmResults() {

        getFarmList(function (farmList) {

            //Get farm results
            let $farmResults = getResults(farmList);
            const nFarmResult = $farmResults.length;

            //IF any farm result exists
            if (nFarmResult) {

                //Hide these farm results
                $farmResults.hide(0);
                //Check search page's looking
                checkMargin();
                //Add hint that allows user to show these results temporarily
                addShowAllHint(nFarmResult);
            }

            //After farm results are hidden, add block hint to the remaining results
            addBlockHint(getResults(null, 'visible'));
        })
    }

    //Add or update a hint of a result
    //Arg $results should all contain or all not contain hints
    function addResultHint($results, text, onClick) {

        //Get the hint anchor of these results
        let $hint = $('a.cfb-hint', $results);

        //IF these hint all exist
        if ($hint.length) {

            //Reset this hint
            $hint.off('click')
                .html(text)
                .one('click', function () {
                    onClick($(this).parents('div.g'));
                    return false;
                });
            return;
        }

        //IF no hint exists
        //Create new hint
        $hint = $('<a class="TbwUpd fl cfb-hint" href="#"></a>')
            .html(text)
            .css({
                'margin-left': '4px',
                'color': '#808080'
            })
            .one('click', function () {
                onClick($(this).parents('div.g'));
                return false;
            });

        //Add these hints to DOM tree
        $('cite.iUh30', $results).parent().append($hint);
    }

    //Add block hints to results
    function addBlockHint($results) {

        addResultHint($results, chrome.i18n.getMessage('block'), block);
    }

    //Add redo hints to results
    function addRedoHint($results, hostName, type = false) {

        //IF this result is visible
        if (type || $results.is(':visible')) {
            addResultHint($results, '解除封鎖' /*TODO*/, function ($redone) {

                let hostName = getHostName($redone);
                let $unblocked = getResults(hostName);
                $('h3>a', $unblocked).removeClass('farm-title');
                addBlockHint($unblocked);
                removeHost(hostName);
            })
        }

        //IF this result has been hidden
        else {

            //Check host name
            if (!hostName) {
                hostName = getHostName($results);
            }
            const clzName = 'cfb-' + hostName.replace(/\./g, '-');

            //Create redo text
            let $redoText = $('<div class="g s ' + clzName + '"></div>')
                .append($('<span></span>').html(chrome.i18n.getMessage('redoText', hostName)));

            //Create redo button
            let $redoBtn = $('<a href="#"></a>')
                .html(chrome.i18n.getMessage('redo'))
                .one('click', function () {
                    $('div.' + clzName).remove();
                    let $unblocked = $('div.g').filter(function () {
                        return getHostName(this) === hostName;
                    });
                    addBlockHint($unblocked);
                    $unblocked.fadeIn(fadeTime);
                    removeHost(hostName);
                    return false;
                });

            //Add button to DOM tree
            $redoText.append($redoBtn);
            $results.after($redoText);
        }
    }

    //Get the host name of a result
    function getHostName($result) {

        let $anchor = $('h3 a', $result);
        if ($anchor.length) {
            return $anchor[0].hostname;;
        }
        return null;
    }

    //When block hint is clicked
    function block($result) {

        const hostName = getHostName($result);

        //Get ALL results that should be hidden
        let $blockedCandidates = getResults(hostName);

        //Hide these results
        $blockedCandidates.fadeOut(fadeTime, function () {
            addRedoHint($blockedCandidates, hostName)
        });

        //Add to blocking list
        addHost(hostName);

        return false;
    }

    //Remove extra margin between image box and the top bar
    function checkMargin() {

        let first = document.querySelector('div.g:not([style*="display: none"])');
        if (first && first.id === 'imagebox_bigimages') {
            first.firstChild.style.marginTop = '0';
            return true;
        }
        return false;
    }

    //Add hint that allows user to show farm results temporarily
    function addShowAllHint(nHidden) {

        let $div = $('<div id="tempShow"></div>');

        let $text = $('<p></p>')
            .css('font-style', 'italic')
            .html(chrome.i18n.getMessage('showAll', nHidden.toString()));

        let $btn = $('<a href="#"></a>')
            .html(chrome.i18n.getMessage('showAllHint'))
            .css('text-decoration', 'none')
            .click(function () {
                templyShowAll();
                $div.hide(0);
                return false;
            })
            .hover(function () {
                $btn.css('text-decoration', 'underline');
            }, function () {
                $btn.css('text-decoration', 'none');
            });

        $('#extrares').append($div);
        $div.append($text);
        $text.append($btn);
    }

    //Show farm results temporarily
    function templyShowAll() {

        let $farmResults = getResults(null, 'hidden');
        regFarmTitleClz();
        $('h3.r>a', $farmResults).addClass('farm-title');
        addRedoHint($farmResults, null, true);
        $farmResults.fadeIn(fadeTime);
    }

    function getResults(host, visibility) {
        let cssSelector = 'div.g';
        if (visibility === 'visible') {
            cssSelector += ':visible';
        } else if (visibility === 'hidden') {
            cssSelector += ':hidden';
        }

        if (!host) {
            return $(cssSelector);
        }

        if (Array.isArray(host)) {
            return $(cssSelector).filter(function () {
                return host.includes(getHostName(this));
            })
        }
        return $(cssSelector).filter(function () {
            return getHostName(this) === host;
        })
    }

    function regFarmTitleClz() {

        let css = 'a.farm-title { font-style: italic; color: #CC0000; }';
        let head = document.head;
        let style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
    }

})();