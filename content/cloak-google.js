// BrandCloak - Google Workspace Cloaking Engine (Gmail, Drive, Docs, Calendar)

(function () {
  'use strict';

  const utils = window.BrandCloakUtils;
  if (!utils) return;

  function isGoogleTargetEnabled() {
    const settings = utils.getSettings();
    return settings.enabled && settings.googleEnabled;
  }

  // Verify if an image is part of standard Google product branding (Gmail, Drive, Docs, etc.)
  function isStandardGoogleProductLogo(img) {
    if (!img) return true;

    const src = (img.src || '').toLowerCase();
    const alt = (img.alt || '').toLowerCase();
    const title = (img.title || '').toLowerCase();
    const ariaLabel = (img.getAttribute('aria-label') || '').toLowerCase();

    // Standard Google product identifiers - NEVER cloak standard product identity
    const productKeywords = [
      'drive', 'gmail', 'docs', 'sheets', 'slides', 'calendar',
      'meet', 'keep', 'forms', 'contacts', 'chat', 'mail/rfr',
      'logo_gmail', 'product/1x/drive', 'branding/product',
      'google_gemini', 'assistant'
    ];

    for (const kw of productKeywords) {
      if (src.includes(kw) || alt.includes(kw) || title.includes(kw) || ariaLabel.includes(kw)) {
        return true;
      }
    }

    const parentAnchor = img.closest('a');
    if (parentAnchor) {
      const anchorHref = (parentAnchor.href || '').toLowerCase();
      const anchorLabel = (parentAnchor.getAttribute('aria-label') || '').toLowerCase();
      const anchorTitle = (parentAnchor.getAttribute('title') || '').toLowerCase();
      for (const kw of productKeywords) {
        if (anchorHref.includes(kw) || anchorLabel.includes(kw) || anchorTitle.includes(kw)) {
          return true;
        }
      }
      const anchorRect = parentAnchor.getBoundingClientRect();
      if (anchorRect.left < window.innerWidth * 0.4) {
        return true;
      }
    }

    // Top-left elements (< 40% viewport width) are strictly standard Google product navigation
    const rect = img.getBoundingClientRect();
    if (rect.left < window.innerWidth * 0.4) {
      return true;
    }

    return false;
  }

  // Identify Google Workspace corporate logo candidates (strictly top-right enterprise branding)
  function findCustomGoogleLogos() {
    const targets = [];
    const headers = document.querySelectorAll('#gb, header, [role="banner"]');

    headers.forEach(header => {
      // 1. Direct hit on Google Workspace enterprise logo containers:
      const specificLogoImgs = header.querySelectorAll(
        '.gb_fb img, .gb_db img, .gb_0c img, .gb_1c img, img[src*="/ac/images/logo"], img[src*="service=google_gsuite"], img.gb_9c'
      );

      specificLogoImgs.forEach(img => {
        if (!isStandardGoogleProductLogo(img)) {
          targets.push({
            img,
            pillContainer: img.closest('.gb_db') || img.closest('.gb_fb') || img.closest('.gb_0c') || img.closest('.gb_1c') || img.parentElement
          });
        }
      });

      // 2. Search images in right section of header for custom branding
      const imgs = header.querySelectorAll('img');
      imgs.forEach(img => {
        if (isStandardGoogleProductLogo(img)) {
          return;
        }

        const rect = img.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(img);

        // Skip user profile avatars (circular or small square avatar)
        const isCircularAvatar = computedStyle.borderRadius === '50%' ||
          (rect.width > 0 && Math.abs(rect.width - rect.height) <= 4 && rect.width <= 44 && !img.src.includes('logo'));
        if (isCircularAvatar) {
          return;
        }

        // Must be strictly on the right section of the screen
        const isRightSide = rect.left > window.innerWidth * 0.4;
        if (!isRightSide) {
          return;
        }

        const isRectangular = (img.naturalWidth > 0 && img.naturalWidth > img.naturalHeight * 1.15) ||
          (rect.width > rect.height * 1.15 && rect.width > 30);
        const hasLogoUrl = /googleusercontent\.com|cpanel|\/images\/logo|gstatic\.com\/a\//i.test(img.src);
        const hasLogoAlt = /logo|brand|custom/i.test(img.alt || '') || /logo|brand/i.test(img.title || '');

        if (isRectangular || hasLogoUrl || hasLogoAlt) {
          targets.push({
            img,
            pillContainer: img.closest('.gb_db') || img.closest('.gb_fb') || img.closest('.gb_0c') || img.closest('.gb_1c') || img.parentElement
          });
        }
      });
    });

    // Deduplicate by pill container so we NEVER insert duplicate stock icons
    const seenContainers = new Set();
    const uniqueTargets = [];

    targets.forEach(item => {
      const containerKey = item.pillContainer || item.img.parentElement;
      if (!seenContainers.has(containerKey)) {
        seenContainers.add(containerKey);
        uniqueTargets.push(item);
      }
    });

    return uniqueTargets;
  }

  // Identify corporate domain / organization text badges in header and account switcher popups
  function findGoogleOrgBadges() {
    const badges = new Set();
    const settings = utils.getSettings();

    // 1. Standard Google header / account badge selectors
    if (settings.maskTenantBadges) {
      const selectors = [
        'header [aria-label*="managed by" i]',
        '#gb [aria-label*="managed by" i]',
        'header .gb_bb',
        'header .gb_cb',
        '#gb .gb_bb',
        '#gb .gb_cb',
        '#gb [data-hovercard-id*="@"]'
      ];

      for (const selector of selectors) {
        document.querySelectorAll(selector).forEach(el => badges.add(el));
      }
    }

    // 2. Custom Brand Keywords matching anywhere on page/frame via TreeWalker
    if (document.body) {
      const brandElements = utils.findCustomBrandElements(document.body);
      brandElements.forEach(el => badges.add(el));
    }

    // 3. Scan for "managed by", "admin console", and corporate email addresses
    if (settings.maskTenantBadges && document.body) {
      const isInsideFrame = window.self !== window.top || window.location.hostname === 'accounts.google.com';
      // In the account switcher popup or header, search text nodes
      const searchRoot = isInsideFrame ? document.body : (document.getElementById('gb') || document.querySelector('header') || document.querySelector('[role="dialog"]') || document.body);

      try {
        const textWalker = document.createTreeWalker(
          searchRoot,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode(node) {
              if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
              const val = node.nodeValue.trim();
              if (!val || val.length > 100) return NodeFilter.FILTER_REJECT;

              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const tag = parent.tagName.toLowerCase();
              if (tag === 'script' || tag === 'style' || tag === 'input' || tag === 'textarea') {
                return NodeFilter.FILTER_REJECT;
              }

              // "Managed by..."
              if (/managed\s+by/i.test(val)) return NodeFilter.FILTER_ACCEPT;
              // "Admin console"
              if (/admin\s+console/i.test(val)) return NodeFilter.FILTER_ACCEPT;
              // Corporate email (non-gmail) in account switcher or header
              if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) && !val.endsWith('@gmail.com') && !val.endsWith('@googlemail.com')) {
                return NodeFilter.FILTER_ACCEPT;
              }

              return NodeFilter.FILTER_REJECT;
            }
          }
        );

        let node;
        while ((node = textWalker.nextNode())) {
          if (node.parentElement) {
            badges.add(node.parentElement);
          }
        }
      } catch (e) {
        console.warn('[BrandCloak] TreeWalker error in Google badges:', e);
      }
    }

    return Array.from(badges);
  }

  // Sanitize Google Workspace title
  function cleanGoogleTitle(title) {
    if (!title) return title;

    // Pattern 1: "Inbox (2) - name@company.com - Gmail" -> "Inbox (2) - Gmail"
    let cleaned = title.replace(/\s*-\s*[^@\s]+@[^\s-]+\s*-\s*Gmail/i, ' - Gmail');

    // Pattern 2: "Document Title - Company Name - Google Docs" -> "Document Title - Google Docs"
    cleaned = cleaned.replace(/\s*-\s*[^-]+?\s*-\s*Google (Docs|Drive|Sheets|Slides|Forms)/i, ' - Google $1');

    // Pattern 3: "Google Drive - [Company Name]" -> "Google Drive"
    cleaned = cleaned.replace(/Google Drive\s*-\s*.+$/i, 'Google Drive');

    return cleaned;
  }

  // Main cloaking routine
  function applyGoogleCloak() {
    const settings = utils.getSettings();
    const active = isGoogleTargetEnabled();

    // 1. Process custom corporate logos
    const targets = findCustomGoogleLogos();

    if (active) {
      targets.forEach((item) => {
        const { img, pillContainer } = item;
        const parent = img.parentElement;

        img.setAttribute('data-brandcloak-google-logo', 'true');
        if (pillContainer && pillContainer !== img) {
          pillContainer.setAttribute('data-brandcloak-google-pill', 'true');
        }

        // Remove duplicate / stale replacements
        if (parent) {
          const existingReplacements = parent.querySelectorAll('.brandcloak-stock-replacement');
          if (settings.cloakStyle !== 'generic') {
            existingReplacements.forEach(el => el.remove());
          } else if (existingReplacements.length > 1) {
            for (let i = 1; i < existingReplacements.length; i++) {
              existingReplacements[i].remove();
            }
          }
        }

        if (settings.cloakStyle === 'generic') {
          // Generic mode: replace custom logo with clean multicolor Google "G" icon
          const stockHtml = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; min-width: 24px; padding: 2px 4px;">
              ${utils.SVGS.googleG}
            </div>
          `;
          utils.replaceWithStockElement(img, stockHtml, 'google-top-logo');

          if (pillContainer) {
            pillContainer.querySelectorAll('span, div:not(.brandcloak-stock-replacement)').forEach(txt => {
              if (txt.textContent && txt.textContent.trim().length > 0 && !txt.querySelector('svg')) {
                txt.setAttribute('data-brandcloak-org-text', 'true');
              }
            });
          }
        } else {
          // Blur or hidden mode
          img.removeAttribute('data-brandcloak-replaced');
          img.style.display = '';
          const replacement = parent?.querySelector('[data-brandcloak-id="google-top-logo"]');
          if (replacement) replacement.remove();
        }
      });
    } else {
      // Disabled: cleanly restore original state and remove all injected attributes
      document.querySelectorAll('[data-brandcloak-google-logo]').forEach(img => {
        img.removeAttribute('data-brandcloak-google-logo');
        img.removeAttribute('data-brandcloak-replaced');
        img.style.display = '';
      });

      document.querySelectorAll('[data-brandcloak-google-pill]').forEach(pill => {
        pill.removeAttribute('data-brandcloak-google-pill');
        pill.querySelectorAll('[data-brandcloak-org-text]').forEach(txt => {
          txt.removeAttribute('data-brandcloak-org-text');
          txt.style.display = '';
        });
      });

      document.querySelectorAll('.brandcloak-stock-replacement[data-brandcloak-id="google-top-logo"]').forEach(el => {
        el.remove();
      });

      document.querySelectorAll('[data-brandcloak-org-text]').forEach(el => {
        el.removeAttribute('data-brandcloak-org-text');
        el.style.display = '';
      });
    }

    // 2. Process org badges (e.g. "managed by acmecorp.com" and custom brands)
    const badges = findGoogleOrgBadges();
    const currentBadgesSet = new Set(badges);

    // Clean up elements that are no longer matching or when defense is disabled
    document.querySelectorAll('[data-brandcloak-org-text]').forEach(el => {
      if (!active || !currentBadgesSet.has(el)) {
        el.removeAttribute('data-brandcloak-org-text');
        el.style.display = '';
      }
    });

    if (active) {
      badges.forEach(badge => {
        badge.setAttribute('data-brandcloak-org-text', 'true');
        if (settings.cloakStyle === 'generic') {
          badge.style.display = 'none';
        } else {
          badge.style.display = '';
        }
      });
    }

    // 3. Process Title
    if (active && settings.sanitizeTitles) {
      utils.sanitizeTitle(cleanGoogleTitle);
    }
  }

  // Throttle observer calls for smooth performance
  let timeoutId = null;
  function scheduleCloak() {
    if (timeoutId) return;
    timeoutId = setTimeout(() => {
      timeoutId = null;
      applyGoogleCloak();
    }, 80);
  }

  // Setup observer
  function init() {
    applyGoogleCloak();

    const observer = new MutationObserver(() => {
      scheduleCloak();
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        applyGoogleCloak();
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }

    // Initialize title observer
    utils.initTitleObserver(cleanGoogleTitle);

    // Listen for live setting updates
    window.addEventListener('BrandCloakSettingsUpdated', () => applyGoogleCloak());
    window.addEventListener('BrandCloakSettingsLoaded', () => applyGoogleCloak());
  }

  // Execute
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
