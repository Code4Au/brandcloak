// BrandCloak - Chrome Web Store Marketing Assets Generator
// Generates 5x Screenshots (1280x800), 1x Small Promo Tile (440x280), 1x Marquee Promo Tile (1400x560)
// Outputs strictly 24-bit PNGs with NO alpha channel as required by the Chrome Web Store.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'screenshots');
const PROMO_DIR = path.join(ROOT_DIR, 'promo');
const TEMP_DIR = path.join(__dirname, 'temp_assets');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (!fs.existsSync(PROMO_DIR)) fs.mkdirSync(PROMO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

function renderPngWithoutAlpha(svgContent, outputPath, width, height) {
  const tempSvg = path.join(TEMP_DIR, `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.svg`);
  const tempPng = tempSvg.replace('.svg', '_rgba.png');

  fs.writeFileSync(tempSvg, svgContent, 'utf8');

  // Convert SVG to PNG at exact dimensions
  execSync(`rsvg-convert -w ${width} -h ${height} "${tempSvg}" -o "${tempPng}"`);

  // Use ffmpeg to force 24-bit RGB without alpha
  execSync(`ffmpeg -y -i "${tempPng}" -pix_fmt rgb24 "${outputPath}" 2>/dev/null`);

  // Clean up temps
  try {
    fs.unlinkSync(tempSvg);
    fs.unlinkSync(tempPng);
  } catch (e) {}

  console.log(`✅ Generated: ${path.relative(ROOT_DIR, outputPath)} (${width}x${height}, 24-bit no alpha)`);
}

// Common SVG Components & Gradients
const commonDefs = `
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070b14"/>
      <stop offset="40%" stop-color="#0b1329"/>
      <stop offset="100%" stop-color="#040810"/>
    </linearGradient>

    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>

    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#070b14"/>
    </linearGradient>

    <linearGradient id="frostedGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.25"/>
    </linearGradient>

    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>

    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000000" flood-opacity="0.6"/>
    </filter>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur"/>
    </filter>

    <filter id="shieldBlur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
  </defs>
`;

function getShieldSvg(x, y, scale = 1) {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" 
            fill="url(#brandGrad)" fill-opacity="0.18"
            stroke="url(#brandGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="8" y1="11" x2="16" y2="11" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
      <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    </g>
  `;
}

// -------------------------------------------------------------
// SCREENSHOT 1: Google Workspace Protection (1280x800)
// -------------------------------------------------------------
function generateScreen1() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
  ${commonDefs}
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  
  <!-- Subtle Background Grid/Glow -->
  <circle cx="200" cy="150" r="260" fill="#0284c7" opacity="0.12" filter="url(#softGlow)"/>
  <circle cx="1100" cy="700" r="280" fill="#10b981" opacity="0.10" filter="url(#softGlow)"/>

  <!-- Top Marketing Banner -->
  <g transform="translate(60, 48)">
    <rect width="210" height="26" rx="13" fill="#0369a1" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.2"/>
    <text x="14" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="800" fill="#38bdf8" letter-spacing="0.5">GOOGLE WORKSPACE PRIVACY</text>

    <text x="0" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="28" font-weight="800" fill="#ffffff">Shield Enterprise Branding in Gmail &amp; Google Drive</text>
    <text x="0" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="15" fill="#94a3b8">Automatically cloaks high-contrast corporate tenant logos, scrubs emails from tab titles, and obscures account switchers.</text>
  </g>

  <!-- Browser Window Frame -->
  <g transform="translate(60, 170)" filter="url(#cardShadow)">
    <rect width="1160" height="570" rx="12" fill="#ffffff" stroke="#334155" stroke-width="1"/>

    <!-- Browser Titlebar -->
    <path d="M 0 12 A 12 12 0 0 1 12 0 L 1148 0 A 12 12 0 0 1 1160 12 L 1160 44 L 0 44 Z" fill="#0f172a"/>
    <circle cx="24" cy="22" r="6" fill="#ef4444"/>
    <circle cx="44" cy="22" r="6" fill="#f59e0b"/>
    <circle cx="64" cy="22" r="6" fill="#10b981"/>

    <!-- Browser Tab 1: Sanitized Tab -->
    <g transform="translate(96, 10)">
      <rect width="280" height="26" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <rect x="12" y="7" width="14" height="11" rx="2" fill="#ea4335" fill-opacity="0.2" stroke="#ea4335" stroke-width="1"/>
      <text x="34" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#10b981">Inbox (3) - Gmail</text>
      <text x="210" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#64748b">🛡️ Sanitized</text>
    </g>

    <!-- Gmail App Header -->
    <g transform="translate(0, 44)">
      <rect width="1160" height="64" fill="#ffffff"/>
      <line x1="0" y1="64" x2="1160" y2="64" stroke="#e2e8f0" stroke-width="1"/>

      <!-- Left: Standard Gmail Logo -->
      <g transform="translate(24, 20)">
        <path d="M0 4h18M0 11h18M0 18h18" stroke="#5f6368" stroke-width="2" stroke-linecap="round"/>
        <g transform="translate(36, -3)">
          <path d="M0 3h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H0c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z" fill="#ea4335" fill-opacity="0.1"/>
          <path d="M-2 4l10 8 10-8" stroke="#ea4335" stroke-width="2" fill="none"/>
          <text x="26" y="18" font-family="-apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="20" fill="#5f6368" font-weight="500">Gmail</text>
        </g>
      </g>

      <!-- Center: Search Bar -->
      <g transform="translate(220, 12)">
        <rect width="520" height="40" rx="20" fill="#f1f5f9"/>
        <circle cx="20" cy="20" r="6" stroke="#64748b" stroke-width="1.8" fill="none"/>
        <line x1="25" y1="25" x2="31" y2="31" stroke="#64748b" stroke-width="1.8" stroke-linecap="round"/>
        <text x="44" y="25" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#64748b">Search mail</text>
      </g>

      <!-- Right: CLOAKED Corporate Brand Pill (Stock Logo Mode) -->
      <g transform="translate(910, 13)">
        <rect width="160" height="38" rx="19" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/>
        <!-- Stock 4-color G Logo -->
        <g transform="translate(14, 9)">
          <path d="M10 2a8 8 0 0 1 5.7 2.4l-2.4 2.4A4.6 4.6 0 0 0 10 5.4a4.6 4.6 0 0 0 0 9.2c2.6 0 4.1-1.8 4.3-3.6H10v-3h7.5A8 8 0 0 1 10 18a8 8 0 0 1 0-16z" fill="#0284c7"/>
        </g>
        <text x="42" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Workspace</text>
        <rect x="112" y="10" width="38" height="18" rx="4" fill="#10b981" fill-opacity="0.15"/>
        <text x="117" y="23" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="800" fill="#059669">STOCK</text>
      </g>

      <!-- Avatar -->
      <circle cx="1115" cy="32" r="18" fill="#0284c7"/>
      <text x="1115" y="37" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">DM</text>
    </g>

    <!-- Main Content Area -->
    <g transform="translate(0, 108)">
      <!-- Sidebar -->
      <rect width="200" height="462" fill="#f8fafc"/>
      <line x1="200" y1="0" x2="200" y2="462" stroke="#e2e8f0" stroke-width="1"/>
      
      <g transform="translate(20, 24)">
        <rect width="140" height="36" rx="18" fill="#dbeafe"/>
        <text x="40" y="23" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#1e40af">Inbox (3)</text>
      </g>
      <g transform="translate(20, 72)"><text x="40" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#64748b">Starred</text></g>
      <g transform="translate(20, 108)"><text x="40" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#64748b">Sent</text></g>

      <!-- Email List -->
      <g transform="translate(200, 0)">
        <!-- Row 1 -->
        <rect width="960" height="58" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
        <text x="24" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#0f172a">Security Notice</text>
        <text x="170" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#334155">Quarterly Enterprise Access Review - Sent to </text>
        
        <!-- Cloaked Email Badge -->
        <g transform="translate(480, 19)">
          <rect width="130" height="24" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="1"/>
          <text x="12" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#0369a1">🛡️ CLOAKED DOMAIN</text>
        </g>
        <text x="890" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8">09:15 AM</text>

        <!-- Row 2 -->
        <g transform="translate(0, 58)">
          <rect width="960" height="58" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
          <text x="24" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#0f172a">Payroll &amp; HR</text>
          <text x="170" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#334155">Employee Remuneration Schedule for </text>
          <g transform="translate(425, 19)">
            <rect width="105" height="24" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="1"/>
            <text x="10" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#0369a1">🛡️ CLIENT CORP</text>
          </g>
          <text x="890" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8">Yesterday</text>
        </g>
      </g>
    </g>

    <!-- Simulated Account Switcher Dropdown (Protected) -->
    <g transform="translate(860, 115)" filter="url(#cardShadow)">
      <rect width="280" height="210" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <g transform="translate(16, 16)">
        <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Google Account</text>
        
        <!-- Cloaked 'Managed by' Badge -->
        <g transform="translate(0, 30)">
          <rect width="248" height="28" rx="6" fill="#f8fafc" stroke="#38bdf8" stroke-width="1"/>
          <rect x="0" y="0" width="248" height="28" rx="6" fill="url(#frostedGlass)"/>
          <text x="28" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#0369a1">🏢 Managed by [Confidential Org]</text>
        </g>

        <!-- Account Row -->
        <g transform="translate(0, 75)">
          <circle cx="20" cy="20" r="18" fill="#0284c7"/>
          <text x="20" y="25" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">DM</text>
          <text x="48" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#0f172a">Dan Miles</text>
          
          <!-- Cloaked Email Row -->
          <rect x="48" y="22" width="130" height="18" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="0.8"/>
          <text x="54" y="34" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#0369a1">dan@[obscured]</text>
        </g>
      </g>
    </g>

    <!-- FLOATING FEATURE CALLOUTS -->
    <g transform="translate(730, 480)" filter="url(#cardShadow)">
      <rect width="370" height="68" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1.5"/>
      ${getShieldSvg(16, 16, 1.4)}
      <text x="64" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="800" fill="#ffffff">Stealth Mode Active</text>
      <text x="64" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94a3b8">Press <tspan fill="#38bdf8" font-weight="bold">Alt+Shift+S</tspan> to toggle anytime on public transit</text>
    </g>
  </g>
</svg>
`;
}

// -------------------------------------------------------------
// SCREENSHOT 2: Atlassian Jira Cloud Protection (1280x800)
// -------------------------------------------------------------
function generateScreen2() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
  ${commonDefs}
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  
  <circle cx="1100" cy="200" r="280" fill="#0284c7" opacity="0.12" filter="url(#softGlow)"/>
  <circle cx="200" cy="700" r="280" fill="#10b981" opacity="0.10" filter="url(#softGlow)"/>

  <!-- Top Marketing Banner -->
  <g transform="translate(60, 48)">
    <rect width="210" height="26" rx="13" fill="#0369a1" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.2"/>
    <text x="14" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="800" fill="#38bdf8" letter-spacing="0.5">ATLASSIAN JIRA CLOUD PRIVACY</text>

    <text x="0" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="28" font-weight="800" fill="#ffffff">Protect Client &amp; Tenant Identity in Jira Boards</text>
    <text x="0" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="15" fill="#94a3b8">Neutralizes corporate Jira instance names, side navigation tenant badges, and issue ticket boards.</text>
  </g>

  <!-- Browser Window Frame -->
  <g transform="translate(60, 170)" filter="url(#cardShadow)">
    <rect width="1160" height="570" rx="12" fill="#ffffff" stroke="#334155" stroke-width="1"/>

    <!-- Browser Titlebar -->
    <path d="M 0 12 A 12 12 0 0 1 12 0 L 1148 0 A 12 12 0 0 1 1160 12 L 1160 44 L 0 44 Z" fill="#0f172a"/>
    <circle cx="24" cy="22" r="6" fill="#ef4444"/>
    <circle cx="44" cy="22" r="6" fill="#f59e0b"/>
    <circle cx="64" cy="22" r="6" fill="#10b981"/>

    <!-- Browser Tab: Sanitized Jira Tab -->
    <g transform="translate(96, 10)">
      <rect width="320" height="26" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <circle cx="18" cy="13" r="5" fill="#0052cc"/>
      <text x="32" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#10b981">[PAY-4029] Encrypt headers - Jira</text>
      <text x="248" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#64748b">🛡️ Clean</text>
    </g>

    <!-- Jira Top Navigation -->
    <g transform="translate(0, 44)">
      <rect width="1160" height="56" fill="#0c66e4"/>

      <!-- App Switcher + Jira Icon -->
      <g transform="translate(20, 16)">
        <rect width="24" height="24" rx="4" fill="#ffffff" fill-opacity="0.2"/>
        <circle cx="6" cy="6" r="2" fill="#ffffff"/>
        <circle cx="12" cy="6" r="2" fill="#ffffff"/>
        <circle cx="18" cy="6" r="2" fill="#ffffff"/>
        <circle cx="6" cy="12" r="2" fill="#ffffff"/>
        <circle cx="12" cy="12" r="2" fill="#ffffff"/>
        <circle cx="18" cy="12" r="2" fill="#ffffff"/>
      </g>

      <!-- Jira Logo (Cloaked to Generic Jira Compass Icon) -->
      <g transform="translate(56, 14)">
        <path d="M14 2L2 14l12 12 12-12L14 2z" fill="#ffffff"/>
        <text x="34" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">Jira</text>
      </g>

      <!-- Cloaked Instance Title Callout -->
      <g transform="translate(130, 14)">
        <rect width="150" height="28" rx="6" fill="#ffffff" fill-opacity="0.15" stroke="#38bdf8" stroke-width="1"/>
        <text x="12" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#ffffff">🛡️ SITE TITLE MASKED</text>
      </g>

      <!-- Nav Links -->
      <g transform="translate(310, 20)">
        <text x="0" y="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#ffffff">Your work</text>
        <text x="85" y="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#ffffff">Projects</text>
        <text x="165" y="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#ffffff">Filters</text>
        <text x="235" y="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#ffffff">Dashboards</text>
      </g>
    </g>

    <!-- Jira Workspace & Kanban Board -->
    <g transform="translate(0, 100)">
      <!-- Sidebar -->
      <rect width="220" height="470" fill="#f8fafc"/>
      <line x1="220" y1="0" x2="220" y2="470" stroke="#e2e8f0" stroke-width="1"/>

      <g transform="translate(16, 20)">
        <!-- Cloaked Project Title in Sidebar -->
        <rect width="188" height="34" rx="6" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="1"/>
        <text x="12" y="21" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#0369a1">🛡️ Core Platform (Cloaked)</text>
      </g>

      <g transform="translate(24, 75)">
        <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#0c66e4">Kanban board</text>
        <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#64748b">Backlog</text>
        <text x="0" y="72" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#64748b">Issues</text>
        <text x="0" y="100" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#64748b">Releases</text>
      </g>

      <!-- Kanban Board Columns -->
      <g transform="translate(240, 20)">
        <text x="0" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="bold" fill="#0f172a">Sprint 42 Board</text>

        <!-- Column 1: TO DO -->
        <g transform="translate(0, 40)">
          <rect width="280" height="380" rx="8" fill="#f1f5f9"/>
          <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#475569">TO DO (4)</text>

          <!-- Card 1 -->
          <g transform="translate(12, 40)">
            <rect width="256" height="88" rx="6" fill="#ffffff" stroke="#e2e8f0"/>
            <text x="12" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#0f172a">Implement OAuth callback</text>
            <text x="12" y="44" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#64748b">Integrate with enterprise tenant...</text>
            <rect x="12" y="58" width="65" height="18" rx="3" fill="#e0f2fe"/>
            <text x="18" y="71" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#0284c7">PAY-4029</text>
          </g>

          <!-- Card 2 (With Cloaked Client Brand Keyword) -->
          <g transform="translate(12, 140)">
            <rect width="256" height="88" rx="6" fill="#ffffff" stroke="#e2e8f0"/>
            <text x="12" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#0f172a">Audit invoice feed for</text>
            <rect x="12" y="32" width="95" height="20" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="0.8"/>
            <text x="18" y="46" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#0369a1">[Confidential]</text>
            <rect x="12" y="58" width="65" height="18" rx="3" fill="#e0f2fe"/>
            <text x="18" y="71" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#0284c7">PAY-4031</text>
          </g>
        </g>

        <!-- Column 2: IN PROGRESS -->
        <g transform="translate(300, 40)">
          <rect width="280" height="380" rx="8" fill="#f1f5f9"/>
          <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#0c66e4">IN PROGRESS (2)</text>

          <g transform="translate(12, 40)">
            <rect width="256" height="96" rx="6" fill="#ffffff" stroke="#0c66e4" stroke-width="1.2"/>
            <text x="12" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Header encryption service</text>
            <text x="12" y="44" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#64748b">Zero-flicker protection rules</text>
            <rect x="12" y="66" width="65" height="18" rx="3" fill="#e0f2fe"/>
            <text x="18" y="79" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#0284c7">PAY-4020</text>
          </g>
        </g>

        <!-- Column 3: DONE -->
        <g transform="translate(600, 40)">
          <rect width="280" height="380" rx="8" fill="#f1f5f9"/>
          <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#10b981">DONE (8)</text>
        </g>
      </g>
    </g>
  </g>
</svg>
`;
}

// -------------------------------------------------------------
// SCREENSHOT 3: BrandCloak Popup & Control Suite (1280x800)
// -------------------------------------------------------------
function generateScreen3() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
  ${commonDefs}
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  
  <circle cx="640" cy="400" r="320" fill="#0284c7" opacity="0.14" filter="url(#softGlow)"/>

  <!-- Top Marketing Banner -->
  <g transform="translate(60, 48)">
    <rect width="180" height="26" rx="13" fill="#0369a1" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.2"/>
    <text x="14" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="800" fill="#38bdf8" letter-spacing="0.5">FULL VISUAL CONTROL</text>

    <text x="0" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="28" font-weight="800" fill="#ffffff">Intuitive Controls &amp; Flexible Cloaking Styles</text>
    <text x="0" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="15" fill="#94a3b8">Switch between Stock Logo, Frosted Blur, or Hidden modes. Enter nominated keywords with instant synchronization.</text>
  </g>

  <!-- Centered Floating Popup UI -->
  <g transform="translate(460, 160)" filter="url(#cardShadow)">
    <rect width="360" height="570" rx="16" fill="#0b1329" stroke="#38bdf8" stroke-width="1.8"/>

    <!-- Header -->
    <g transform="translate(24, 24)">
      ${getShieldSvg(0, 0, 1.6)}
      <text x="44" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="800" fill="#ffffff">BrandCloak</text>
      <text x="44" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94a3b8">Stealth Commuter Privacy</text>
      <rect x="235" y="4" width="70" height="24" rx="12" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
      <text x="250" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#6ee7b7">ACTIVE</text>
    </g>

    <!-- Master Stealth Card -->
    <g transform="translate(20, 80)">
      <rect width="320" height="64" rx="10" fill="#0f172a" stroke="#1e293b"/>
      <text x="16" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#f8fafc">Master Stealth Mode</text>
      <text x="16" y="46" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94a3b8">Obfuscate branding across all tabs</text>
      <rect x="252" y="18" width="52" height="28" rx="14" fill="#10b981"/>
      <circle cx="288" cy="32" r="10" fill="#ffffff"/>
    </g>

    <!-- Cloaking Styles -->
    <g transform="translate(20, 160)">
      <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="800" fill="#94a3b8" letter-spacing="0.5">CLOAKING STYLE</text>
      
      <!-- Style 1: Stock (Selected) -->
      <g transform="translate(0, 26)">
        <rect width="320" height="50" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="16" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#ffffff">🛡️ Stock Generic Logo</text>
        <text x="16" y="42" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#38bdf8">Replaces with consumer Google / Jira icons</text>
        <circle cx="295" cy="25" r="7" fill="#38bdf8"/>
        <circle cx="295" cy="25" r="3" fill="#0f172a"/>
      </g>

      <!-- Style 2: Blur -->
      <g transform="translate(0, 84)">
        <rect width="320" height="42" rx="8" fill="#0f172a" stroke="#1e293b"/>
        <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">🌫️ Frosted Blur</text>
        <circle cx="295" cy="21" r="7" fill="#1e293b"/>
      </g>

      <!-- Style 3: Hidden -->
      <g transform="translate(0, 134)">
        <rect width="320" height="42" rx="8" fill="#0f172a" stroke="#1e293b"/>
        <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">👁️‍🗨️ Hidden / None</text>
        <circle cx="295" cy="21" r="7" fill="#1e293b"/>
      </g>
    </g>

    <!-- Additional Defenses: Custom Brand Keywords -->
    <g transform="translate(20, 360)">
      <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="800" fill="#94a3b8" letter-spacing="0.5">NOMINATED BRAND KEYWORDS</text>
      
      <g transform="translate(0, 26)">
        <rect width="320" height="42" rx="8" fill="#070b14" stroke="#334155" stroke-width="1.2"/>
        <text x="14" y="26" font-family="-apple-system, BlinkMacSystemFont, 'SF Mono', monospace" font-size="12" fill="#38bdf8">Acme, Contoso, InternalProject</text>
      </g>
      <text x="4" y="82" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#64748b">Masks matching words across titles, emails, &amp; boards</text>
    </g>

    <!-- Footer Hotkey -->
    <g transform="translate(20, 480)">
      <rect width="320" height="46" rx="8" fill="#0f172a" stroke="#1e293b"/>
      <text x="16" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94a3b8">Instant Toggle Shortcut:</text>
      <rect x="205" y="11" width="100" height="24" rx="4" fill="#1e293b" stroke="#475569"/>
      <text x="218" y="27" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#38bdf8">Alt + Shift + S</text>
    </g>
  </g>

  <!-- Left Side Highlights -->
  <g transform="translate(80, 240)">
    <rect width="320" height="110" rx="12" fill="#0f172a" stroke="#1e293b" filter="url(#cardShadow)"/>
    <text x="20" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="bold" fill="#38bdf8">🛡️ Stock Logo Substitution</text>
    <text x="20" y="62" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8">Draws zero bystander suspicion by mimicking standard consumer personal Gmail &amp; Jira icons.</text>
  </g>

  <g transform="translate(80, 390)">
    <rect width="320" height="110" rx="12" fill="#0f172a" stroke="#1e293b" filter="url(#cardShadow)"/>
    <text x="20" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="bold" fill="#10b981">⚡ Zero-Flicker Injection</text>
    <text x="20" y="62" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8">Declarative CSS injected before page render ensures company logos never flash during loading.</text>
  </g>

  <!-- Right Side Highlights -->
  <g transform="translate(880, 240)">
    <rect width="320" height="110" rx="12" fill="#0f172a" stroke="#1e293b" filter="url(#cardShadow)"/>
    <text x="20" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="bold" fill="#38bdf8">🔍 Smart Boundary Matcher</text>
    <text x="20" y="62" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8">Flexibly handles spacing and word variations (e.g. Acme Corp ↔ AcmeCorp) with zero manual regex.</text>
  </g>

  <g transform="translate(880, 390)">
    <rect width="320" height="110" rx="12" fill="#0f172a" stroke="#1e293b" filter="url(#cardShadow)"/>
    <text x="20" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="bold" fill="#10b981">🔒 100% On-Device Storage</text>
    <text x="20" y="62" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8">Preferences sync across your personal browser sessions. Zero tracking, zero telemetry, zero servers.</text>
  </g>
</svg>
`;
}

