// Function to apply or remove the hiding class
function updateTabStyle(tabId, isEnabled) {
  const func = (isEnabledToAdd) => {
    if (isEnabledToAdd) {
      document.body.classList.add('opponent-hidden');
    } else {
      document.body.classList.remove('opponent-hidden');
    }
  };

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: func,
    args: [isEnabled] // Pass the isEnabled state as an argument
  }).catch(err => console.log("Error injecting script into tab:", tabId, err)); // Add error handling
}

// 1. Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateStyle") {
    const isEnabled = message.enabled;
    // Find all Chess.com tabs and update them
    chrome.tabs.query({ url: "*://*.chess.com/*" }, (tabs) => {
      tabs.forEach(tab => {
        updateTabStyle(tab.id, isEnabled);
      });
    });
  }
});

// 2. Apply style when a Chess.com tab is updated (loaded, refreshed, navigated)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab's URL is a Chess.com URL and the update is complete
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('chess.com')) {
    // Get the current setting from storage and apply it
    chrome.storage.sync.get(['hidingEnabled'], (result) => {
      if (result.hidingEnabled) {
        updateTabStyle(tabId, true);
      } else {
        // Ensure the class is removed if hiding is disabled (e.g., after a page reload)
         updateTabStyle(tabId, false);
      }
    });
  }
});

// Optional: Apply on initial install/startup if needed
chrome.runtime.onInstalled.addListener(() => {
  // You could set a default value here if desired
  // chrome.storage.sync.set({ hidingEnabled: false });
  console.log("Chess.com Opponent Hider installed/updated.");
});