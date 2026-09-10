// BrandCloak - Testbed Controller & Simulation Driver

document.addEventListener('DOMContentLoaded', () => {
  const mockStealthToggle = document.getElementById('mockStealthToggle');
  const mockStyleSelect = document.getElementById('mockStyleSelect');
  const mockGoogleToggle = document.getElementById('mockGoogleToggle');
  const mockJiraToggle = document.getElementById('mockJiraToggle');
  const mockMaskBadges = document.getElementById('mockMaskBadges');
  const mockCustomBrands = document.getElementById('mockCustomBrands');

  const gmailTabTitle = document.getElementById('gmailTabTitle');
  const jiraTabTitle = document.getElementById('jiraTabTitle');

  const rawGmailTitle = "Inbox (3) - dan@acmecorp.com - Gmail";
  const rawJiraTitle = "[PAY-4029] Encrypt transaction headers - Acme Jira";

  function updateMockState() {
    const enabled = mockStealthToggle.checked;
    mockStyleSelect.disabled = !enabled;
    const style = mockStyleSelect.value;
    const googleEnabled = mockGoogleToggle.checked;
    const jiraEnabled = mockJiraToggle.checked;
    const maskTenantBadges = mockMaskBadges.checked;
    const customBrands = mockCustomBrands.value;

    const newSettings = {
      enabled,
      cloakStyle: style,
      googleEnabled,
      jiraEnabled,
      sanitizeTitles: true,
      maskTenantBadges,
      customBrands
    };

    // Store in utils state
    if (window.BrandCloakUtils) {
      window.BrandCloakUtils.settings = Object.assign({}, window.BrandCloakUtils.settings, newSettings);
      window.BrandCloakUtils.applyRootAttributes(newSettings);
    }

    // Broadcast update event so content scripts re-evaluate immediately
    window.dispatchEvent(new CustomEvent('BrandCloakSettingsUpdated', { detail: newSettings }));

    // Simulate tab title updates
    if (enabled) {
      if (googleEnabled) {
        const cleaned = window.BrandCloakUtils
          ? window.BrandCloakUtils.cleanCustomBrandsFromTitle(rawGmailTitle).replace(/\s*-\s*[^@\s]+@[^\s-]+\s*-\s*Gmail/i, ' - Gmail')
          : "Inbox (3) - Gmail";
        gmailTabTitle.textContent = cleaned;
        gmailTabTitle.style.color = "#10b981";
      } else {
        gmailTabTitle.textContent = rawGmailTitle;
        gmailTabTitle.style.color = "";
      }

      if (jiraEnabled) {
        const cleaned = window.BrandCloakUtils
          ? window.BrandCloakUtils.cleanCustomBrandsFromTitle(rawJiraTitle).replace(/\s*-\s*[^-]+?\s*-\s*Jira/i, ' - Jira').replace(/^.+?\s*Jira\b/i, 'Jira')
          : "[PAY-4029] Encrypt transaction headers - Jira";
        jiraTabTitle.textContent = cleaned;
        jiraTabTitle.style.color = "#10b981";
      } else {
        jiraTabTitle.textContent = rawJiraTitle;
        jiraTabTitle.style.color = "";
      }
    } else {
      gmailTabTitle.textContent = rawGmailTitle;
      gmailTabTitle.style.color = "";
      jiraTabTitle.textContent = rawJiraTitle;
      jiraTabTitle.style.color = "";
    }
  }

  mockStealthToggle.addEventListener('change', updateMockState);
  mockStyleSelect.addEventListener('change', updateMockState);
  mockGoogleToggle.addEventListener('change', updateMockState);
  mockJiraToggle.addEventListener('change', updateMockState);
  mockMaskBadges.addEventListener('change', updateMockState);
  mockCustomBrands.addEventListener('input', updateMockState);

  // Initial trigger to apply defaults
  setTimeout(updateMockState, 150);
});