// -------------------------------------------------------------
// SCREENSHOT 4: Nominated Brand Keywords (1280x800)
// -------------------------------------------------------------
function generateScreen4() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
  ${commonDefs}
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  
  <circle cx="900" cy="300" r="300" fill="#0284c7" opacity="0.12" filter="url(#softGlow)"/>

  <g transform="translate(60, 48)">
    <rect width="210" height="26" rx="13" fill="#0369a1" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.2"/>
    <text x="14" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="800" fill="#38bdf8" letter-spacing="0.5">UNIVERSAL KEYWORD CLOAKING</text>

    <text x="0" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="28" font-weight="800" fill="#ffffff">Scrub Sensitive Brand Names Everywhere</text>
    <text x="0" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="15" fill="#94a3b8">Dynamic TreeWalker scanning automatically detects and obscures nominated client names in message threads and search lists.</text>
  </g>

  <!-- Browser Window -->
  <g transform="translate(60, 170)" filter="url(#cardShadow)">
    <rect width="1160" height="570" rx="12" fill="#ffffff" stroke="#334155" stroke-width="1"/>

    <!-- Browser Titlebar -->
    <path d="M 0 12 A 12 12 0 0 1 12 0 L 1148 0 A 12 12 0 0 1 1160 12 L 1160 44 L 0 44 Z" fill="#0f172a"/>
    <circle cx="24" cy="22" r="6" fill="#ef4444"/>
    <circle cx="44" cy="22" r="6" fill="#f59e0b"/>
    <circle cx="64" cy="22" r="6" fill="#10b981"/>

    <g transform="translate(96, 10)">
      <rect width="260" height="26" rx="6" fill="#1e293b"/>
      <text x="24" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#10b981">Search: Confidential Client - Gmail</text>
    </g>

    <!-- Email Thread View -->
    <g transform="translate(40, 70)">
      <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold" fill="#0f172a">Project Alpha: Final Contract Signed</text>
      
      <!-- Sender & Receiver Line -->
      <g transform="translate(0, 48)">
        <circle cx="20" cy="20" r="18" fill="#0284c7"/>
        <text x="20" y="25" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">DM</text>
        <text x="48" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#0f172a">Dan Miles</text>
        <text x="125" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#64748b">&lt;dan@company.com&gt;</text>
        <text x="48" y="34" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#64748b">to legal@partnercorp.com • 10:42 AM (2 hours ago)</text>
      </g>

      <!-- Email Body Card with Cloaked Targets -->
      <g transform="translate(0, 110)">
        <rect width="1080" height="320" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
        
        <g transform="translate(30, 36)">
          <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#334155">Hi Team,</text>
          
          <text x="0" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#334155">We have officially executed the Master Services Agreement for</text>
          <!-- Cloaked Keyword 1 -->
          <g transform="translate(430, 20)">
            <rect width="130" height="24" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="1"/>
            <text x="10" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#0369a1">Acme Corporation</text>
          </g>

          <text x="0" y="78" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#334155">All cloud infrastructure and tenant domains associated with</text>
          <!-- Cloaked Keyword 2 -->
          <g transform="translate(415, 62)">
            <rect width="120" height="24" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="1"/>
            <text x="12" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#0369a1">acmecorp.com</text>
          </g>
          <text x="545" y="78" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#334155">have been provisioned under</text>
          
          <!-- Cloaked Keyword 3 -->
          <g transform="translate(745, 62)">
            <rect width="130" height="24" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="1"/>
            <text x="12" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#0369a1">InternalProject</text>
          </g>

          <text x="0" y="120" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#334155">Please ensure all deployment tokens remain strictly within the protected security perimeter.</text>

          <text x="0" y="165" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#334155">Best regards,</text>
          <text x="0" y="188" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">Dan Miles</text>
          <text x="0" y="206" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#64748b">Head of Engineering</text>
        </g>
      </g>
    </g>
  </g>
