# Chrome Web Store Listing — BrandCloak - Stealth Commuter Privacy

> Last Updated: 2026-09-10

## Store Listing

**Extension Name** [REQUIRED]
BrandCloak - Stealth Commuter Privacy

**Short Description** [REQUIRED]
Shields corporate branding and organization logos across Google Workspace and Jira to protect privacy in public spaces.

**Detailed Description** [REQUIRED]
BrandCloak shields your company's identity and custom corporate branding across popular SaaS platforms so you can work safely on public transit, flights, cafes, and co-working spaces without attracting shoulder-surfers or prying eyes.

Key Features:
- Intelligent Stealth Replacement: Automatically detects custom corporate logos on Google Workspace (Gmail, Drive, Docs) and Jira Cloud, swapping them with clean, generic stock SaaS logos so your screen looks ordinary and discreet.
- Multiple Cloak Modes: Choose between Stock Generic Logo replacement (recommended for inconspicuous commuting), Frosted Blur, or Complete Element Hiding.
- Tab Title & Favicon Sanitizer: Removes sensitive tenant names and organization tags from browser tabs to prevent bystanders from reading your active Jira projects or corporate emails.
- Tenant & Workspace Badge Masking: Neutralizes organization badges in account switchers and navigation headers.
- Zero-Lag Performance: Injected declaratively at page start to prevent any visual flicker of corporate branding.
- Privacy First: Operates 100% locally in your browser. Zero tracking, zero telemetry, zero external network requests.

How to Use:
1. Click the BrandCloak icon in your Chrome toolbar or press Alt+Shift+S (Option+Shift+S on Mac).
2. Ensure Master Stealth Mode is toggled ON.
3. Select your preferred cloaking style (Stock Logo, Frosted Blur, or Hidden).
4. Customize per-platform toggles for Google Workspace and Jira as desired.
5. Work with complete peace of mind in public spaces.

Privacy & Security Note:
BrandCloak requires no user account and never communicates with external servers. All settings and visual masking are executed entirely on your device.

Support & Feedback:
For questions, feature suggestions, or to request support for additional SaaS platforms, visit our GitHub repository or contact support.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Obfuscates and masks corporate organization branding and logos on Google Workspace and Jira to protect user privacy in public.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | icons/icon-128.png |
| Screenshot 1 [REQUIRED] | 1280×800 | ⬜ Not created | screenshots/screen1-google-cloak.png |
| Screenshot 2 [RECOMMENDED] | 1280×800 | ⬜ Not created | screenshots/screen2-jira-cloak.png |
| Screenshot 3 [RECOMMENDED] | 1280×800 | ⬜ Not created | screenshots/screen3-popup-settings.png |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | promo/tile-440x280.png |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | promo/marquee-1400x560.png |

### Screenshot Notes
- Screenshot 1: Split-view comparison of Gmail with custom company logo vs cloaked with generic Google Workspace logo.
- Screenshot 2: Jira Cloud board demonstrating replaced custom instance logo, cloaked tenant breadcrumb, and sanitized tab title.
- Screenshot 3: Modern BrandCloak popup interface displaying active stealth status, style switchers, and platform toggles.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Required to store and synchronize user preferences (stealth toggle, cloaking style, and platform toggles) locally across browser sessions and broadcast live updates across tabs. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

The extension collects no user data, transmits no information over the internet, and stores only user interface preferences locally in `chrome.storage`.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | N/A | No |
| Health info | No | No | N/A | No |
| Financial info | No | No | N/A | No |
| Authentication info | No | No | N/A | No |
| Personal communications | No | No | N/A | No |
| Location | No | No | N/A | No |
| Web history | No | No | N/A | No |
| User activity | No | No | N/A | No |
| Website content | No | No | N/A | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [RECOMMENDED]
https://github.com/danmiles/browser-extension-obsfucate-branding/blob/main/PRIVACY.md

### Privacy Statement
BrandCloak does not collect, record, transmit, or monetize any user data, browsing history, personal identity, or webpage contents. All operations—including logo substitution, style masking, and title sanitization—are performed exclusively in client-side browser memory. User preferences are stored locally via Chrome's synchronized extension storage API.

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info

**Publisher Name**: BrandCloak
**Contact Email**: dan@example.com
**Support URL / Email**: https://github.com/danmiles/browser-extension-obsfucate-branding/issues
**Homepage URL**: https://github.com/danmiles/browser-extension-obsfucate-branding

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-09-10 | Initial release with Google Workspace & Jira stealth cloaking, multi-style masking, and tab title sanitization. | Draft |

## Review Notes

### Known Issues / Limitations
- None. Permissions are restricted strictly to targeted SaaS domains (Google Workspace and Atlassian Jira).
