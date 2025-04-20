const toggleSwitch = document.getElementById('toggleSwitch');

// 1. Load the current state when popup opens
chrome.storage.sync.get(['hidingEnabled'], (result) => {
  toggleSwitch.checked = !!result.hidingEnabled; // Set checkbox based on stored value (default to false if not set)
});

// 2. Listen for changes on the checkbox
toggleSwitch.addEventListener('change', () => {
  const isEnabled = toggleSwitch.checked;
  // Save the new state
  chrome.storage.sync.set({ hidingEnabled: isEnabled }, () => {
    console.log('Hiding state saved:', isEnabled);
    // Send message to background script to update active tabs
    chrome.runtime.sendMessage({ action: "updateStyle", enabled: isEnabled });
  });
});