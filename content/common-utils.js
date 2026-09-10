// BrandCloak - Shared Utilities and SVG Icons

(function () {
  'use strict';

  // Crisp, native SVGs for generic replacement
  const SVGS = {
    googleG: `
      <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" class="brandcloak-svg">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
      </svg>
    `,
    jiraCompass: `
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" class="brandcloak-svg">
        <path d="M15.82 2.05a1.14 1.14 0 00-.78.33L7.7 9.72a1.14 1.14 0 000 1.61l5.22 5.22a1.14 1.14 0 001.61 0l7.34-7.34a1.14 1.14 0 000-1.61l-5.22-5.22a1.14 1.14 0 00-.83-.33z" fill="#0052CC"/>
        <path d="M15.82 14.89a1.14 1.14 0 00-.78.33l-7.34 7.34a1.14 1.14 0 000 1.61l5.22 5.22a1.14 1.14 0 001.61 0l7.34-7.34a1.14 1.14 0 000-1.61l-5.22-5.22a1.14 1.14 0 00-.83-.33z" fill="#2684FF"/>
        <path d="M24.23 10.45l-5.22 5.22a1.14 1.14 0 000 1.61l5.22 5.22a1.14 1.14 0 001.61 0l5.22-5.22a1.14 1.14 0 000-1.61l-5.22-5.22a1.14 1.14 0 00-1.61 0z" fill="#0052CC"/>
      </svg>
    `,
    jiraWordmark: `
      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 17px; color: var(--ds-text, currentColor); margin-left: 8px; letter-spacing: -0.2px;">Jira</span>
    `,
    googleWorkspaceWordmark: `
      <span style="font-family: 'Google Sans', Roboto, Arial, sans-serif; font-size: 15px; color: #5f6368; margin-left: 6px; font-weight: 500;">Google</span>
    `
  };

  // State cache
  let currentSettings = {
    enabled: true,
    cloakStyle: 'generic',
    googleEnabled: true,
    jiraEnabled: true,
    sanitizeTitles: true,
    maskTenantBadges: true,
    customBrands: ''
  };

  // Apply root attributes to documentElement so CSS rules match immediately
  function applyRootAttributes(settings) {
    const root = document.documentElement;
    if (!root) return;

    root.setAttribute('data-brandcloak-active', String(settings.enabled));
    root.setAttribute('data-brandcloak-style', settings.cloakStyle || 'generic');
    root.setAttribute('data-brandcloak-google', String(settings.googleEnabled));
    root.setAttribute('data-brandcloak-jira', String(settings.jiraEnabled));
  }

  // Pre-initialize root attribute before DOM ready to avoid any flicker
  applyRootAttributes(currentSettings);

  function notifySettingsChanged() {
    applyRootAttributes(currentSettings);
    window.dispatchEvent(new CustomEvent('BrandCloakSettingsUpdated', { detail: currentSettings }));
  }

  // Load saved settings from Chrome Storage
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const storageArea = chrome.storage.sync || chrome.storage.local;
    storageArea.get(currentSettings, (items) => {
      if (items) {
        currentSettings = { ...currentSettings, ...items };
        applyRootAttributes(currentSettings);
        window.dispatchEvent(new CustomEvent('BrandCloakSettingsLoaded', { detail: currentSettings }));
      }
    });

    // Listen to storage changes directly - works across all tabs without extra permissions!
    if (chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        let hasRelevantChange = false;
        for (const key of Object.keys(currentSettings)) {
          if (changes[key]) {
            currentSettings[key] = changes[key].newValue;
            hasRelevantChange = true;
          }
        }
        if (hasRelevantChange) {
          notifySettingsChanged();
        }
      });
    }
  }

  // Also listen for direct runtime messages as a fallback
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'BRANDCLOAK_SETTINGS_UPDATED' && message.settings) {
        currentSettings = { ...currentSettings, ...message.settings };
        notifySettingsChanged();
      }
    });
  }

  // Helper to replace or restore elements
  function replaceWithStockElement(targetEl, stockSvgHtml, identifier) {
    if (!targetEl || !targetEl.parentElement) return;

    let replacement = targetEl.parentElement.querySelector(`[data-brandcloak-id="${identifier}"]`);

    if (currentSettings.enabled && currentSettings.cloakStyle === 'generic') {
      targetEl.setAttribute('data-brandcloak-replaced', 'true');
      targetEl.style.display = 'none';

      if (!replacement) {
        replacement = document.createElement('div');
        replacement.className = 'brandcloak-stock-replacement';
        replacement.setAttribute('data-brandcloak-id', identifier);
        replacement.innerHTML = stockSvgHtml;
        targetEl.parentElement.insertBefore(replacement, targetEl);
      } else {
        replacement.style.display = 'inline-flex';
      }
    } else {
      targetEl.removeAttribute('data-brandcloak-replaced');
      targetEl.style.display = '';
      if (replacement) {
        replacement.remove();
      }
    }
  }

  // Custom Brand Keywords matching & scrubbing
  function getCustomBrandKeywords() {
    const raw = currentSettings.customBrands || '';
    return raw
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
  }

  function cleanCustomBrandsFromTitle(title) {
    if (!title) return title;
    const keywords = getCustomBrandKeywords();
    if (keywords.length === 0) return title;

    let cleaned = title;
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // 1. If keyword is part of an email in title (e.g. "dan@goget.com.au" or "admin@goget.com"), strip entire email
      cleaned = cleaned.replace(new RegExp(`\\s*[-|·•/:]?\\s*[^\\s@]+@(?:[^\\s@]*\\.)?${escaped}\\b\\s*[-|·•/:]?\\s*`, 'gi'), ' - ');

      // 2. Match brand keyword followed immediately by Jira, e.g. " - GoGet Jira" -> " - Jira"
      cleaned = cleaned.replace(new RegExp(`\\s*[-|·•/:]?\\s*${escaped}\\s+Jira\\b`, 'gi'), ' - Jira');

      // 3. Match delimited brand keyword, e.g. " - GoGet - " or " - GoGet" or "GoGet - "
      cleaned = cleaned.replace(new RegExp(`\\s*[-|·•/:]?\\s*\\b${escaped}\\b\\s*[-|·•/:]?\\s*`, 'gi'), ' - ');
      cleaned = cleaned.replace(new RegExp(`\\s*[-|·•/:]?\\s*${escaped}\\s*[-|·•/:]?\\s*`, 'gi'), ' - ');
    }

    // Clean up duplicate separators and whitespace
    cleaned = cleaned
      .replace(/\s*-\s*-\s*/g, ' - ')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s*[-|·•/:]+\s*/, '')
      .replace(/\s*[-|·•/:]+\s*$/, '')
      .trim();

    return cleaned;
  }

  function matchesCustomBrand(text) {
    if (!text || typeof text !== 'string') return false;
    const keywords = getCustomBrandKeywords();
    if (keywords.length === 0) return false;
    const lower = text.toLowerCase();
    return keywords.some(kw => lower.includes(kw.toLowerCase()));
  }

  // Universal TreeWalker to accurately find specific text-bearing elements matching custom brand keywords
  function findCustomBrandElements(root) {
    if (!root) root = document.body;
    if (!root) return [];

    const keywords = getCustomBrandKeywords();
    if (keywords.length === 0) return [];

    const elements = new Set();

    // 1. Check text nodes via TreeWalker
    try {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
            const val = node.nodeValue.trim();
            if (val.length === 0) return NodeFilter.FILTER_REJECT;

            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;

            // Don't blur code inputs or active editors
            const tag = parent.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'input' || tag === 'textarea') {
              return NodeFilter.FILTER_REJECT;
            }

            if (parent.isContentEditable || parent.closest('[contenteditable="true"], .ProseMirror')) {
              return NodeFilter.FILTER_REJECT;
            }

            if (matchesCustomBrand(val)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          }
        }
      );

      let textNode;
      while ((textNode = walker.nextNode())) {
        const parent = textNode.parentElement;
        if (parent) {
          elements.add(parent);
        }
      }
    } catch (e) {
      console.warn('[BrandCloak] TreeWalker error:', e);
    }

    // 2. Also check elements with aria-label or title matching keywords
    for (const kw of keywords) {
      try {
        root.querySelectorAll(`[aria-label*="${kw}" i], [title*="${kw}" i]`).forEach(el => {
          if (el.children.length <= 2 && !el.closest('[contenteditable="true"]')) {
            elements.add(el);
          }
        });
      } catch (e) {}
    }

    return Array.from(elements);
  }

  // Title sanitizer observer
  let isSanitizingTitle = false;

  function sanitizeTitle(cleanerFn) {
    if (!currentSettings.enabled || !currentSettings.sanitizeTitles) return;

    const rawTitle = document.title;
    if (!rawTitle) return;

    let cleaned = cleanerFn ? cleanerFn(rawTitle) : rawTitle;
    cleaned = cleanCustomBrandsFromTitle(cleaned);

    if (cleaned && cleaned !== rawTitle) {
      isSanitizingTitle = true;
      document.title = cleaned;
      setTimeout(() => { isSanitizingTitle = false; }, 50);
    }
  }

  function initTitleObserver(cleanerFn) {
    if (typeof MutationObserver === 'undefined') return;

    const titleEl = document.querySelector('title');
    if (titleEl) {
      const observer = new MutationObserver(() => {
        if (!isSanitizingTitle) {
          sanitizeTitle(cleanerFn);
        }
      });
      observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
    }
    sanitizeTitle(cleanerFn);
  }

  // Expose on window.BrandCloakUtils
  window.BrandCloakUtils = {
    SVGS,
    getSettings: () => ({ ...currentSettings }),
    applyRootAttributes,
    replaceWithStockElement,
    initTitleObserver,
    sanitizeTitle,
    getCustomBrandKeywords,
    cleanCustomBrandsFromTitle,
    matchesCustomBrand,
    findCustomBrandElements
  };
})();
