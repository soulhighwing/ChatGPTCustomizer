chrome.runtime.onMessage.addListener(function(message) {
    switch (message.action) {
        case "openOptionsPage":
            openOptionsPage();
            break;
        default:
            break;
    }
});

function openOptionsPage(){
    chrome.runtime.openOptionsPage();
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        "title": 'ChatGPTCustomizer',
        "contexts": ["all"],
        "id": "ChatGPTcontextMenu"
    });
});
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  chrome.tabs.sendMessage(tab.id, {action: "openEditor"});
});