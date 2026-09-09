// BrandCloak - Testbed Controller & Simulation Driver

document.addEventListener('DOMContentLoaded', () => {
  const mockStealthToggle = document.getElementById('mockStealthToggle');
  const mockStyleSelect = document.getElementById('mockStyleSelect');
  const mockGoogleToggle = document.getElementById('mockGoogleToggle');
  const mockJiraToggle = document.getElementById('mockJiraToggle');

  const gmailTabTitle = document.getElementById('gmailTabTitle');
  const jiraTabTitle = document.getElementById('jiraTabTitle');

  const rawGmailTitle = "Inbox (3) - dan@acmecorp.com - Gmail";
  const rawJiraTitle = "[PAY-4029] Encrypt transaction headers - Acme Global Jira";

  function updateMockState() {
    const enabled = mockStealthToggle.checked;
    const style = mockStyleSelect.value;
    const googleEnabled = mockGoogleToggle.checked;
    const jiraEnabled = mockJiraToggle.checked;

    const newSettings = {
      enabled,
      cloakStyle: style,
      googleEnabled,
      jiraEnabled,
      sanitizeTitles: true,
      maskTenantBadges: true
    };

    // Update root attributes for CSS
    if (window.BrandCloakUtils) {
      window.BrandCloakUtils.applyRootAttributes(newSettings);
    }

    // Broadcast update event so content scripts re-evaluate immediately
    window.dispatchEvent(new CustomEvent('BrandCloakSettingsUpdated', { detail: newSettings }));

    // Simulate tab title updates
    if (enabled) {
      if (googleEnabled) {
        gmailTabTitle.textContent = "Inbox (3) - Gmail";
        gmailTabTitle.style.color = "#10b981";
      } else {
        gmailTabTitle.textContent = rawGmailTitle;
        gmailTabTitle.style.color = "";
      }

      if (jiraEnabled) {
        jiraTabTitle.textContent = "[PAY-4029] Encrypt transaction headers - Jira";
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

  // Initial trigger to apply defaults
  setTimeout(updateMockState, 150);
});