</svg>
`;
}

// -------------------------------------------------------------
// SCREENSHOT 5: 100% On-Device & Privacy Architecture (1280x800)
// -------------------------------------------------------------
function generateScreen5() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
  ${commonDefs}
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  
  <circle cx="640" cy="200" r="300" fill="#10b981" opacity="0.10" filter="url(#softGlow)"/>

  <!-- Top Marketing Banner -->
  <g transform="translate(60, 56)">
    <rect width="210" height="26" rx="13" fill="#064e3b" fill-opacity="0.3" stroke="#10b981" stroke-width="1.2"/>
    <text x="14" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="800" fill="#10b981" letter-spacing="0.5">ZERO TELEMETRY GUARANTEE</text>

    <text x="0" y="66" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="32" font-weight="800" fill="#ffffff">Strict Privacy by Architecture</text>
    <text x="0" y="96" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" fill="#94a3b8">BrandCloak operates 100% inside your local browser tab. No tracking, no data collection, no external servers.</text>
  </g>

  <!-- 3 Big Pillars -->
  <g transform="translate(60, 210)">
    <!-- Pillar 1 -->
    <g transform="translate(0, 0)" filter="url(#cardShadow)">
      <rect width="360" height="480" rx="16" fill="#0b1329" stroke="#38bdf8" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="28" fill="#0369a1" fill-opacity="0.2"/>
      <text x="38" y="58" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26">🛡️</text>
      
      <text x="30" y="120" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Zero External Requests</text>
      <text x="30" y="152" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#94a3b8" width="300">
        BrandCloak never establishes network connections to third-party servers. All regex evaluations, DOM transforms, and title cleaning execute purely in client RAM.
      </text>

      <rect x="30" y="390" width="300" height="50" rx="8" fill="#0f172a" stroke="#1e293b"/>
      <text x="45" y="420" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#38bdf8">✓ 0 Bytes Transmitted Off-Device</text>
    </g>

    <!-- Pillar 2 -->
    <g transform="translate(400, 0)" filter="url(#cardShadow)">
      <rect width="360" height="480" rx="16" fill="#0b1329" stroke="#10b981" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="28" fill="#064e3b" fill-opacity="0.2"/>
      <text x="38" y="58" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26">🔒</text>

      <text x="30" y="120" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Minimal Permissions</text>
      <text x="30" y="152" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#94a3b8">
        We request strictly the "storage" permission to remember your toggle choices. We do not request tabs history, cookies, or remote code access.
      </text>

      <rect x="30" y="390" width="300" height="50" rx="8" fill="#0f172a" stroke="#1e293b"/>
      <text x="45" y="420" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#10b981">✓ Manifest V3 Compliant</text>
    </g>

    <!-- Pillar 3 -->
    <g transform="translate(800, 0)" filter="url(#cardShadow)">
      <rect width="360" height="480" rx="16" fill="#0b1329" stroke="#f59e0b" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="28" fill="#78350f" fill-opacity="0.2"/>
      <text x="38" y="58" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26">⚡</text>

      <text x="30" y="120" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Zero-Flicker Injection</text>
      <text x="30" y="152" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#94a3b8">
        Styles inject at document_start to block corporate branding before elements are rendered to the screen, preventing any leakage to nearby onlookers.
      </text>

      <rect x="30" y="390" width="300" height="50" rx="8" fill="#0f172a" stroke="#1e293b"/>
      <text x="45" y="420" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#f59e0b">✓ Real-Time Mutation Observer</text>
    </g>
  </g>
</svg>
`;
}

