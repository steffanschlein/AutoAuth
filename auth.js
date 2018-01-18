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
 * Helper to extract the hostname and port from an URL
 */
function getHostname(url) {
    var arr = url.split("/");
    return arr[2];
}

/*
 * Helper to check if a dictionary contains no keys
 */
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function hijackTab(requestDetails, is_error) {
    var host = getHostname(requestDetails.url);
    const url = browser.extension.getURL("modal.html?host=" + encodeURI(host) + "&url=" + escape(encodeURI(requestDetails.url)) + "&is_error=" + is_error);
    var tabId = requestDetails.tabId;
    browser.tabs.update(tabId, {
        url: url
    });
    return {cancel: true}
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

        var host = getHostname(requestDetails.url);

        let gettingItem = browser.storage.local.get(host);
        return gettingItem.then(item=>{
            if(Object.values(item)[0] && (!Object.values(item)[0]["username"] || Object.values(item)[0]["username"] == "")) {
                // Host was ignored. Do nothing.
                return;
            }
            if(isEmpty(item) || !Object.values(item)[0]) {
                // No credentials set yet and host is not ignored, so redirect to page to ask for credentials
                return hijackTab(requestDetails, false);
            }
            // We have credentials saved, supply them
            return {authCredentials: Object.values(item)[0]};
        });
    }
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
