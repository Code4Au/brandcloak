// BrandCloak - Background Service Worker (Manifest V3)

const DEFAULT_SETTINGS = {
  enabled: true,
  cloakStyle: 'generic', // 'generic' | 'blur' | 'hidden'
  googleEnabled: true,
  jiraEnabled: true,
  sanitizeTitles: true,
  maskTenantBadges: true
};

// Safe storage access (sync with fallback to local)
async function getSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...result };
  } catch (err) {
    console.warn('[BrandCloak] Storage sync failed, falling back to local:', err);
    const result = await chrome.storage.local.get(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...result };
  }
}

async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set(settings);
  } catch (err) {
    await chrome.storage.local.set(settings);
  }
}

// Update the extension toolbar badge
async function updateBadge(enabled) {
  try {
    if (enabled) {
      await chrome.action.setBadgeText({ text: 'ON' });
      await chrome.action.setBadgeBackgroundColor({ color: '#06b6d4' }); // vibrant cyan
    } else {
      await chrome.action.setBadgeText({ text: 'OFF' });
      await chrome.action.setBadgeBackgroundColor({ color: '#64748b' }); // muted slate
    }
  } catch (err) {
    console.debug('[BrandCloak] Action badge update failed:', err);
  }
}

// Initialize on install or update
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  await saveSettings(settings);
  await updateBadge(settings.enabled);
  console.log('[BrandCloak] Initialized with settings:', settings);
});

// Sync badge on browser startup
chrome.runtime.onStartup.addListener(async () => {
  const settings = await getSettings();
  await updateBadge(settings.enabled);
});

// Handle keyboard command: Alt+Shift+S (or Option+Shift+S on macOS)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-stealth') {
    const settings = await getSettings();
    const newEnabled = !settings.enabled;
    const updated = { ...settings, enabled: newEnabled };
    await saveSettings(updated);
    await updateBadge(newEnabled);
    console.log('[BrandCloak] Stealth mode toggled via hotkey:', newEnabled);
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    getSettings().then(sendResponse);
    return true;
  }

  if (message.type === 'UPDATE_SETTINGS') {
    (async () => {
      await saveSettings(message.settings);
      await updateBadge(message.settings.enabled);
      sendResponse({ success: true });
    })();
    return true;
  }
});
