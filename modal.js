var user = document.getElementById("username");
var pw = document.getElementById("pw");

var myform = document.getElementById("myform");
var cancel = document.getElementById("cancel");

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

var host = findGetParameter("host");
var url = findGetParameter("url");
var is_error = findGetParameter("is_error") == 'true';

myform.onsubmit = function(e) {
    e.preventDefault();
    obj = {};
    obj[host] = {username: user.value, password: pw.value};
    browser.storage.local.set(obj);
    location.href = url;
}

cancel.onclick = function(e) {
    e.preventDefault();
    obj = {};
    obj[host] = "no";
    browser.storage.local.set(obj);
    location.href = url;
}

if (is_error) {
    document.getElementById("error_banner").removeAttribute("hidden");
}
