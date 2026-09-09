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
      // 1. Search all images inside the Google Bar / header
      const imgs = header.querySelectorAll('img');

      imgs.forEach(img => {
        const rect = img.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(img);

        // Check if this image is a standard user profile avatar:
        // Avatars are circular (border-radius: 50%) and square (1:1 ratio, typically 28-40px)
        const isCircularAvatar = computedStyle.borderRadius === '50%' ||
          (rect.width > 0 && Math.abs(rect.width - rect.height) <= 3 && rect.width <= 44 && !img.src.includes('logo'));

        if (isCircularAvatar) {
          return; // Skip user avatar
        }

        // Check if image is standard Gmail/Google system logo on the top-left:
        // Default Gmail logo has src like logo_gmail or alt="Gmail" on the left
        const isTopLeft = rect.left < window.innerWidth * 0.3;
        const isStandardGmailLogo = isTopLeft && (img.src.includes('logo_gmail') || img.src.includes('mail/rfr/'));
        if (isStandardGmailLogo) {
          return; // Don't replace standard Gmail icon!
        }

        // Detect if this image is a corporate logo:
        // Criteria A: Positioned on the right side of the header (where Google Workspace places enterprise logos)
        const isRightSide = rect.left > window.innerWidth * 0.35;

        // Criteria B: Rectangular aspect ratio (Google custom logos are 320x132 or wide rectangular)
        const isRectangular = (img.naturalWidth > 0 && img.naturalWidth > img.naturalHeight * 1.15) ||
          (rect.width > rect.height * 1.15 && rect.width > 30);

        // Criteria C: Specific URL patterns or alt tags used by enterprise branding
        const hasLogoUrl = /googleusercontent\.com|cpanel|\/images\/logo|gstatic\.com\/a\//i.test(img.src);
        const hasLogoAlt = /logo|brand|custom/i.test(img.alt || '') || /logo|brand/i.test(img.title || '');

        // Criteria D: Specific class names
        const hasGoogleCustomClass = img.classList.contains('gb_0c') || img.classList.contains('gb_7c');

        if ((isRightSide && (isRectangular || hasLogoUrl || hasLogoAlt || hasGoogleCustomClass)) ||
            (!isTopLeft && hasLogoUrl) ||
            (isTopLeft && hasLogoUrl && !img.src.includes('logo_gmail'))) {
          
          // Find the enclosing pill / button container (e.g. the rounded pill on the top right)
          let pillContainer = img.closest('a, [role="button"], div[class*="gb_"]') || img.parentElement;
          if (pillContainer && pillContainer.tagName === 'HEADER' || pillContainer?.id === 'gb') {
            pillContainer = img.parentElement;
          }

          targets.push({
            img,
            pillContainer
          });
        }
      });

      // 2. Also check for elements using CSS background-image for corporate logos
      const potentialBgElements = header.querySelectorAll('a, div, span');
      potentialBgElements.forEach(el => {
        const bg = window.getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none' && (bg.includes('googleusercontent.com') || bg.includes('cpanel') || bg.includes('/logo'))) {
          targets.push({
            img: el,
            pillContainer: el.parentElement
          });
        }
      });
    });

    return targets;
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

    // 1. Process custom corporate logos (both image and enclosing pill)
    const targets = findCustomGoogleLogos();

    targets.forEach((item, index) => {
      const { img, pillContainer } = item;

      img.setAttribute('data-brandcloak-google-logo', 'true');
      if (pillContainer && pillContainer !== img) {
        pillContainer.setAttribute('data-brandcloak-google-pill', 'true');
      }

      if (active) {
        if (settings.cloakStyle === 'generic') {
          // In generic mode: replace the custom company logo with the official multicolor Google "G" SVG
          const stockHtml = `
            <div style="display: flex; align-items: center; gap: 6px; padding: 2px 6px;">
              ${utils.SVGS.googleG}
              ${utils.SVGS.googleWorkspaceWordmark}
            </div>
          `;
          utils.replaceWithStockElement(img, stockHtml, `google-top-logo-${index}`);

          // Hide any custom text inside the pill (e.g. company name)
          if (pillContainer) {
            pillContainer.querySelectorAll('span, div').forEach(txt => {
              if (!txt.classList.contains('brandcloak-stock-replacement') && !txt.closest('.brandcloak-stock-replacement')) {
                if (txt.textContent && txt.textContent.trim().length > 0 && !txt.textContent.includes('Google')) {
                  txt.setAttribute('data-brandcloak-org-text', 'true');
                }
              }
            });
          }
        } else {
          // Blur or hidden mode: restore display so CSS filter/none takes over
          img.removeAttribute('data-brandcloak-replaced');
          img.style.display = '';
          const replacement = img.parentElement?.querySelector(`[data-brandcloak-id="google-top-logo-${index}"]`);
          if (replacement) replacement.style.display = 'none';
        }
      } else {
        // Disabled: restore original
        img.removeAttribute('data-brandcloak-replaced');
        img.style.display = '';
        const replacement = img.parentElement?.querySelector(`[data-brandcloak-id="google-top-logo-${index}"]`);
        if (replacement) replacement.style.display = 'none';
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
