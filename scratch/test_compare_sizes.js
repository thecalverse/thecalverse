const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function getHtml(width, height) {
  const isSquare = width === height;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400;1,600;1,700&family=Caveat:wght@600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  width: ${width}px;
  height: ${height}px;
  background-color: #070708;
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(223, 190, 149, 0.08) 0%, transparent 68%),
    radial-gradient(circle at 50% 12%, rgba(35, 38, 48, 0.5) 0%, transparent 45%),
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
   ORNATE VINTAGE GOLD FRAME
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
   TOPBAR & CONTENT
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

.center-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 860px;
  position: relative;
  z-index: 10;
  padding: 0 20px;
}

.center-question {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: ${isSquare ? '52px' : '60px'};
  font-weight: 800;
  color: #ffffff;
  line-height: 1.18;
  letter-spacing: -0.5px;
  margin-bottom: ${isSquare ? '22px' : '30px'};
  text-shadow: 0 4px 24px rgba(0,0,0,0.8);
}

.decorative-divider {
  width: 90px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #dfbe95, transparent);
  margin-bottom: ${isSquare ? '24px' : '32px'};
}

.center-body {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: ${isSquare ? '27px' : '31px'};
  line-height: 1.54;
  color: rgba(240, 235, 225, 0.9);
  font-weight: 400;
  margin-bottom: ${isSquare ? '28px' : '36px'};
  text-shadow: 0 2px 16px rgba(0,0,0,0.7);
}

.center-punchline {
  font-family: 'Cinzel', serif;
  font-size: ${isSquare ? '14px' : '15px'};
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #dfbe95;
  padding: ${isSquare ? '10px 24px' : '12px 28px'};
  border-radius: 30px;
  background: rgba(223, 190, 149, 0.08);
  border: 1px solid rgba(223, 190, 149, 0.3);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
}

.bottom-spacer {
  height: 8px;
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
    <h1 class="center-question">Why not just ask an AI?</h1>
    <div class="decorative-divider"></div>
    <p class="center-body">Because an AI will write you a 4-paragraph philosophical essay, hallucinate that 7 &times; 8 = 54, hit your daily message limit, and still get the wrong answer on your homework.</p>
    <div class="center-punchline">Plug the values. Get the truth.</div>
  </div>

  <div class="bottom-spacer"></div>
</body>
</html>`;
}

fs.writeFileSync('/tmp/test_square.html', getHtml(1080, 1080));
fs.writeFileSync('/tmp/test_portrait.html', getHtml(1080, 1350));

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new',
  '--remote-debugging-port=9380',
  '--no-first-run',
  '--disable-gpu',
  '--user-data-dir=/tmp/chrome_test_compare'
]);

setTimeout(async () => {
  try {
    const tabRes = await fetch('http://127.0.0.1:9380/json/new?about:blank', { method: 'PUT' });
    const tab = await tabRes.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    const send = (method, params = {}) => new Promise((resolve) => {
      const id = Math.floor(Math.random() * 100000);
      const handler = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === id) {
          ws.removeEventListener('message', handler);
          resolve(m.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    ws.addEventListener('open', async () => {
      await send('Page.enable');
      
      // Render Square 1080x1080
      await send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1080, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: 'file:///tmp/test_square.html' });
      await new Promise(r => setTimeout(r, 400));
      const s1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed/test_sample_square.png', Buffer.from(s1.data, 'base64'));

      // Render Portrait 1080x1350
      await send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: 'file:///tmp/test_portrait.html' });
      await new Promise(r => setTimeout(r, 400));
      const s2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed/test_sample_portrait.png', Buffer.from(s2.data, 'base64'));

      console.log('Comparison samples saved!');
      chrome.kill();
      process.exit(0);
    });
  } catch(e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 1200);
