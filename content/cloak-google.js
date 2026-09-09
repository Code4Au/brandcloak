// BrandCloak - Google Workspace Cloaking Engine (Gmail, Drive, Docs, Calendar)

(function () {
  'use strict';

  const utils = window.BrandCloakUtils;
  if (!utils) return;

  function isGoogleTargetEnabled() {
    const settings = utils.getSettings();
    return settings.enabled && settings.googleEnabled;
  }

  // Identify Google Workspace corporate logo candidates
  function findCustomGoogleLogos() {
    const targets = [];
    const headers = document.querySelectorAll('#gb, header, [role="banner"]');

    headers.forEach(header => {
      // 1. Direct hit on Google Workspace enterprise logo containers:
      // Google places the custom domain logo in .gb_db / .gb_fb or with logo.gif?service=google_gsuite
      const specificLogoImgs = header.querySelectorAll(
        '.gb_fb img, .gb_db img, img[src*="/ac/images/logo"], img[src*="service=google_gsuite"], img.gb_9c'
      );

      if (specificLogoImgs.length > 0) {
        specificLogoImgs.forEach(img => {
          targets.push({
            img,
            pillContainer: img.closest('.gb_db') || img.closest('.gb_fb') || img.parentElement
          });
        });
        return; // Exact match found!
      }

      // 2. Fallback: search all images in header for rectangular/custom branding
      const imgs = header.querySelectorAll('img');
      imgs.forEach(img => {
        const rect = img.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(img);

        // Skip user profile avatars (circular 50% border-radius or 1:1 square)
        const isCircularAvatar = computedStyle.borderRadius === '50%' ||
          (rect.width > 0 && Math.abs(rect.width - rect.height) <= 3 && rect.width <= 44 && !img.src.includes('logo'));

        if (isCircularAvatar) {
          return;
        }

        // Skip standard Gmail logo on the top-left
        const isTopLeft = rect.left < window.innerWidth * 0.3;
        const isStandardGmailLogo = isTopLeft && (img.src.includes('logo_gmail') || img.src.includes('mail/rfr/'));
        if (isStandardGmailLogo) {
          return;
        }

        const isRightSide = rect.left > window.innerWidth * 0.35;
        const isRectangular = (img.naturalWidth > 0 && img.naturalWidth > img.naturalHeight * 1.15) ||
          (rect.width > rect.height * 1.15 && rect.width > 30);
        const hasLogoUrl = /googleusercontent\.com|cpanel|\/images\/logo|gstatic\.com\/a\//i.test(img.src);
        const hasLogoAlt = /logo|brand|custom/i.test(img.alt || '') || /logo|brand/i.test(img.title || '');

        if ((isRightSide && (isRectangular || hasLogoUrl || hasLogoAlt)) ||
            (hasLogoUrl && !img.src.includes('logo_gmail'))) {
          targets.push({
            img,
            pillContainer: img.closest('.gb_db') || img.closest('.gb_fb') || img.parentElement
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

  // Identify corporate domain / organization text badges in header
  function findGoogleOrgBadges() {
    const badges = [];
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
      document.querySelectorAll(selector).forEach(el => badges.push(el));
    }
    return badges;
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

    targets.forEach((item) => {
      const { img, pillContainer } = item;
      const parent = img.parentElement;

      img.setAttribute('data-brandcloak-google-logo', 'true');
      if (pillContainer && pillContainer !== img) {
        pillContainer.setAttribute('data-brandcloak-google-pill', 'true');
      }

      // Remove ANY existing duplicate/stale replacement elements in this container
      if (parent) {
        const existingReplacements = parent.querySelectorAll('.brandcloak-stock-replacement');
        if (!active || settings.cloakStyle !== 'generic') {
          existingReplacements.forEach(el => el.remove());
        } else if (existingReplacements.length > 1) {
          // Keep only one replacement
          for (let i = 1; i < existingReplacements.length; i++) {
            existingReplacements[i].remove();
          }
        }
      }

      if (active) {
        if (settings.cloakStyle === 'generic') {
          // In generic mode: replace the custom company logo with ONLY the clean multicolor Google "G" icon
          // Centered and sized to fit neatly inside the white box without overflowing onto user avatar
          const stockHtml = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; min-width: 24px; padding: 2px 4px;">
              ${utils.SVGS.googleG}
            </div>
          `;
          utils.replaceWithStockElement(img, stockHtml, 'google-top-logo');

          // Hide any custom company text inside the pill
          if (pillContainer) {
            pillContainer.querySelectorAll('span, div:not(.brandcloak-stock-replacement)').forEach(txt => {
              if (txt.textContent && txt.textContent.trim().length > 0 && !txt.querySelector('svg')) {
                txt.setAttribute('data-brandcloak-org-text', 'true');
              }
            });
          }
        } else {
          // Blur or hidden mode: restore display so CSS filter/none takes over cleanly
          img.removeAttribute('data-brandcloak-replaced');
          img.style.display = '';
          const replacement = parent?.querySelector('[data-brandcloak-id="google-top-logo"]');
          if (replacement) replacement.remove();
        }
      } else {
        // Disabled: restore original
        img.removeAttribute('data-brandcloak-replaced');
        img.style.display = '';
        const replacement = parent?.querySelector('[data-brandcloak-id="google-top-logo"]');
        if (replacement) replacement.remove();
      }
    });

    // 2. Process org badges (e.g. "managed by acmecorp.com")
    const badges = findGoogleOrgBadges();
    badges.forEach(badge => {
      if (active && settings.maskTenantBadges) {
        badge.setAttribute('data-brandcloak-org-text', 'true');
      } else {
        badge.removeAttribute('data-brandcloak-org-text');
      }
    });

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
