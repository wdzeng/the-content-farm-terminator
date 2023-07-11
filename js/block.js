"use strict";

(function () {

    removeFarmResults();
    addHints();

    function addHints() {
        let $hint = $('<a href="#">' + chrome.i18n.getMessage('block') + '</a>').css('margin-left', '4px').click(function () {
            
            const host = $('h3 a', $(this).parents('div.g'))[0].hostname;

            //Get block
            let $sec = $('div.g').filter(function (index) {
                let $anchors = $('h3 a', this);
                if (!$anchors.length) {
                    return false;
                }
                return $anchors[0].hostname === host;
            });

            //Hide blocks
            $sec.fadeOut(800, function () {
                let $redoText = $('<div class="g s"></div>')
                    .append($('<span>' + chrome.i18n.getMessage('redoText', host) + '</span>'));
                let $redoBtn = $('<a style="margin-left: 0.5em">' + chrome.i18n.getMessage('redo') + '</a>').click(function () {
                    $redoText.hide(0);
                    $sec.fadeIn(800);
                    removeHost(host);
                    //Disable anchor action
                    return false;
                });
                $redoText.append($redoBtn);
                $(this).after($redoText);
                checkMargin();
            });

            addHost(host);

            //Disable anchor action
            return false;
        });

        let $locs = $('cite.iUh30:visible').parent();
        $locs.append($hint);
    }

    function removeFarmResults() {

        getFarmList(function (farmList) {

            $('div.g').filter(function (index) {
                let anchors = $('h3 a', this);
                if (!anchors.length) {
                    return false;
                }
                return farmList.includes(anchors[0].hostname);
            }).hide(0, function () {
                checkMargin();
            });

            /*
            let searchList = document.querySelectorAll('div.g');
            let removed = deleteFarms(searchList, farmList);
            if (removed) {
                checkMargin();
            }
            */
        })
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
})();