(function () {

    removeFarmResults();
    addHints();

    function addHints() {
        let $hint = $('<a href="#">' + chrome.i18n.getMessage('block') + '</a>').css('margin-left', '4px').click(function () {

            const host = $('h3 a', $(this).parents('div.g'))[0].hostname;

            //Hide blocks
            $('div.g').filter(function (index) {
                return $('h3 a', this)[0].hostname === host;
            }).fadeOut(800, function () {
                checkMargin();
            });

            //Add to farm list
            getFarmList(function (data) {
                if (!data.includes(host)) {
                    data.unshift(host);
                    setFarmList(data);
                }
            })

            return false;
        });
        let $locs = $('cite.iUh30:visible').parent();
        $locs.append($hint);
    }

    function removeFarmResults() {

        getFarmList(function (farmList) {

            $('div.g').filter(function (index) {
                return farmList.includes($('h3 a', this)[0].hostname);
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