// -------------------------------------------------------------
// SMALL PROMO TILE: 440 x 280 Canvas (24-bit no alpha)
// -------------------------------------------------------------
function generateSmallTile() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 280" width="440" height="280">
  ${commonDefs}
  <rect width="440" height="280" fill="url(#bgGrad)"/>
  
  <circle cx="220" cy="110" r="140" fill="#0284c7" opacity="0.22" filter="url(#softGlow)"/>

  <!-- Glowing Shield Centerpiece -->
  <g transform="translate(190, 36)">
    <circle cx="30" cy="30" r="38" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    ${getShieldSvg(18, 16, 2.0)}
  </g>

  <!-- Typography -->
  <g transform="translate(0, 150)">
    <text x="220" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="24" font-weight="800" fill="#ffffff" text-anchor="middle">BrandCloak</text>
    <text x="220" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#38bdf8" text-anchor="middle">Stealth Commuter Privacy</text>
    <text x="220" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Shield corporate identity on public transit &amp; flights</text>
  </g>

  <!-- Badges -->
  <g transform="translate(68, 232)">
    <rect width="140" height="24" rx="12" fill="#0f172a" stroke="#1e293b"/>
    <text x="70" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#f8fafc" text-anchor="middle">Google Workspace &amp; Jira</text>

    <rect x="155" y="0" width="145" height="24" rx="12" fill="#064e3b" stroke="#10b981"/>
    <text x="227" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#6ee7b7" text-anchor="middle">🔒 100% On-Device</text>
  </g>
