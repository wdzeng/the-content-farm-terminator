(function () {

    const ITEM_PER_PAGE = 10;
    buildPage();

    //Build the option page
    function buildPage() {

        //Get data
        let data = [
        ];
        for (let i = 10; i < 55; i++) {
            data.push({ 'host': 'kknews.cc', 'date': '2018-06-' + i });
        }

        //Build the page depending on the data
        if (data.length) {
            buildTable(data);
            buildPageBar(data);
        } else {
            noTable();
        }
    }

    //Build the option page if the farm list is empty
    function noTable() {

        $('#manager').css('display', 'none');
        $('#bottom').css('display', 'none');

        let $main = $('main');
        $main.append('<h2>Empty Farm List</h2>');
    }

    //Build the option page's farm table
    function buildTable(data) {

        //Build table
        const len = Math.min(data.length, ITEM_PER_PAGE);
        let $tbody = $('#manager tbody');
        for (let i = 0; i < len; i++) {
            $tbody.append('<tr><td><input type="checkbox" /></td><td></td><td></td></tr>');
        }

        //Insert contents
        insertData(data, 0, len);

        //Set checkbox function
        let $all = $('#selectAll');
        let $others = $('#manager input:checkbox').not($all);
        $all.change(function () {
            let isChecked = $all.prop('checked');
            $others.prop('checked', isChecked);
            $('#delete').prop('disabled', !isChecked);
        })
        $others.change(function () {
            let nChecked = $('#manager input:checkbox:checked').not($all).length;
            let ncb = $('#manager input:checkbox:visible').length - 1;
            $all.prop('checked', nChecked == ncb);
            $('#delete').prop('disabled', nChecked == 0);
        })
    }

    //Insert contents into table
    function insertData(data, fromIndex) {

        const toIndex = fromIndex + ITEM_PER_PAGE;
        const len = data.length;
        let $td = $('#manager tbody td');
        for (let i = fromIndex, n = 0; i < toIndex; i++ , n++) {
            if (i < len) {
                $td.eq(3 * n).children('input:checkbox').css('display', 'inherit');
                $td.eq(3 * n + 1).html(data[i].host);
                $td.eq(3 * n + 2).html(data[i].date);
            } else {
                $td.eq(3 * n).children('input:checkbox').css('display', 'none');
                $td.eq(3 * n + 1).html('');
                $td.eq(3 * n + 2).html('');
            }
        }
    }

    //Build page bar at the bottome if needed
    function buildPageBar(data, page = 1) {

        const len = data.length;
        let nPage = parseInt((len + 1) / ITEM_PER_PAGE + 1);

        //If only one page, do nothing
        if (nPage == 1) {
            return;
        }

        //Determine number's range
        const max = 9;
        const half = (max - 1) / 2;
        let fromPage, toPage;
        if (nPage <= max) {
            fromPage = 1;
            toPage = nPage;
        } else {
            if (page <= half) {
                fromPage = 1;
                toPage = max;
            } else if (page <= nPage - half - 1) {
                fromPage = nPage + 1 - max;
                toPage = max;
            } else {
                fromPage = page - half;
                toPage = page + half;
            }
        }

        //Build page bar
        let $pBar = $('#pageBar');
        for (let i = fromPage; i <= toPage; i++) {
            let $s = $('<span class="pageBlock">' + i + '</span>');

            //Setup onclick function
            $s.click(function () {

                //reset checkbox
                $('#manager input:checkbox').prop('checked', false);

                //update table
                insertData(data, ITEM_PER_PAGE * (i - 1));

                //reset page Bar
                $('span.pageBlock').removeClass('currentPage');
                $s.addClass('currentPage');

                //reset delete button
                $('#delete').prop('disabled', true);
            })

            $pBar.append($s);
        }

        //Bold page 1
        $page1 = $('span.pageBlock:first').addClass('currentPage');

        //Show page bar
        $pBar.css('visibility', 'inherit');
    }

})();