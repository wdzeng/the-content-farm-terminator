(function () {

    const ITEM_PER_PAGE = 10;

    buildPage();

    function buildPage() {

        let data = [
            { host: 'kknews.cc', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
            { host: 'read01.com', date: '2018-06-06' },
        ];

        if (data.length) {
            buildTable(data);
            buildPageBar(data);
        } else {
            noTable();
        }
    }

    function noTable() {

        let $main = $('main');
        $main.append('<h2>No candidates.</h2>');
    }

    function buildTable(data) {

        let $main = $('main');
        $main.append('<table id="manager" align="center"><thead><tr><td width="48px"></td><td width="200px">Host</td><td width="150px">Date</td></tr></thead><tbody></tbody></table>');

        const len = Math.min(data.length, ITEM_PER_PAGE);
        let $tbody = $('#manager tbody');
        for (let i = 0; i < len; i++) {
            $tbody.append('<tr><td><input type="checkbox" /></td><td></td><td></td></tr>');
        }

        insertData(data, 0, len);
    }

    function insertData(data, fromIndex) {
        const toIndex = fromIndex + ITEM_PER_PAGE;
        const len = data.length;
        let $td = $('#manager tbody td');
        for (let i = fromIndex, n = 0; i < toIndex; i++ , n++) {
            if (i < len) {
                $td.eq(3 * n).html('<input type="checkbox" />');
                $td.eq(3 * n + 1).html(data[i].host);
                $td.eq(3 * n + 2).html(data[i].date);
            } else {
                $td.eq(3 * n).html('');
                $td.eq(3 * n + 1).html('');
                $td.eq(3 * n + 2).html('');
            }
        }
    }

    function buildPageBar(data) {

        const len = data.length;
        let nPage = (len + 1) / ITEM_PER_PAGE + 1;
        if (nPage < 2) {
            return;
        }

        let $main = $('main');
        $main.append('<div id="pageBar"></div>');
        let $pBar = $('#pageBar');
        let $s = null;
        for (let i = 1; i <= nPage; i++) {
            $s = $('<span class="pageBlock">' + i + '</span>');
            $s.click(function () {
                insertData(data, ITEM_PER_PAGE * (i - 1));
            })
            $pBar.append($s);
        }
    }

})();