</svg>
`;
}

// -------------------------------------------------------------
// MARQUEE PROMO TILE: 1400 x 560 Canvas (24-bit no alpha)
// -------------------------------------------------------------
function generateMarqueeTile() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 560" width="1400" height="560">
  ${commonDefs}
  <rect width="1400" height="560" fill="url(#bgGrad)"/>
  
  <circle cx="280" cy="280" r="300" fill="#0284c7" opacity="0.18" filter="url(#softGlow)"/>
  <circle cx="1100" cy="280" r="320" fill="#10b981" opacity="0.12" filter="url(#softGlow)"/>

  <!-- Left Column: Branding & Value Proposition -->
  <g transform="translate(100, 100)">
    <!-- Pill Badge -->
    <rect width="210" height="28" rx="14" fill="#0369a1" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.2"/>
    <text x="14" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="800" fill="#38bdf8" letter-spacing="0.5">CHROME PRIVACY EXTENSION</text>

    <!-- Master Title with Logo -->
    <g transform="translate(0, 52)">
      ${getShieldSvg(0, 0, 3.2)}
      <text x="96" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="52" font-weight="900" fill="#ffffff" letter-spacing="-1">BrandCloak</text>
      <text x="96" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="22" font-weight="700" fill="#38bdf8">Stealth Commuter Privacy for Enterprise SaaS</text>
    </g>

    <!-- Subtitle & Value Proposition -->
    <text x="0" y="185" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" fill="#94a3b8" width="500">
      Shield sensitive corporate logos, client names, and organization badges from shoulder-surfers when working on commuter trains, flights, and public spaces.
    </text>

    <!-- Feature Pills -->
    <g transform="translate(0, 250)">
      <rect width="180" height="34" rx="17" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2"/>
      <text x="90" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">🛡️ Google &amp; Jira Stealth</text>

      <rect x="195" y="0" width="160" height="34" rx="17" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
      <text x="275" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#6ee7b7" text-anchor="middle">🔒 100% On-Device</text>

      <rect x="370" y="0" width="140" height="34" rx="17" fill="#0f172a" stroke="#1e293b"/>
      <text x="440" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">⚡ Alt + Shift + S</text>
    </g>
  </g>

  <!-- Right Column: Visual Perspective Demonstration -->
  <g transform="translate(760, 70)" filter="url(#cardShadow)">
    <!-- Browser Mockup Card 1: Gmail Cloak -->
    <g transform="translate(0, 30)">
      <rect width="520" height="200" rx="12" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
      <path d="M 0 12 A 12 12 0 0 1 12 0 L 508 0 A 12 12 0 0 1 520 12 L 520 34 L 0 34 Z" fill="#0f172a"/>
      <circle cx="16" cy="17" r="4.5" fill="#ef4444"/>
      <circle cx="30" cy="17" r="4.5" fill="#f59e0b"/>
      <circle cx="44" cy="17" r="4.5" fill="#10b981"/>
      <text x="64" y="21" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#10b981" font-weight="bold">Inbox (3) - Gmail [Sanitized]</text>

      <!-- Content -->
      <g transform="translate(16, 50)">
        <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="16" font-weight="bold" fill="#ea4335">Gmail</text>
        
        <!-- Cloaked Header Brand -->
        <g transform="translate(340, 0)">
          <rect width="140" height="30" rx="15" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.2"/>
          <text x="18" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#0284c7">🛡️ Workspace</text>
          <rect x="95" y="6" width="35" height="18" rx="4" fill="#10b981" fill-opacity="0.15"/>
          <text x="99" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="8" font-weight="800" fill="#059669">STOCK</text>
        </g>
      </g>

      <!-- Row with Cloaked Items -->
      <g transform="translate(16, 105)">
        <rect width="488" height="42" rx="6" fill="#f8fafc"/>
        <text x="12" y="25" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">Payroll Advisory</text>
        <text x="110" y="25" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#475569">Remuneration notice for </text>
        <rect x="245" y="12" width="105" height="20" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="0.8"/>
        <text x="252" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="700" fill="#0369a1">Acme Corporation</text>
        <text x="440" y="25" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#94a3b8">08:45 AM</text>
      </g>
    </g>

    <!-- Browser Mockup Card 2: Jira Board (Overlapping) -->
    <g transform="translate(50, 190)" filter="url(#cardShadow)">
      <rect width="520" height="200" rx="12" fill="#ffffff" stroke="#38bdf8" stroke-width="1.8"/>
      <path d="M 0 12 A 12 12 0 0 1 12 0 L 508 0 A 12 12 0 0 1 520 12 L 520 34 L 0 34 Z" fill="#0f172a"/>
      <circle cx="16" cy="17" r="4.5" fill="#ef4444"/>
      <circle cx="30" cy="17" r="4.5" fill="#f59e0b"/>
      <circle cx="44" cy="17" r="4.5" fill="#10b981"/>
      <text x="64" y="21" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#10b981" font-weight="bold">[PAY-4029] Encrypt headers - Jira</text>

      <!-- Jira Header -->
      <g transform="translate(0, 34)">
        <rect width="520" height="38" fill="#0c66e4"/>
        <text x="16" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Jira</text>
        <rect x="56" y="8" width="140" height="22" rx="4" fill="#ffffff" fill-opacity="0.2"/>
        <text x="66" y="23" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="700" fill="#ffffff">🛡️ SITE TITLE MASKED</text>
      </g>

      <!-- Kanban Tickets -->
      <g transform="translate(16, 90)">
        <rect width="230" height="85" rx="6" fill="#f1f5f9"/>
        <text x="12" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">API Gateway Tokens</text>
        <rect x="12" y="32" width="95" height="18" rx="3" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="0.8"/>
        <text x="16" y="45" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="700" fill="#0369a1">Client Enterprise</text>
        <text x="12" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="bold" fill="#0284c7">PAY-4030</text>
      </g>

      <g transform="translate(260, 90)">
        <rect width="230" height="85" rx="6" fill="#f1f5f9"/>
        <text x="12" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">Zero-Flicker Style Engine</text>
        <text x="12" y="44" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#475569">Document start injection</text>
        <text x="12" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="bold" fill="#10b981">DONE</text>
      </g>
    </g>
  </g>
</svg>
`;
}

