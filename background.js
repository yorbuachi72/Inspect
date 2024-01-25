// Define a variable to keep track of the inspecting state
let isInspecting = false;

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "toggleInspecting") {
        // Toggle the inspecting state
        isInspecting = !isInspecting;
        // Send a message to the active tab to enable or disable the inspecting mode
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "setInspecting", state: isInspecting});
        });
    } else if (request.action === "getInspectingState") {
        // Send the current inspecting state to the sender
        sendResponse({isInspecting: isInspecting});
    }
    return true;
});

// Optional: Handle tab changes to update the inspecting state
chrome.tabs.onActivated.addListener(function(activeInfo) {
    // Send the current inspecting state to the newly activated tab
    chrome.tabs.sendMessage(activeInfo.tabId, {action: "setInspecting", state: isInspecting});
});
