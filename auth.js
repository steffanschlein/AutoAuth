var target = "<all_urls>";

var pendingRequests = [];

/*
 * A request has completed. We can stop worrying about it.
 */
function completed(requestDetails) {
    var tabId = requestDetails.tabId;

    var index = pendingRequests.indexOf(requestDetails.requestId);
    if (index > -1) {
        pendingRequests.splice(index, 1);
    }
}

/*
 * Helper to extract the hostname and port from an URL.
 * @param url The url to take the parameter from. Expects a propper protocol prefex like 'http://' or 'https://'.
 * @returns An array of length two. The first element is the hostname as taken from the url. The second element is the hostname with a ':*' suffix.
 */
function getHostnames(url) {
    var [, , host_and_port] = url.split("/");
    return [host_and_port, host_and_port.split(":")[0] + ":*"];
}

/*
 * Helper to check if a dictionary contains no keys.
 */
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function hijackTab(requestDetails, is_error) {
    var host = getHostnames(requestDetails.url)[0];
    const url = browser.extension.getURL("modal.html?host=" + encodeURI(host) + "&url=" + escape(encodeURI(requestDetails.url)) + "&is_error=" + is_error);
    var tabId = requestDetails.tabId;
    browser.tabs.update(tabId, {
        url: url
    });
    return {cancel: true};
}

/*
 * Returns a promise which evaluates to authentication credentials if they where stored before.
 * If no credentials are stored the user gets redirected to a page asking for them.
 */
function provideCredentialsAsync(requestDetails) {
    if (pendingRequests.indexOf(requestDetails.requestId) != -1) {
        return hijackTab(requestDetails, true);
    } else {
        // Mark the request as seen
        pendingRequests.push(requestDetails.requestId);

        var hosts = getHostnames(requestDetails.url);

        let gettingItem = browser.storage.local.get(hosts);
        return gettingItem.then(credentials => {
            if (isEmpty(credentials)) {
                // No credentials set yet and host is not ignored, so redirect to page to ask for credentials
                return hijackTab(requestDetails, false);
            }

            // Take credentials with longest host.
            var possibleCreds = Object.entries(credentials);
            possibleCreds.sort((a, b) => b.length - a.length);
            credentials = possibleCreds[0][1];

            if (credentials == "ignored") {
                // Host was ignored. Do nothing.
                return;
            }
            else {
                // There are credentials stored for the host.
                return {authCredentials: credentials};
            }
        });
    }
}

/*
 * Handles updates of addon and migrates formats.
 */
function migration(details) {
    browser.storage.local.get(null).then(credentials => {
        Object.keys(credentials).forEach(function(host) {
            if (!credentials[host]) {
                browser.storage.local.remove(host);
            }
            else if (credentials[host] == "no") {
                browser.storage.local.set({[host]: "ignored"});
            }
        });
    });
}

/*
 * Register request listeners
 */
browser.webRequest.onAuthRequired.addListener(
    provideCredentialsAsync,
    {urls: [target]},
    ["blocking"]
);

browser.webRequest.onCompleted.addListener(
    completed,
    {urls: [target]}
);

browser.webRequest.onErrorOccurred.addListener(
    completed,
    {urls: [target]}
);

browser.runtime.onInstalled.addListener(migration);