// -------------------------------------------------------------
// EXECUTE GENERATION OF ALL 7 STORE ASSETS
// -------------------------------------------------------------
console.log('🚀 Generating Chrome Web Store Assets (24-bit PNG, NO alpha)...');

renderPngWithoutAlpha(generateScreen1(), path.join(SCREENSHOTS_DIR, 'screen1-google-cloak.png'), 1280, 800);
renderPngWithoutAlpha(generateScreen2(), path.join(SCREENSHOTS_DIR, 'screen2-jira-cloak.png'), 1280, 800);
renderPngWithoutAlpha(generateScreen3(), path.join(SCREENSHOTS_DIR, 'screen3-popup-settings.png'), 1280, 800);
renderPngWithoutAlpha(generateScreen4(), path.join(SCREENSHOTS_DIR, 'screen4-brand-keywords.png'), 1280, 800);
renderPngWithoutAlpha(generateScreen5(), path.join(SCREENSHOTS_DIR, 'screen5-privacy-guarantee.png'), 1280, 800);
renderPngWithoutAlpha(generateSmallTile(), path.join(PROMO_DIR, 'tile-440x280.png'), 440, 280);
renderPngWithoutAlpha(generateMarqueeTile(), path.join(PROMO_DIR, 'marquee-1400x560.png'), 1400, 560);

try {
  fs.rmdirSync(TEMP_DIR, { recursive: true });
} catch (e) {}

console.log('🎉 All Chrome Web Store assets generated successfully!');
