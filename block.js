(function () {

    chrome.storage.sync.get('farmList', function (data) {

        let searchList = document.querySelectorAll('div.g');
        let farmList = data['farmList'];
        let removed = deleteFarms(searchList, farmList);
        if (removed) {
            checkMargin();
        }
    });

    //Delete farm reulst from search page
    function deleteFarms(searchList, farmList) {

        let removed = false;
        const len = searchList.length;
        let link = null;
        let host = null;

        for (let i = 0; i < len; i++) {
            link = searchList[i].querySelector('h3 a');
            if (!link) {
                continue;
            }
            host = link.hostname;
            if (farmList.includes(host)) {
                hide(searchList[i]);
                removed = true;
            }
        }

        return removed;
    }

    //Hide (delete) an element from page
    function hide(element) {
        element.style.display = 'none';
        //element.parentNode.removeChild(element); //This throws an incomprehensible error
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