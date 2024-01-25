// Add event listener for the 'Start Inspecting' button
document.getElementById('startInspecting').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "toggleInspecting"});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {code: 'var inspecting = true;'}  // This variable will be used in the content script
        );
        chrome.tabs.insertCSS(tabs[0].id, {file: 'content.css'}); // Insert CSS for highlighting elements
        chrome.tabs.executeScript(tabs[0].id, {file: 'content.js'}); // Insert the content script
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleInspecting');
    const codeSnippetsElement = document.getElementById('codeSnippets');
    const historyList = document.getElementById('historyList');
    let isInspecting = false; // Track inspecting state

    function updateButton(inspecting) {
        if (toggleButton) {
            toggleButton.textContent = inspecting ? 'Stop Inspecting' : 'Start Inspecting';
        }
    }

    function addCodeSnippets(locator, language, snippet) {
        // Create code snippet element with copy icon
        //codeSnippetsElement.innerHTML = '<h2>Code Snippets</h2>'; // Clear previous snippets
        const snippetElement = document.createElement('div');
        const copyIcon = document.createElement('span');
        copyIcon.innerHTML = '&#128203;'; // Unicode for copy icon
        copyIcon.style.cursor = 'pointer';
        copyIcon.onclick = function() {
            navigator.clipboard.writeText(snippet).then(() => {
                alert('Snippet copied to clipboard');
            });
        };
        snippetElement.innerHTML = `<b>${language}:</b> ${snippet} `;
        snippetElement.appendChild(copyIcon);
        codeSnippetsElement.appendChild(snippetElement);
    }

    function addToHistory(locator) {
        const listItem = document.createElement('li');
        listItem.textContent = locator;
        historyList.appendChild(listItem);
    }

    toggleButton.addEventListener('click', function() {
        isInspecting = !isInspecting;
        updateButton();
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "toggleInspecting", state: isInspecting});
        });
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "elementSelected") {
            isInspecting = false;
            updateButton();
            const jsSnippet = `await page.$('${request.locator}');`;
            const pySnippet = `await page.query_selector('${request.locator}')`;
            addCodeSnippet(request.locator, 'JavaScript', jsSnippet);
            addCodeSnippet(request.locator, 'Python', pySnippet);
            addToHistory(request.locator);
        }
    });
});