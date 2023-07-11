(function () {

    const hint = document.querySelector('#hint');
    const area = document.querySelector('textarea');
    setADDListener();
    setDELETEListener();
    setSHOWALLListener();

    function setADDListener() {

        document.querySelector('#add').onclick = function () {

            let added = getList(getText());
            const len = added.length;
            const nRow = getRowCount();

            if (!len) {
                if (isAreaEmpty()) {
                    hint.innerHTML = '';
                } else {
                    hint.innerHTML = 'Invalid host names. Nothing is changed.';
                }
                return;
            }

            //Save new list
            getFarmList(function (origin) {

                let count = 0;
                for (let i = 0; i < len; i++) {
                    count += addHost(origin, added[i]);
                }

                if (count) {

                    //Save new list
                    setFarmList(origin);

                    if (count == 1) {
                        if (nRow == 1) {
                            hint.innerHTML = '"' + origin[0] + '" has been added into farm list.';
                        } else {
                            hint.innerHTML = 'Only "' + origin[0] + '" was added into farm list.';
                        }
                    }
                    else if (count == nRow) {
                        hint.innerHTML = 'All items (' + count + ') have been added into farm list.';
                    }
                    else {
                        hint.innerHTML = 'Only ' + count + ' items were added into farm list.';
                    }

                } else {

                    hint.innerHTML = 'Nothing changed.';
                }
            });
        }
    }

    function setDELETEListener() {

        document.querySelector('#delete').onclick = function () {

            let removed = getList(getText());
            const len = removed.length;
            const nRow = getRowCount();
            
            if (!len) {
                if (isAreaEmpty()) {
                    hint.innerHTML = '';
                } else {
                    hint.innerHTML = 'Invalid host names. Nothing is changed.';
                }
                return;
            }

            //Save new list
            getFarmList(function (origin) {

                let count = 0;
                for (let i = 0; i < len; i++) {
                    count += removeHost(origin, removed[i]);
                }

                if (count) {

                    //Save new list
                    setFarmList(origin);

                    if (count == 1) {
                        if (nRow == 1) {
                            hint.innerHTML = '"' + removed[0] + '" has been removed from farm list.';
                        } else {
                            hint.innerHTML = 'Only 1 item was removed from farm list.';
                        }
                    }
                    else if (count == nRow) {
                        hint.innerHTML = 'All items (' + count + ') have been removed from farm list.';
                    }
                    else {
                        hint.innerHTML = 'Only ' + count + ' items were removed from farm list.';
                    }

                } else {

                    hint.innerHTML = 'Nothing changed.';
                }
            });
        }
    }

    function setSHOWALLListener() {
        document.querySelector('#showAll').onclick = function () {
            getFarmList(function (data) {
                hint.innerHTML = '';
                if (data.length) {
                    let context = '---- [' + data.length + '] ----';
                    let text = context + '\n' + data.join('\n') + '\n' + context;
                    area.value = text;
                } else {
                    area.value = '---- Empty List ----';
                }
            });
        }
    }

    //Add a host into array
    function addHost(array, host) {

        if (array.indexOf(host) == -1) {
            array.unshift(host);
            return 1;
        }

        return 0;
    }

    //Remove a host from array
    function removeHost(array, host) {

        let index = array.indexOf(host);
        if (index != -1) {
            array.splice(index, 1);
            return 1;
        }

        return 0;
    }

    //Get the text of text area
    function getText() {

        return document.querySelector('textarea').value;
    }

    //Get the list of host name from text area
    function getList(text) {

        //Split contents by lines
        let lines = text.split('\n');
        const len = lines.length;

        //Read lines
        let array = [];
        let host = null;
        for (let i = 0; i < len; i++) {
            host = getHost(lines[i]);
            if (host) {
                array.push(host);
            }
        }

        return array;
    }

    //Get the host name from a text, or return null if this string is invalid
    function getHost(text) {

        //Check text and trim it
        if (!text) {
            return null;
        }
        text = text.trim();

        let host = null;
        let httpInit = new RegExp('http[s]{0,1}:\\/\\/.*?\\/.*');
        if (httpInit.test(text)) {
            let fromIndex = text.indexOf('://') + 3;
            let toIndex = text.indexOf('/', fromIndex);
            host = text.substring(fromIndex, toIndex);
        } else {
            host = text;
        }

        host = host.toLowerCase();
        let hostReg = new RegExp('^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9])$');
        return hostReg.test(host) ? host : null;
    }

    function isAreaEmpty() {

        return area.value.trim().length == 0;
    }

    function getRowCount(){

        return area.value.trim().split('\n').length;
    }

})();