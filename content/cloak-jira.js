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
      'a[href="/jira"] img',
      'a[href^="/jira"] img',
      'header nav [data-testid*="logo"] img',
      '.jira-custom',
      '[data-brandcloak-custom-logo]'
    ];

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.closest('.brandcloak-stock-replacement')) {
          results.add(el);
        }
      });
    }
    return Array.from(results);
  }

  // Find Jira product home link/container where stock replacement can be mounted
  function findJiraProductHomeContainers() {
    const results = new Set();
    const selectors = [
      '[data-testid="atlassian-navigation--product-home--container"] a',
      '[data-testid="atlassian-navigation--product-home--container"]',
      'a[href="/jira"]',
      'a[href^="/jira"]',
      '[data-testid="atlassian-navigation--logo"]',
      'a[data-testid="atlassian-navigation--logo-button"]',
      'header nav a[href="/jira"]'
    ];

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach(el => {
        const anchor = el.tagName === 'A' ? el : el.querySelector('a');
        results.add(anchor || el);
      });
    }
    return Array.from(results);
  }

  // Find Jira instance / tenant name text (e.g. "Acme Corp Jira" beside logo)
  function findJiraTenantNames() {
    const results = [];
    const selectors = [
      '[data-testid="atlassian-navigation--instance-name"]',
      '[data-testid="atlassian-navigation--site-title"]',
      '[data-testid="atlassian-navigation--logo"] span',
      '[data-testid="atlassian-navigation--logo"] + div span',
      '[data-testid="ContextualHeader-site-name"]',
      '[data-testid="navigation-header-site-title"]'
    ];

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach(el => {
        if (el.textContent && el.textContent.trim().length > 0) {
          results.push(el);
        }
      });
    }
    return results;
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
    const allStockReplacements = document.querySelectorAll('.brandcloak-stock-replacement[data-brandcloak-id*="jira"]');

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
            replacement.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; padding: 4px 6px; cursor: pointer;">
                ${utils.SVGS.jiraCompass}
                ${utils.SVGS.jiraWordmark}
              </div>
            `;
            container.prepend(replacement);
          } else {
            replacement.style.display = 'inline-flex';
          }
        });
      } else {
        // --- 2. Frosted Blur or Hidden Mode ---
        // Hide any stock replacements
        allStockReplacements.forEach(rep => {
          rep.style.display = 'none';
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
      allStockReplacements.forEach(rep => {
        rep.style.display = 'none';
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
    }

    // 2. Process Tenant / Instance Name Text
    const tenantTextElements = findJiraTenantNames();
    tenantTextElements.forEach(el => {
      if (active && settings.maskTenantBadges) {
        el.setAttribute('data-brandcloak-org-text', 'true');
        if (settings.cloakStyle === 'generic') {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
      } else {
        el.removeAttribute('data-brandcloak-org-text');
        el.style.display = '';
      }
    });

    // 3. Process Title
    if (active && settings.sanitizeTitles) {
      utils.sanitizeTitle(cleanJiraTitle);
    }
  }

  // Throttled scheduler for dynamic SPA changes
  let timeoutId = null;
  function scheduleCloak() {
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
