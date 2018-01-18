var user = document.getElementById("username");
var pw = document.getElementById("pw");
var all_ports = document.getElementById("all-ports");

var submit = document.getElementById("submit");
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

function isDefaultPort(host) {
    return host.split(":").length == 1;
}

var host = findGetParameter("host");
var url = findGetParameter("url");
var is_error = findGetParameter("is_error") == 'true';

submit.onclick = function(e) {
    e.preventDefault();
    if (all_ports.checked) {
        host = host.split(':')[0] + ':' + '*';
    }
    browser.storage.local.set({[host]: {username: user.value, password: pw.value}});
    location.href = url;
}

cancel.onclick = function(e) {
    e.preventDefault();
    if (all_ports.checked) {
        host = host.split(':')[0] + ':' + '*';
    }
    browser.storage.local.set({[host]: "ignored"});
    location.href = url;
}

if (is_error) {
    document.getElementById("error-banner").removeAttribute("hidden");
}

if (!isDefaultPort(host)) {
    document.getElementById("port-container").style.display = "block";
}

