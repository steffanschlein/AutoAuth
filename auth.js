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
 * Helper to extract the hostname from an URL
 */
function getHostname(href) {
    var l = document.createElement("a");
    l.href = href;
    return l.hostname;
};

/*
 * Helper to check if a dictionary contains no keys
 */
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

/*
 * Returns a promise which evaluates to authentication credentials if they where stored before.
 * If no credentials are stored the user gets redirected to a page asking for them.
 */
function provideCredentialsAsync(requestDetails) {
    if (pendingRequests.indexOf(requestDetails.requestId) != -1) {
        //Request has been seen before, assume credentials were bad, and give up
        return {cancel: true};

    } else {
        // Mark the request as seen
        pendingRequests.push(requestDetails.requestId);

        var host = getHostname(requestDetails.url);
        var tabId = requestDetails.tabId;

        let gettingItem = browser.storage.local.get(host);
        return gettingItem.then(item=>{
            if(Object.values(item)[0] && (!Object.values(item)[0]["username"] || Object.values(item)[0]["username"] == "")) {
                // Host was ignored. Do nothing.
                return;
            }
            if(isEmpty(item) || !Object.values(item)[0]) {
                // No credentials set yet and host is not ignored, so redirect to page to ask for credentials
                const url = browser.extension.getURL("modal.html?host=" + encodeURI(host) + "&url=" + encodeURI(requestDetails.url));
                browser.tabs.update(tabId, {
                    url: url
                });
                return {cancel: true}
            }
            // We have credentials saved, supply them
            return {authCredentials: Object.values(item)[0]};
        }, onError);
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
