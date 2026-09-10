const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRAMES_DIR = path.join(__dirname, 'frames');
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

// 75 frames @ 15fps = 5.0 seconds
const TOTAL_FRAMES = 75;

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function getFrameState(frameIndex) {
  if (frameIndex <= 18) {
    return { blur: 0, active: false, togglePos: 0, calloutOpacity: 0 };
  } else if (frameIndex <= 30) {
    const progress = easeInOutQuad((frameIndex - 18) / 12);
    return { blur: progress * 8, active: progress > 0.5, togglePos: progress, calloutOpacity: progress };
  } else if (frameIndex <= 62) {
    return { blur: 8, active: true, togglePos: 1, calloutOpacity: 1 };
  } else {
    const progress = easeInOutQuad((frameIndex - 62) / 12);
    return { blur: (1 - progress) * 8, active: progress < 0.5, togglePos: 1 - progress, calloutOpacity: 1 - progress };
  }
}

function generateSvg(frameIndex) {
  const { blur, active, togglePos, calloutOpacity } = getFrameState(frameIndex);

  const toggleKnobX = 14 + togglePos * 24;
  const toggleBg = active ? '#0284c7' : '#334155';
  const statusColor = active ? '#10b981' : '#64748b';
  const statusBg = active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)';
  const statusText = active ? 'ACTIVE' : 'PAUSED';

  const blurFilter = blur > 0.1 ? `filter="url(#blurEffect)"` : '';
  const frostedOverlay = blur > 0.1 ? `opacity="${Math.min(0.95, blur / 8)}"` : `opacity="0"`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 500" width="880" height="500">
  <defs>
    <filter id="blurEffect" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${blur.toFixed(2)}" />
    </filter>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1329"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="frostedGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.25"/>
    </linearGradient>
  </defs>

  <rect width="880" height="500" fill="#070b14"/>

  <!-- macOS Window Frame -->
  <g transform="translate(20, 20)">
    <!-- Window Base -->
    <rect width="840" height="460" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>

    <!-- Window Titlebar -->
    <path d="M 0 12 A 12 12 0 0 1 12 0 L 828 0 A 12 12 0 0 1 840 12 L 840 42 L 0 42 Z" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <!-- Window Controls -->
    <circle cx="20" cy="21" r="5.5" fill="#ef4444"/>
    <circle cx="38" cy="21" r="5.5" fill="#f59e0b"/>
    <circle cx="56" cy="21" r="5.5" fill="#10b981"/>

    <!-- Window Tab Title -->
    <g transform="translate(85, 10)">
      <rect width="260" height="24" rx="6" fill="#ffffff" stroke="#e2e8f0"/>
      <!-- Tab Icon (SVG Gmail envelope) -->
      <g transform="translate(10, 6)">
        <rect width="14" height="10" rx="1.5" fill="#ea4335" fill-opacity="0.15" stroke="#ea4335" stroke-width="1"/>
        <path d="M0 1l7 5 7-5" stroke="#ea4335" stroke-width="1" fill="none"/>
      </g>
      <text x="32" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#475569" font-weight="500">
        ${active ? 'Inbox (3) - Gmail' : 'Inbox (3) - dan@code.com.au - Gmail'}
      </text>
    </g>

    <!-- Gmail App Header -->
    <g transform="translate(0, 42)">
      <rect width="840" height="54" fill="#ffffff"/>
      <line x1="0" y1="54" x2="840" y2="54" stroke="#e2e8f0" stroke-width="1"/>

      <!-- Hamburger & Logo -->
      <g transform="translate(20, 16)">
        <path d="M0 4h18M0 11h18M0 18h18" stroke="#5f6368" stroke-width="2" stroke-linecap="round"/>
        <g transform="translate(36, -2)">
          <path d="M0 3h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H0c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z" fill="#ea4335" fill-opacity="0.1"/>
          <path d="M-2 4l10 7 10-7" stroke="#ea4335" stroke-width="2" fill="none"/>
          <text x="24" y="16" font-family="-apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="18" fill="#5f6368" font-weight="500">Gmail</text>
        </g>
      </g>

      <!-- Mock Search Bar -->
      <g transform="translate(180, 8)">
        <rect width="360" height="38" rx="20" fill="#edf2f7"/>
        <circle cx="20" cy="19" r="6" stroke="#64748b" stroke-width="1.8" fill="none"/>
        <line x1="24.5" y1="23.5" x2="30" y2="29" stroke="#64748b" stroke-width="1.8" stroke-linecap="round"/>
        <text x="42" y="24" font-family="-apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="13" fill="#64748b">Search in mail</text>
      </g>

      <!-- TOP RIGHT: Nominated Corporate Brand Pill -->
      <g transform="translate(645, 10)">
        <rect width="120" height="34" rx="17" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
        
        <!-- Corporate Logo (Nominated Target Region 1) -->
        <g ${blurFilter}>
          <text x="26" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="800" fill="#0284c7">⚡ CODE</text>
        </g>

        <!-- Frosted Glass Overlay Badge on Pill -->
        <g ${frostedOverlay}>
          <rect x="0" y="0" width="120" height="34" rx="17" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.8"/>
          <text x="34" y="21" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" font-weight="700" fill="#0369a1">CLOAKED</text>
        </g>
      </g>

      <!-- User Avatar -->
      <circle cx="800" cy="27" r="15" fill="#0284c7"/>
      <text x="800" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">DM</text>
    </g>

    <!-- Main Content Area: Sidebar + Email List -->
    <g transform="translate(0, 96)">
      <!-- Sidebar -->
      <rect width="160" height="364" fill="#f8fafc"/>
      <line x1="160" y1="0" x2="160" y2="364" stroke="#e2e8f0" stroke-width="1"/>
      
      <g transform="translate(16, 20)">
        <rect width="128" height="32" rx="16" fill="#dbeafe"/>
        <text x="36" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#1e40af">Inbox (3)</text>
      </g>
      <g transform="translate(16, 62)">
        <text x="36" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="500" fill="#64748b">Starred</text>
      </g>
      <g transform="translate(16, 96)">
        <text x="36" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="500" fill="#64748b">Sent</text>
      </g>

      <!-- Email List Rows -->
      <g transform="translate(160, 0)">
        <!-- Email Row 1 -->
        <g transform="translate(0, 0)">
          <rect width="680" height="52" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
          <text x="24" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#0f172a">donotreply</text>
          
          <text x="130" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="500" fill="#334155">
            D-U-N-S Notice - Sent to 
          </text>
          
          <!-- Nominated Region 2: dan@code.com.au -->
          <g transform="translate(268, 16)">
            <g ${blurFilter}>
              <text x="0" y="15" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#0f172a">dan@code.com.au</text>
            </g>
            <g ${frostedOverlay}>
              <rect x="-4" y="0" width="120" height="20" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="1"/>
            </g>
          </g>

          <text x="402" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="400" fill="#64748b">
            - Please verify your profile...
          </text>
          <text x="630" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94a3b8">08:24 AM</text>
        </g>

        <!-- Email Row 2 -->
        <g transform="translate(0, 52)">
          <rect width="680" height="52" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
          <text x="24" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#0f172a">Finances</text>
          
          <text x="130" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="500" fill="#334155">
            Instalment Activity Statement - PROMOSYS / 
          </text>

          <!-- Nominated Region 3: Code Corp -->
          <g transform="translate(378, 16)">
            <g ${blurFilter}>
              <text x="0" y="15" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Code Corp</text>
            </g>
            <g ${frostedOverlay}>
              <rect x="-4" y="0" width="76" height="20" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="1"/>
            </g>
          </g>

          <text x="458" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="400" fill="#64748b">
            - Document to Sign...
          </text>
          <text x="630" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94a3b8">Yesterday</text>
        </g>

        <!-- Email Row 3 -->
        <g transform="translate(0, 104)">
          <rect width="680" height="52" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
          <text x="24" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#0f172a">Cloudflare</text>
          
          <text x="130" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="500" fill="#334155">
            Weekly analytics report for 
          </text>

          <!-- Nominated Region 4: code.com.au -->
          <g transform="translate(294, 16)">
            <g ${blurFilter}>
              <text x="0" y="15" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#0f172a">code.com.au</text>
            </g>
            <g ${frostedOverlay}>
              <rect x="-4" y="0" width="84" height="20" rx="4" fill="url(#frostedGlass)" stroke="#38bdf8" stroke-width="1"/>
            </g>
          </g>

          <text x="350" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="400" fill="#64748b">
            - 14,200 requests processed
          </text>
          <text x="630" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94a3b8">9 Sept</text>
        </g>
      </g>
    </g>

    <!-- FLOATING BRANDCLOAK EXTENSION HUD (Bottom-Right) -->
    <g transform="translate(540, 290)">
      <rect width="280" height="150" rx="14" fill="url(#cardGrad)" stroke="#38bdf8" stroke-width="1.4" filter="drop-shadow(0 10px 25px rgba(0,0,0,0.6))"/>

      <!-- Header with BrandCloak Icon & Title -->
      <g transform="translate(16, 16)">
        <path d="M10 2L3 5v5c0 4.6 3.2 8.9 7 10 3.8-1.1 7-5.4 7-10V5l-7-3z" fill="none" stroke="url(#brandGrad)" stroke-width="1.8"/>
        <line x1="7" y1="9" x2="13" y2="9" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="8" y1="12" x2="12" y2="12" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round"/>

        <text x="24" y="12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="800" fill="#ffffff">BrandCloak</text>
        <text x="24" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#94a3b8">Commuter Privacy</text>
      </g>

      <!-- Status Indicator Pill -->
      <g transform="translate(180, 16)">
        <rect width="84" height="22" rx="11" fill="${statusBg}" stroke="${statusColor}" stroke-width="1.2"/>
        <circle cx="14" cy="11" r="3.5" fill="${statusColor}"/>
        <text x="24" y="14.5" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="700" fill="${statusColor}">
          ${statusText}
        </text>
      </g>

      <!-- Master Stealth Switch -->
      <g transform="translate(16, 56)">
        <text x="0" y="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#f8fafc">Stealth Mode</text>
        <text x="0" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#94a3b8">Shield corporate identity in public</text>
        
        <!-- Toggle Track & Knob -->
        <g transform="translate(194, 0)">
          <rect width="52" height="28" rx="14" fill="${toggleBg}"/>
          <circle cx="${toggleKnobX}" cy="14" r="10" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
        </g>
      </g>

      <!-- Mode & Hotkey info -->
      <g transform="translate(16, 108)">
        <rect width="248" height="26" rx="6" fill="#070b14" stroke="#334155" stroke-width="1"/>
        <text x="10" y="17" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="600" fill="#38bdf8">Style: Frosted Blur</text>
        <text x="180" y="17" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#94a3b8">Alt+Shift+S</text>
      </g>
    </g>

    <!-- CALLOUT BADGES (Fade in when Active) -->
    <g opacity="${calloutOpacity}">
      <!-- Callout for Header Pill -->
      <g transform="translate(635, 52)">
        <polygon points="65,0 73,8 57,8" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
        <rect x="0" y="8" width="130" height="22" rx="5" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
        <text x="8" y="23" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#6ee7b7">🛡️ Header Obscured</text>
      </g>

      <!-- Callout for Email Body -->
      <g transform="translate(245, 192)">
        <polygon points="85,0 93,-8 77,-8" fill="#0b1329" stroke="#38bdf8" stroke-width="1"/>
        <rect x="0" y="0" width="170" height="22" rx="5" fill="#0b1329" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="10" y="15" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#38bdf8">🛡️ Custom Brands Obscured</text>
      </g>
    </g>
  </g>
</svg>
`;
}

console.log('Generating frames...');
for (let i = 0; i < TOTAL_FRAMES; i++) {
  const svg = generateSvg(i);
  const svgPath = path.join(FRAMES_DIR, `frame_${String(i).padStart(3, '0')}.svg`);
  const pngPath = path.join(FRAMES_DIR, `frame_${String(i).padStart(3, '0')}.png`);
  fs.writeFileSync(svgPath, svg, 'utf8');
  execSync(`rsvg-convert -w 880 -h 500 "${svgPath}" -o "${pngPath}"`);
}

console.log('Assembling GIF with ffmpeg...');
const outputGif = path.join(__dirname, '..', 'assets', 'demo.gif');
const scratchGif = path.join(__dirname, 'brandcloak-demo.gif');
execSync(`ffmpeg -y -framerate 15 -i "${FRAMES_DIR}/frame_%03d.png" -vf "split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3" "${outputGif}"`);
fs.copyFileSync(outputGif, scratchGif);

console.log('✅ Generated GIF at:', outputGif);
const stat = fs.statSync(outputGif);
console.log('GIF Size:', (stat.size / 1024).toFixed(1), 'KB');
