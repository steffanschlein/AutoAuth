function appendHtml(el, str) {
    var div = document.createElement('div');
    div.innerHTML = str;
    while (div.children.length > 0) {
        el.appendChild(div.children[0]);
    }
}

function isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0;
}

let gettingItem = browser.storage.local.get();
gettingItem.then(items=>{
    var creds = document.getElementById("credentials");
    creds.innerHTML = "";
    var ignored = document.getElementById("disabled");
    ignored.innerHTML = "";
    for (var host in items) {
        // check if the property/key is defined in the object itself, not in parent
        if (items.hasOwnProperty(host)) {
            if (!isEmpty(items[host]["username"])) {
                appendHtml(creds, "<li><span>" + host + " - " + items[host]["username"] + " </span><a href='#' class='forget-link' data-host='" + host + "'>Forget</a></li>");
            }
            else {
                appendHtml(ignored, "<li><span>" + host + " </span><a href='#' class='forget-link' data-host='" + host + "'>Forget</a></li>");
            }
        }
    }
});

function hasClass(elem, className) {
    return elem.className.split(' ').indexOf(className) > -1;
}

document.addEventListener('click', function (e) {
    if (hasClass(e.target, 'forget-link')) {
        e.preventDefault();
        var host = e.target.getAttribute('data-host');
        let removeHost = browser.storage.local.remove(host);
        removeHost.then(()=>{
            e.target.parentNode.remove();
        });
    }
}, false);
