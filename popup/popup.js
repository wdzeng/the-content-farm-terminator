(function () {

    document.querySelector('#add').onclick = function () {

        //TODO
    }

    document.querySelector('#delete').onclick = function () {

        //TODO
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

})();