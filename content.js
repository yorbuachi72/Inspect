let inspecting = false;
let previousElement = null;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "setInspecting") {
        inspecting = request.state;
        if (!inspecting && previousElement) {
            removeClass(previousElement, 'highlightedElement');
            previousElement = event.target;
        addClass(event.target, 'highlightedElement');
        }
    }
});

document.addEventListener('mouseover', function(event) {
    if (inspecting) {
        if (previousElement) {
            removeClass(previousElement, 'highlightedElement');
        }
        previousElement = event.target;
        addClass(event.target, 'highlightedElement');
        event.target.style.border = '3px solid red';
    }
}, false);

document.addEventListener('mouseout', function(event) {
    if (inspecting) {
        // Remove the highlight
        event.target.style.border = '';
    }
}, false);

document.addEventListener('click', function(event) {
    if (inspecting) {
        event.preventDefault();
        event.stopPropagation();
        var locator = generateLocator(event.target); // Implement generateLocator function based on your requirements
        chrome.runtime.sendMessage({action: "elementSelected", locator: locator});
        chrome.runtime.sendMessage({action: "toggleInspecting"});
        // Additional logic to send locator to popup for history and code snippet generation
        removeClass(event.target, 'highlightedElement');
        chrome.runtime.sendMessage({action: "updatePopup", locator: locator});  
        previousElement = null;
        //inspecting = false; // Stop inspecting after an element is selected
    }
}, false);

// Helper functions to add and remove CSS classes for highlighted elements
function addClass(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else {
        el.className += ' ' + className;
    }
}

function removeClass(el, className) {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}
// Logic to generate locators (XPath, CSS selector, etc.)
function generateLocator(element) {
    if (element.id) {
        return '#' + element.id;
    } else if (element.className) {
        return '.' + element.className.split(' ')[0];
    } else {
        return element.tagName.toLowerCase();
    }
}

