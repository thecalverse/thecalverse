const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const baseOutDir = path.join(process.env.HOME, 'Desktop/Calverse_Core_4_Posters');
const formats = ['Square_1080x1080', 'Portrait_1080x1350'];
for (const fmt of formats) {
  fs.mkdirSync(path.join(baseOutDir, fmt), { recursive: true });
}

const artifactDir = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed';

const posters = [
  {
    id: 'calculator',
    filename: '01_Calculator.png',
    title: 'CALCULATOR',
    accent: '#dfbe95'
  },
  {
    id: 'timer',
    filename: '02_Timer.png',
    title: 'TIMER',
    accent: '#cda270'
  },
  {
    id: 'journal',
    filename: '03_Journal.png',
    title: 'JOURNAL',
    accent: '#dfbe95'
  },
  {
    id: 'habit_tracker',
    filename: '04_Habit_Tracker.png',
    title: 'HABIT TRACKER',
    accent: '#cda270'
  }
];

function generateHtml(item, width, height) {
  const isSquare = width === height;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400;1,600;1,700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  width: ${width}px;
  height: ${height}px;
  background-color: #070708;
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(223, 190, 149, 0.10) 0%, transparent 65%),
    radial-gradient(circle at 50% 15%, rgba(35, 38, 48, 0.5) 0%, transparent 45%),
    linear-gradient(180deg, #0b0c10 0%, #070708 50%, #050506 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: ${isSquare ? '55px 70px' : '90px 75px'};
}

/* ========================================================
   ORNATE VINTAGE GOLD FRAME (Exact same border)
   ======================================================== */
.frame-container {
  position: absolute;
  inset: ${isSquare ? '36px' : '48px'};
  pointer-events: none;
  z-index: 2;
}

/* Outer gilded gradient border */
.frame-outer {
  position: absolute;
  inset: 0;
  border: 1.5px solid transparent;
  border-image: linear-gradient(135deg, #f5e6d3 0%, #dfbe95 25%, #8c6a40 50%, #dfbe95 75%, #f5e6d3 100%) 1;
  box-shadow: inset 0 0 40px rgba(223, 190, 149, 0.04), 0 0 25px rgba(223, 190, 149, 0.06);
}

/* Inner hairline border */
.frame-inner {
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(223, 190, 149, 0.24);
}

/* Layered L-Corners */
.corner {
  position: absolute;
  width: 38px;
  height: 38px;
  border-color: #dfbe95;
  border-style: solid;
  pointer-events: none;
}
.corner-tl { top: -2px; left: -2px; border-width: 3.5px 0 0 3.5px; }
.corner-tr { top: -2px; right: -2px; border-width: 3.5px 3.5px 0 0; }
.corner-bl { bottom: -2px; left: -2px; border-width: 0 0 3.5px 3.5px; }
.corner-br { bottom: -2px; right: -2px; border-width: 0 3.5px 3.5px 0; }

/* Inset Corner Diamonds */
.corner-flourish {
  position: absolute;
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  font-size: 13px;
  color: #dfbe95;
  text-shadow: 0 0 10px rgba(223, 190, 149, 0.85);
}
.flourish-tl { top: 16px; left: 16px; }
.flourish-tr { top: 16px; right: 16px; }
.flourish-bl { bottom: 16px; left: 16px; }
.flourish-br { bottom: 16px; right: 16px; }

/* Cardinal Stars (Top & Bottom Center) */
.cardinal-mark {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #070708;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #dfbe95;
}
.cardinal-top { top: -10px; }
.cardinal-bottom { bottom: -10px; }
.cardinal-line {
  width: 32px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #dfbe95, transparent);
}

/* ========================================================
   TOPBAR: SAME CALVERSE ON TOP
   ======================================================== */
.topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  margin-top: ${isSquare ? '8px' : '12px'};
}

.brand-name {
  font-family: 'Cinzel', 'Playfair Display', -apple-system-ui-serif, Georgia, serif;
  font-size: ${isSquare ? '26px' : '28px'};
  font-weight: 700;
  letter-spacing: 8.5px;
  text-transform: uppercase;
  color: #ffffff;
  text-align: center;
  line-height: 1;
  text-shadow: 0 0 24px rgba(255, 255, 255, 0.22), 0 2px 10px rgba(0,0,0,0.8);
}

