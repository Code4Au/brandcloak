# BrandCloak — Commuter Privacy Chrome Extension

> **Shield corporate identity and organization branding on Google Workspace & Jira when working in public spaces (trains, flights, cafes, co-working spaces).**

BrandCloak prevents "shoulder surfers" and stickybeakers from easily identifying your employer, client, or company by automatically masking and replacing custom corporate logos and tenant identifiers on common enterprise SaaS platforms.

---

## Key Features

1. **Inconspicuous "Stock Logo" Cloaking (Recommended)**
   - Replaces custom corporate logos with standard, authentic generic SaaS icons (Multicolor Google "G" / Gmail envelope & Jira Compass).
   - Casual onlookers glance at your screen and only see a completely normal Google or Jira window—attracting zero suspicion.
2. **Alternative Cloak Modes**
   - **Frosted Blur:** Smooth frosted glass blur over corporate logos and tenant names.
   - **Hidden:** Completely collapses the branding elements.
3. **Tab Title Sanitizer**
   - Strips sensitive organization names, email addresses, and tenant tags from browser tabs (e.g. `Inbox (3) - dan@acmecorp.com - Gmail` becomes `Inbox (3) - Gmail`).
4. **Tenant & Workspace Badge Masking**
   - Masks organization badges in account switchers, navigation headers, and breadcrumbs.
5. **Instant Keyboard Toggle**
   - Press <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> (or <kbd>Option</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> on Mac) to toggle Stealth Mode instantly on the fly.
6. **Zero-Flicker Injection**
   - Injected declaratively at `document_start` to prevent any flash of corporate logos during page load.
7. **100% On-Device Privacy**
   - Zero telemetry, zero analytics, zero external network requests.

---

## How to Install in Google Chrome

1. Clone or download this repository to your computer:
   ```bash
   git clone git@github.com:danmiles/browser-extension-obsfucate-branding.git
   ```
2. Open Google Chrome and navigate to:
   ```text
   chrome://extensions
   ```
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the project folder:
   ```text
   /Users/danmiles/Code/browser-extension-obsfucate-branding
   ```
6. The **BrandCloak** extension icon will now appear in your browser toolbar!

---

## Interactive Testbed

To preview and verify the cloaking mechanisms without logging into corporate accounts:
1. Open [`test/testbed.html`](file:///Users/danmiles/Code/browser-extension-obsfucate-branding/test/testbed.html) in Chrome.
2. Use the top toolbar to switch between **Stock Logo**, **Frosted Blur**, and **Hidden** modes, or toggle individual platforms to see real-time updates.

---

## Project Structure

```
├── manifest.json                  # Manifest V3 configuration with scoped host permissions
├── CHROMEWEBSTORE.md              # Chrome Web Store listing, justifications & privacy policy
├── icons/                         # 16, 32, 48, and 128px extension icons
├── popup/
│   ├── popup.html                 # Sleek dark-mode extension popup
│   ├── popup.css                  # Modern styling & micro-animations
│   └── popup.js                   # Popup state handling and live tab broadcast
├── content/
│   ├── cloak-styles.css           # Injected CSS for zero-flicker cloaking
│   ├── common-utils.js            # Shared SVG vectors, observer utilities, and storage sync
│   ├── cloak-google.js            # Google Workspace cloaking engine (Gmail, Drive, Docs)
│   └── cloak-jira.js              # Atlassian Jira Cloud cloaking engine
├── background/
│   └── service-worker.js          # Background service worker, badge updates & hotkeys
└── test/
    ├── testbed.html               # Interactive verification suite
    ├── testbed.css
    └── testbed.js
```
