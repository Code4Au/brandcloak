# Contributing to BrandCloak

Thank you for your interest in contributing to BrandCloak! 

We welcome contributions of all kinds—from reporting bugs and adding support for new SaaS platforms to refining documentation and design. Below is a set of guidelines to help you get started.

---

## 🐛 Opening Issues

Before submitting a new issue, please check existing [open and closed issues](https://github.com/Code4Au/brandcloak/issues) to see if your bug or feature request has already been reported.

- **Bug Reports**: Please provide your Chrome version, OS, the affected platform (e.g., Gmail, Google Drive, Jira Cloud), and the cloaking style you were using.
- **Platform Requests**: Want BrandCloak on another SaaS tool (e.g., Salesforce, Slack, Notion, GitHub)? Open an issue describing which branding elements, headers, or tab titles need protection.

---

## 🔒 Security & Privacy Vulnerabilities

BrandCloak is built on a strict **100% on-device, zero-telemetry** architecture.

If you discover a security vulnerability or potential privacy leak, **please DO NOT create a publicly viewable issue**. Instead, report it privately via [GitHub Security Advisories](https://github.com/Code4Au/brandcloak/security/advisories) or email us directly at [`dan@code4.com.au`](mailto:dan@code4.com.au). We will review and respond promptly.

---

## 💡 Proposing New Features & Design

BrandCloak is designed to be lightweight, discreet, and zero-flicker:

- **Discuss First**: For major architectural changes or new platform engines, please open an issue to discuss the approach before investing time in a pull request.
- **Design Consistency**: The extension follows a cohesive dark-mode glassmorphic design system in the popup and authentic stock SaaS icons (Google "G", Jira Compass) for substitution. Please share UI proposals with us prior to implementation.

---

## 🛠️ Local Development Setup

BrandCloak is intentionally built with **native web standards** (Vanilla JavaScript, Vanilla CSS, Manifest V3). There is no complex build pipeline or bundler required to run the extension.

### 1. Clone the Repository
```bash
git clone https://github.com/Code4Au/brandcloak.git
cd brandcloak
```

### 2. Load the Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the cloned `brandcloak` directory.
4. Pin **BrandCloak** from the Chrome extensions toolbar.

### 3. Testing Changes
- **Live Extension**: After editing any file in `content/` or `popup/`, click the **Reload** (🔄) button on the BrandCloak card in `chrome://extensions`, then refresh your active tab.
- **Offline Testbed**: Open [`test/testbed.html`](test/testbed.html) in your browser to simulate Google Workspace and Jira environments locally without needing real corporate accounts.

---

## 📐 Project Conventions

- **100% On-Device**: Never introduce external network requests, telemetry, or third-party analytics.
- **Zero-Flicker Execution**: Declarative CSS in [`content/cloak-styles.css`](content/cloak-styles.css) must apply at `document_start` to prevent corporate branding from flashing during page load.
- **Selective Masking**: TreeWalker text scanners in [`content/common-utils.js`](content/common-utils.js) should target specific text nodes and badges—never tag high-level structural containers (`<body>`, `<table>`, `<main>`).

---

## 📦 Submitting a Pull Request

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/support-confluence
   ```
2. Test your changes in both the offline testbed and live browser sessions.
3. If you modified extension files, verify the packaging script builds cleanly:
   ```bash
   ./scripts/package-extension.sh
   ```
4. Push your branch and open a Pull Request against `main`.
5. Clearly describe what changed, why, and provide testing steps (with screenshots if altering UI).
