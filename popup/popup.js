// BrandCloak - Popup Logic (Manifest V3 compliant)

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const masterToggle = document.getElementById('masterToggle');
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');
  const heroCard = document.querySelector('.hero-card');
  const hotkeyBadge = document.getElementById('hotkeyBadge');

  const styleButtons = document.querySelectorAll('.style-btn');
  const googleToggle = document.getElementById('googleToggle');
  const jiraToggle = document.getElementById('jiraToggle');
  const sanitizeTitlesToggle = document.getElementById('sanitizeTitlesToggle');
  const maskTenantBadgesToggle = document.getElementById('maskTenantBadgesToggle');

  // OS detection for keyboard shortcut hint
  const isMac = navigator.userAgent.includes('Mac');
  if (hotkeyBadge) {
    hotkeyBadge.textContent = isMac ? '⌥ + ⇧ + S' : 'Alt + Shift + S';
  }

  // Default state
  let settings = {
    enabled: true,
    cloakStyle: 'generic',
    googleEnabled: true,
    jiraEnabled: true,
    sanitizeTitles: true,
    maskTenantBadges: true
  };

  // Safe storage retrieval
  async function loadSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const storageArea = chrome.storage.sync || chrome.storage.local;
        const stored = await storageArea.get(settings);
        settings = { ...settings, ...stored };
      }
    } catch (err) {
      console.warn('[BrandCloak] Could not load settings from storage:', err);
    }
  }

  // Safe storage persistence: triggers chrome.storage.onChanged across all open tabs
  async function saveSettings() {
    try {
      if (typeof chrome !== 'undefined') {
        const storageArea = chrome.storage.sync || chrome.storage.local;
        await storageArea.set(settings);

        // Notify background service worker for badge update
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            type: 'UPDATE_SETTINGS',
            settings
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('[BrandCloak] Error saving settings:', err);
    }
  }

  // Sync UI components to settings object
  function renderUI() {
    // Master Toggle
    masterToggle.checked = settings.enabled;
    if (settings.enabled) {
      statusPill.classList.add('active');
      statusText.textContent = 'ACTIVE';
      heroCard.classList.remove('disabled');
    } else {
      statusPill.classList.remove('active');
      statusText.textContent = 'PAUSED';
      heroCard.classList.add('disabled');
    }

    // Style buttons
    styleButtons.forEach(btn => {
      const style = btn.getAttribute('data-style');
      if (style === settings.cloakStyle) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Platforms
    googleToggle.checked = settings.googleEnabled;
    jiraToggle.checked = settings.jiraEnabled;

    // Defenses
    sanitizeTitlesToggle.checked = settings.sanitizeTitles;
    maskTenantBadgesToggle.checked = settings.maskTenantBadges;
  }

  // Bind Event Listeners
  masterToggle.addEventListener('change', async () => {
    settings.enabled = masterToggle.checked;
    renderUI();
    await saveSettings();
  });

  styleButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const chosenStyle = btn.getAttribute('data-style');
      if (chosenStyle) {
        settings.cloakStyle = chosenStyle;
        renderUI();
        await saveSettings();
      }
    });
  });

  googleToggle.addEventListener('change', async () => {
    settings.googleEnabled = googleToggle.checked;
    await saveSettings();
  });

  jiraToggle.addEventListener('change', async () => {
    settings.jiraEnabled = jiraToggle.checked;
    await saveSettings();
  });

  sanitizeTitlesToggle.addEventListener('change', async () => {
    settings.sanitizeTitles = sanitizeTitlesToggle.checked;
    await saveSettings();
  });

  maskTenantBadgesToggle.addEventListener('change', async () => {
    settings.maskTenantBadges = maskTenantBadgesToggle.checked;
    await saveSettings();
  });

  // Initial load
  await loadSettings();
  renderUI();
});
