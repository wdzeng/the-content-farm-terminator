"use strict";
(function () {

    removeFarmResults();

    function removeFarmResults() {

        getFarmList(function (farmList) {

            let $hidden = $('div.g').filter(function (index) {
                let anchors = $('h3 a', this);
                if (!anchors.length) {
                    return false;
                }
                return farmList.includes(anchors[0].hostname);
            }).hide(0);

            const nHidden = $hidden.length;
            if (nHidden) {
                checkMargin();
                addShowAllHint(nHidden);
            }

            addBlockHint();
        })
    }

    function addBlockHint() {

        let $hint = $('<a class="TbwUpd fl" href="#"></a>')
            .html(chrome.i18n.getMessage('block'))
            .css({
                'margin-left': '4px',
                'color': '#808080'
            }).click(onHideBtnClicked);

        $('cite.iUh30:visible').parent().append($hint);
    }

    function onHideBtnClicked() {

        const $this = $(this);
        const host = $('h3 a', $this.parents('div.g'))[0].hostname;

        //Get blocks
        let $resultBlocks = $('div.g:visible').filter(function (index) {
            let $anchors = $('h3 a', this);
            return $anchors.length && $anchors[0].hostname === host;
        });

        //Hide blocks
        $resultBlocks.fadeOut(800, function () {

            //Replace each dot to dash
            const clz = host.replace(/\./g, '-');

            let $redoText = $('<div class="g s ' + clz + '"></div>')
                .append($('<span>' + chrome.i18n.getMessage('redoText', host) + '</span>'));

            let $redoBtn = $('<a href="#"></a>').html(chrome.i18n.getMessage('redo'))
                .click(function () {
                    $('div.' + clz).hide(0);
                    $resultBlocks.fadeIn(800);
                    removeHost(host);
                    return false;
                });

            $redoText.append($redoBtn);
            $this.after($redoText);
        });

        addHost(host);

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

    function addShowAllHint(nHidden) {

        let $text = $('<p></p>').css('font-style', 'italic')
            .html(chrome.i18n.getMessage('showAll', nHidden.toString()));

        let $btn = $('<a href="#"></a>').html(chrome.i18n.getMessage('showAllHint'))
            .css('text-decoration', 'none')
            .click(function () {
                $('div.g:hidden').fadeIn(400);
                return false;
            });

        let $div = $('<div></div>');

        $text.append($btn);
        $div.append($text);
        $('#extrares').append($div);
    }

})();