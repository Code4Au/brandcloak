// BrandCloak - Atlassian Jira & Confluence Cloud Cloaking Engine

(function () {
  'use strict';

  const utils = window.BrandCloakUtils;
  if (!utils) return;

  function isJiraTargetEnabled() {
    const settings = utils.getSettings();
    return settings.enabled && settings.jiraEnabled;
  }

  // Find all custom logo elements and images in Jira
  function findJiraCustomLogoElements() {
    const results = new Set();
    const selectors = [
      '[data-testid="atlassian-navigation--product-home--logo"]',
      '[data-testid="atlassian-navigation--product-home--logo"] img',
      '[data-testid="atlassian-navigation--product-home--icon"]',
      '[data-testid="atlassian-navigation--product-home--icon"] img',
      '[data-testid="atlassian-navigation--product-home--container"] img',
      '[data-testid="atlassian-navigation--logo"] img',
      'a[aria-label*="homepage" i][href*="/jira"] img',
      'header nav a[href="/jira"] img',
      '.jira-custom',
      '[data-brandcloak-custom-logo]'
    ];

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach(el => {
        if (el.closest('.brandcloak-stock-replacement')) {
          return;
        }
        // Strictly exclude breadcrumbs, sidebar, side navigation, main content
        if (el.closest('[aria-label="Breadcrumbs"], [data-testid*="sidebar"], aside, main, .jira-ticket-view')) {
          return;
        }
        results.add(el);
      });
    }
    return Array.from(results);
  }

  // Find Jira product home link/container where stock replacement can be mounted
  function findJiraProductHomeContainers() {
    const results = new Set();
    const selectors = [
      '[data-testid="atlassian-navigation--product-home--container"] a',
      'a[data-testid="atlassian-navigation--product-home--container"]',
      '[data-testid="atlassian-navigation--product-home--container"]',
      'a[data-testid="atlassian-navigation--logo-button"]',
      '[data-testid="atlassian-navigation--logo"] a',
      '[data-testid="atlassian-navigation--logo"]',
      'header nav a[href="/jira"]',
      'header a[href="/jira"]',
      'a[aria-label*="homepage" i][href*="/jira"]'
    ];

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach(el => {
        // Strictly exclude breadcrumbs, sidebar, side-navigation, main ticket view
        if (el.closest('[aria-label="Breadcrumbs"], [data-testid*="sidebar"], aside, main, .jira-ticket-view')) {
          return;
        }
        const anchor = el.tagName === 'A' ? el : el.querySelector('a');
        results.add(anchor || el);
      });
    }
    return Array.from(results);
  }

  // Find Jira instance / tenant name text (e.g. "Acme Corp Jira" beside logo)
  function findJiraTenantNames() {
    const results = new Set();
    const settings = utils.getSettings();

    // 1. Fixed Atlassian tenant / site title selectors
    if (settings.maskTenantBadges) {
      const selectors = [
        '[data-testid="atlassian-navigation--instance-name"]',
        '[data-testid="atlassian-navigation--site-title"]',
        '[data-testid="atlassian-navigation--logo"] span',
        '[data-testid="atlassian-navigation--logo"] + div span',
        '[data-testid="atlassian-navigation--product-home--container"] + div',
        '[data-testid="ContextualHeader-site-name"]',
        '[data-testid="navigation-header-site-title"]'
      ];

      for (const selector of selectors) {
        document.querySelectorAll(selector).forEach(el => {
          const text = el.textContent ? el.textContent.trim() : '';
          // If it's the standard generic product label "JIRA", do not treat as a custom tenant name!
          if (text.length > 0 && text.toUpperCase() !== 'JIRA') {
            results.add(el);
          }
        });
      }
    }

    // 2. Custom Brand Keywords matching across Jira UI (boards, tickets, summaries, sidebar, headers, etc.)
    if (document.body) {
      const brandElements = utils.findCustomBrandElements(document.body);
      brandElements.forEach(el => results.add(el));
    }

    return Array.from(results);
  }

  // Sanitize Jira page titles (e.g. "[PROJ-123] Secret Task - Acme Corp - Jira" -> "[PROJ-123] Secret Task - Jira")
  function cleanJiraTitle(title) {
    if (!title) return title;

    // Pattern 1: "[TICKET-ID] Summary - Organization Name - Jira" -> "[TICKET-ID] Summary - Jira"
    let cleaned = title.replace(/\s*-\s*[^-]+?\s*-\s*Jira/i, ' - Jira');

    // Pattern 2: "[TICKET-ID] Summary - Organization Name Jira" -> "[TICKET-ID] Summary - Jira"
    cleaned = cleaned.replace(/\s*-\s*[^-]+?\s*Jira$/i, ' - Jira');

    // Pattern 3: "Boards - Organization - Jira" -> "Boards - Jira"
    cleaned = cleaned.replace(/\s*-\s*[^-]+?\s*Atlassian/i, ' - Atlassian');

    // Pattern 4: Standalone "Organization Name Jira" without ticket key -> "Jira"
    if (!/^\[?[A-Z0-9]+-\d+\]?/i.test(cleaned)) {
      cleaned = cleaned.replace(/^.+?\s*Jira\b/i, 'Jira');
    }

    return cleaned;
  }

  // Main Jira cloaking routine
  function applyJiraCloak() {
    const settings = utils.getSettings();
    const active = isJiraTargetEnabled();

    const customLogos = findJiraCustomLogoElements();
    const containers = findJiraProductHomeContainers();

    if (active) {
      if (settings.cloakStyle === 'generic') {
        // --- 1. Generic Stock Logo Mode ---
        // Hide existing custom logo images/elements
        customLogos.forEach(el => {
          el.setAttribute('data-brandcloak-replaced', 'true');
          el.style.display = 'none';
        });

        // Mount / show stock replacement inside each product home container
        containers.forEach((container, index) => {
          // Check if Atlassian already renders a native "JIRA" text element beside this container
          const homeContainer = container.closest('[data-testid*="product-home"]') || container;
          const nextSibling = homeContainer.nextElementSibling ||
            homeContainer.parentElement?.querySelector('[data-testid="atlassian-navigation--product-home--container"] + div');
          const siblingText = (nextSibling && nextSibling.textContent) ? nextSibling.textContent.trim() : '';
          const hasNativeJiraLabel = siblingText.toUpperCase() === 'JIRA';

          // If native "JIRA" label already exists beside the logo, don't duplicate the wordmark!
          const stockHtml = hasNativeJiraLabel
            ? `<div style="display: flex; align-items: center; justify-content: center; padding: 4px 6px; cursor: pointer;">
                 ${utils.SVGS.jiraCompass}
               </div>`
            : `<div style="display: flex; align-items: center; gap: 8px; padding: 4px 6px; cursor: pointer;">
                 ${utils.SVGS.jiraCompass}
                 ${utils.SVGS.jiraWordmark}
               </div>`;

          // Hide any non-replacement children of the container
          Array.from(container.children).forEach(child => {
            if (!child.classList.contains('brandcloak-stock-replacement')) {
              child.setAttribute('data-brandcloak-replaced', 'true');
              child.style.display = 'none';
            }
          });

          let replacement = container.querySelector(':scope > .brandcloak-stock-replacement');
          if (!replacement) {
            replacement = document.createElement('div');
            replacement.className = 'brandcloak-stock-replacement';
            replacement.setAttribute('data-brandcloak-id', `jira-stock-logo-${index}`);
            replacement.innerHTML = stockHtml;
            container.prepend(replacement);
          } else {
            replacement.innerHTML = stockHtml;
            replacement.style.setProperty('display', 'inline-flex', 'important');
          }
        });
      } else {
        // --- 2. Frosted Blur or Hidden Mode ---
        // Completely remove any stock replacements from DOM to guarantee no duplicate logos!
        document.querySelectorAll('.brandcloak-stock-replacement[data-brandcloak-id*="jira"]').forEach(rep => {
          rep.remove();
        });

        // Restore container child elements so they can be blurred/hidden
        containers.forEach(container => {
          Array.from(container.children).forEach(child => {
            if (!child.classList.contains('brandcloak-stock-replacement')) {
              child.removeAttribute('data-brandcloak-replaced');
              child.style.display = '';
            }
          });
        });

        // Tag all custom logo images and containers
        customLogos.forEach(el => {
          el.removeAttribute('data-brandcloak-replaced');
          el.setAttribute('data-brandcloak-custom-logo', 'true');
          if (settings.cloakStyle === 'hidden') {
            el.style.display = 'none';
          } else {
            el.style.display = '';
          }
        });
      }
    } else {
      // --- 3. Disabled / Paused Mode: Revert everything ---
      document.querySelectorAll('.brandcloak-stock-replacement[data-brandcloak-id*="jira"]').forEach(rep => {
        rep.remove();
      });

      containers.forEach(container => {
        Array.from(container.children).forEach(child => {
          if (!child.classList.contains('brandcloak-stock-replacement')) {
            child.removeAttribute('data-brandcloak-replaced');
            child.removeAttribute('data-brandcloak-custom-logo');
            child.style.display = '';
          }
        });
      });

      customLogos.forEach(el => {
        el.removeAttribute('data-brandcloak-replaced');
        el.removeAttribute('data-brandcloak-custom-logo');
        el.style.display = '';
      });

      document.querySelectorAll('[data-brandcloak-org-text]').forEach(el => {
        el.removeAttribute('data-brandcloak-org-text');
        el.style.display = '';
      });
    }

    // 2. Process Tenant / Instance Name Text
    const tenantTextElements = findJiraTenantNames();
    const currentTenantSet = new Set(tenantTextElements);

    // Clean up elements that are no longer matching or when defense is disabled
    document.querySelectorAll('[data-brandcloak-org-text]').forEach(el => {
      if (!active || !currentTenantSet.has(el)) {
        el.removeAttribute('data-brandcloak-org-text');
        el.style.display = '';
      }
    });

    if (active) {
      tenantTextElements.forEach(el => {
        el.setAttribute('data-brandcloak-org-text', 'true');
        if (settings.cloakStyle === 'generic') {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
      });
    }

    // 3. Process Title
    if (active && settings.sanitizeTitles) {
      utils.sanitizeTitle(cleanJiraTitle);
    }
  }

  // Throttled scheduler for dynamic SPA changes
  let timeoutId = null;
  function scheduleCloak() {
    if (!isJiraTargetEnabled()) return;
    if (timeoutId) return;
    timeoutId = setTimeout(() => {
      timeoutId = null;
      applyJiraCloak();
    }, 100);
  }

  // Setup observer
  function init() {
    applyJiraCloak();

    const observer = new MutationObserver(() => {
      scheduleCloak();
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        applyJiraCloak();
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }

    // Initialize title observer
    utils.initTitleObserver(cleanJiraTitle);

    // Listen for live setting updates
    window.addEventListener('BrandCloakSettingsUpdated', () => applyJiraCloak());
    window.addEventListener('BrandCloakSettingsLoaded', () => applyJiraCloak());
  }

  // Execute
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
