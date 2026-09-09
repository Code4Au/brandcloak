# Privacy Policy for BrandCloak

*Last updated: 2026-09-10*

BrandCloak is committed to protecting your privacy. This privacy policy explains how BrandCloak handles information when you use our Chrome Extension.

## 1. Zero Data Collection
BrandCloak does **not** collect, store, record, transmit, or sell any personal data, sensitive corporate information, browsing history, or website contents.

## 2. How Data Is Stored & Processed
- **Client-Side Only:** All brand masking, DOM element substitution, and title sanitization operations occur strictly in real-time within your local browser's memory.
- **User Preferences:** Your configuration settings (e.g. Master Stealth toggle, preferred cloaking style, and platform toggles) are stored locally on your device via Chrome's native `chrome.storage.sync` (or `chrome.storage.local`) API. These settings contain only boolean flags and styling mode identifiers.

## 3. Third-Party Services
BrandCloak does **not** use any third-party analytics, tracking pixels, telemetry services, external APIs, or remote advertising networks. Zero external network requests are made.

## 4. Data Sharing
We do not share, sell, lease, or distribute any user information to any third parties under any circumstances.

## 5. Permissions
BrandCloak requests only the minimal necessary permissions required to perform its functions:
- `storage`: Used solely to persist your local user preferences (such as enabling/disabling stealth mode) across browser sessions.

## 6. Contact
If you have any questions or feedback regarding this privacy policy, please open an issue on our GitHub repository:
- **GitHub:** [https://github.com/Code4Au/brandcloak](https://github.com/Code4Au/brandcloak)
- **Contact:** `dan@code4.com.au`
