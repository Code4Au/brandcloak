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

  // Pre-compiled keyword caches for high-performance zero-allocation matching
  let cachedKeywords = [];
  let cachedBrandRegex = null;
  let cachedTitleScrubbers = [];

  function updateBrandCache() {
    const raw = currentSettings.customBrands || '';
    cachedKeywords = raw
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (cachedKeywords.length === 0) {
      cachedBrandRegex = null;
      cachedTitleScrubbers = [];
      return;
    }

    const patternParts = cachedKeywords.map(k => {
      let p = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      p = p.replace(/\s+/g, '[\\s-_]*');
      p = p.replace(/([a-zA-Z])(\d)/g, '$1[\\s-_]*$2')
           .replace(/(\d)([a-zA-Z])/g, '$1[\\s-_]*$2');
      p = p.replace(/([a-z])([A-Z])/g, '$1[\\s-_]*$2');
      return p;
    });

    cachedBrandRegex = new RegExp(patternParts.join('|'), 'i');

    cachedTitleScrubbers = patternParts.map(esc => ({
      email: new RegExp(`\\s*[-|·•/:]?\\s*[^\\s@]+@(?:[^\\s@]*\\.)?${esc}(?:\\.[a-z.]{2,})?\\b\\s*[-|·•/:]?\\s*`, 'gi'),
      jira: new RegExp(`\\s*[-|·•/:]?\\s*${esc}\\s+Jira\\b`, 'gi'),
      word: new RegExp(`\\s*[-|·•/:]?\\s*\\b${esc}\\b\\s*[-|·•/:]?\\s*`, 'gi'),
      raw: new RegExp(`\\s*[-|·•/:]?\\s*${esc}\\s*[-|·•/:]?\\s*`, 'gi')
    }));
  }

  // Apply root attributes to documentElement so CSS rules match immediately
  function applyRootAttributes(settings) {
    const root = document.documentElement;
    if (!root) return;

    root.setAttribute('data-brandcloak-active', String(settings.enabled));
    root.setAttribute('data-brandcloak-style', settings.cloakStyle || 'generic');
    root.setAttribute('data-brandcloak-google', String(settings.googleEnabled));
    root.setAttribute('data-brandcloak-jira', String(settings.jiraEnabled));
  }

  // Pre-initialize root attribute and brand cache before DOM ready
  updateBrandCache();
  applyRootAttributes(currentSettings);

  function notifySettingsChanged() {
    updateBrandCache();
    applyRootAttributes(currentSettings);
    window.dispatchEvent(new CustomEvent('BrandCloakSettingsUpdated', { detail: currentSettings }));
  }

  // Load saved settings from Chrome Storage
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const storageArea = chrome.storage.sync || chrome.storage.local;
    storageArea.get(currentSettings, (items) => {
      if (items) {
        currentSettings = { ...currentSettings, ...items };
        updateBrandCache();
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

  // Custom Brand Keywords matching & scrubbing (O(1) cached RegExp)
  function getCustomBrandKeywords() {
    return cachedKeywords;
  }

  function cleanCustomBrandsFromTitle(title) {
    if (!title || cachedTitleScrubbers.length === 0) return title;

    let cleaned = title;
    for (let i = 0; i < cachedTitleScrubbers.length; i++) {
      const s = cachedTitleScrubbers[i];
      cleaned = cleaned.replace(s.email, ' - ');
      cleaned = cleaned.replace(s.jira, ' - Jira');
      cleaned = cleaned.replace(s.word, ' - ');
      cleaned = cleaned.replace(s.raw, ' - ');
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
    if (!text || typeof text !== 'string' || !cachedBrandRegex) return false;
    return cachedBrandRegex.test(text);
  }

  // High-performance TreeWalker: accurately targets text elements matching custom brands
  // Supports a single root or an array of specific container roots
  function findCustomBrandElements(roots) {
    if (!cachedBrandRegex) return [];

    const rootList = Array.isArray(roots)
      ? roots.filter(Boolean)
      : [roots || document.body].filter(Boolean);

    if (rootList.length === 0) return [];

    const elements = new Set();

    for (const root of rootList) {
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

              // Fast native RegExp test (sub-microsecond)
              if (cachedBrandRegex.test(val)) {
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
            const tag = parent.tagName.toLowerCase();
            if (
              parent !== document.body &&
              parent !== document.documentElement &&
              !['html', 'body', 'main', 'table', 'tbody', 'thead', 'tr', 'form'].includes(tag) &&
              parent.getAttribute('role') !== 'main' &&
              parent.children.length <= 5
            ) {
              elements.add(parent);
            }
          }
        }
      } catch (e) {
        console.warn('[BrandCloak] TreeWalker error:', e);
      }

      // Fast check for aria-label or title matching keywords in scoped container
      try {
        root.querySelectorAll('[aria-label], [title]').forEach(el => {
          if (el.children.length <= 2 && !el.closest('[contenteditable="true"]')) {
            const tag = el.tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'body' || tag === 'html') return;
            const aria = el.getAttribute('aria-label') || '';
            const title = el.getAttribute('title') || '';
            if (cachedBrandRegex.test(aria) || cachedBrandRegex.test(title)) {
              elements.add(el);
            }
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
