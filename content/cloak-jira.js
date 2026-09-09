// BrandCloak - Atlassian Jira & Confluence Cloud Cloaking Engine

(function () {
  'use strict';

  const utils = window.BrandCloakUtils;
  if (!utils) return;

  function isJiraTargetEnabled() {
    const settings = utils.getSettings();
    return settings.enabled && settings.jiraEnabled;
  }

  // Find Jira header logo container and elements
  function findJiraLogoElements() {
    const results = [];
    const selectors = [
      '[data-testid="atlassian-navigation--logo"]',
      'header nav [data-testid*="logo"]',
      'a[href="/jira"][data-testid*="logo"]',
      'a[data-testid="atlassian-navigation--logo-button"]',
      '#atlassian-navigation--logo',
      'header a[href="/jira"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => results.push(el));
    }
    return results;
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
        // Only target if it contains text
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

    // Pattern 2: "Organization Name Jira" -> "Jira"
    cleaned = cleaned.replace(/^.+?\s*Jira\b/i, 'Jira');

    // Pattern 3: "Boards - Organization - Jira" -> "Boards - Jira"
    cleaned = cleaned.replace(/\s*-\s*[^-]+?\s*Atlassian/i, ' - Atlassian');

    return cleaned;
  }

  // Main Jira cloaking routine
  function applyJiraCloak() {
    const settings = utils.getSettings();
    const active = isJiraTargetEnabled();

    // 1. Process Logo Containers
    const logoContainers = findJiraLogoElements();
    logoContainers.forEach((container, index) => {
      // Find the inner image or custom graphic
      const customImg = container.querySelector('img') || container;
      customImg.setAttribute('data-brandcloak-custom-logo', 'true');

      if (active) {
        if (settings.cloakStyle === 'generic') {
          const stockHtml = `
            <div style="display: flex; align-items: center; gap: 8px; padding: 4px 6px; cursor: pointer;">
              ${utils.SVGS.jiraCompass}
              ${utils.SVGS.jiraWordmark}
            </div>
          `;
          utils.replaceWithStockElement(customImg, stockHtml, `jira-logo-${index}`);
        } else {
          // Blur or hidden style
          customImg.removeAttribute('data-brandcloak-replaced');
          customImg.style.display = '';
          const replacement = customImg.parentElement?.querySelector(`[data-brandcloak-id="jira-logo-${index}"]`);
          if (replacement) replacement.style.display = 'none';
        }
      } else {
        // Disabled: revert
        customImg.removeAttribute('data-brandcloak-replaced');
        customImg.style.display = '';
        const replacement = customImg.parentElement?.querySelector(`[data-brandcloak-id="jira-logo-${index}"]`);
        if (replacement) replacement.style.display = 'none';
      }
    });

    // 2. Process Tenant / Instance Name Text
    const tenantTextElements = findJiraTenantNames();
    tenantTextElements.forEach(el => {
      if (active && settings.maskTenantBadges) {
        el.setAttribute('data-brandcloak-org-text', 'true');
        if (settings.cloakStyle === 'generic') {
          // In generic mode, don't show custom company name text
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