/* ========================================================
   CENTER: TITLE IN MIDDLE
   ======================================================== */
.center-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 920px;
  position: relative;
  z-index: 10;
  padding: 0 20px;
}

.center-title {
  font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
  font-size: ${item.title === 'HABIT TRACKER' ? (isSquare ? '62px' : '70px') : (isSquare ? '74px' : '84px')};
  font-weight: 800;
  letter-spacing: ${item.title === 'HABIT TRACKER' ? '8px' : '12px'};
  text-transform: uppercase;
  color: #ffffff;
  line-height: 1.15;
  text-align: center;
  text-shadow: 0 0 35px rgba(223, 190, 149, 0.35), 0 4px 20px rgba(0, 0, 0, 0.9);
}

.center-flourish {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: ${isSquare ? '24px' : '30px'};
  color: #dfbe95;
  font-size: 15px;
}

.flourish-line {
  width: 70px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #dfbe95, transparent);
}

.bottom-spacer {
  height: ${isSquare ? '16px' : '20px'};
  visibility: hidden;
}
</style>
</head>
<body>
  <div class="frame-container">
    <div class="frame-outer"></div>
    <div class="frame-inner"></div>

    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="corner-flourish flourish-tl">❖</div>
    <div class="corner-flourish flourish-tr">❖</div>
    <div class="corner-flourish flourish-bl">❖</div>
    <div class="corner-flourish flourish-br">❖</div>

    <div class="cardinal-mark cardinal-top">
      <div class="cardinal-line"></div>
      <div>✦</div>
      <div class="cardinal-line"></div>
    </div>
    <div class="cardinal-mark cardinal-bottom">
      <div class="cardinal-line"></div>
      <div>✦</div>
      <div class="cardinal-line"></div>
    </div>
  </div>

  <div class="topbar">
    <div class="brand-name">CALVERSE</div>
  </div>

  <div class="center-container">
    <h1 class="center-title">${item.title}</h1>
    <div class="center-flourish">
      <div class="flourish-line"></div>
      <div>✦</div>
      <div class="flourish-line"></div>
    </div>
  </div>

  <div class="bottom-spacer"></div>
</body>
</html>`;
}

async function run() {
  console.log('Generating 4 core minimal posters (Calculator, Timer, Journal, Habit Tracker)...');

  const chromePort = 9390;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_core4_profile'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const tabRes = await fetch(`http://127.0.0.1:${chromePort}/json/new?about:blank`, { method: 'PUT' });
    const tab = await tabRes.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 100000);
      const handler = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === id) {
          ws.removeEventListener('message', handler);
          if (m.error) reject(new Error(JSON.stringify(m.error)));
          else resolve(m.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    ws.addEventListener('open', async () => {
      console.log('Connected to CDP');
      await send('Page.enable');

      for (const fmt of formats) {
        const isSquare = fmt.includes('1080x1080');
        const width = 1080;
        const height = isSquare ? 1080 : 1350;

        console.log(`\nRendering ${fmt}...`);
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });

        for (const item of posters) {
          const html = generateHtml(item, width, height);
          await send('Page.navigate', { url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}` });
          await new Promise(r => setTimeout(r, 600));

          const screenshot = await send('Page.captureScreenshot', { format: 'png' });
          const buffer = Buffer.from(screenshot.data, 'base64');

          // Save to Desktop
          const outPath = path.join(baseOutDir, fmt, item.filename);
          fs.writeFileSync(outPath, buffer);
          console.log(`Saved: ${outPath}`);

          // Also copy to artifacts directory for inline display
          const artifactName = `core4_${isSquare ? 'sq' : 'pt'}_${item.id}.png`;
          const artifactPath = path.join(artifactDir, artifactName);
          fs.writeFileSync(artifactPath, buffer);
        }
      }

      console.log('\nAll 4 Core Minimal Posters generated successfully in both Square and Portrait!');
      ws.close();
      chrome.kill();
      process.exit(0);
    });

  } catch (err) {
    console.error('Error generating posters:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
