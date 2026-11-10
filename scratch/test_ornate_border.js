const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Test ornate border HTML
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400;1,600;1,700&family=Caveat:wght@600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  width: 1080px;
  height: 1350px;
  background-color: #070708;
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(223, 190, 149, 0.06) 0%, transparent 65%),
    radial-gradient(circle at 50% 15%, rgba(35, 38, 46, 0.5) 0%, transparent 45%),
    linear-gradient(180deg, #0b0c10 0%, #070708 50%, #050506 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  /* SAFE ZONE: top & bottom padding >= 150px so 1080x1080 square crop cuts NOTHING */
  padding: 160px 85px;
}

/* ========================================================
   ORNATE VINTAGE ACADEMIA FRAME
   ======================================================== */
.frame-container {
  position: absolute;
  /* Placed safely inside the 1080x1080 Instagram square safe zone (135px to 1215px) */
  top: 70px;
  bottom: 70px;
  left: 55px;
  right: 55px;
  pointer-events: none;
  z-index: 2;
}

/* Outer gilded border */
.frame-outer {
  position: absolute;
  inset: 0;
  border: 1.5px solid transparent;
  border-image: linear-gradient(135deg, #dfbe95 0%, #8c6a40 25%, #dfbe95 50%, #8c6a40 75%, #dfbe95 100%) 1;
  box-shadow: inset 0 0 30px rgba(223, 190, 149, 0.03), 0 0 20px rgba(223, 190, 149, 0.05);
}

/* Inner hairline border */
.frame-inner {
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(223, 190, 149, 0.22);
}

/* Ornate Corner Elements */
.corner {
  position: absolute;
  width: 32px;
  height: 32px;
  border-color: #dfbe95;
  border-style: solid;
  pointer-events: none;
}
.corner-tl { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
.corner-tr { top: -2px; right: -2px; border-width: 3px 3px 0 0; }
.corner-bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; }
.corner-br { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }

/* Inset Corner Diamonds */
.corner-flourish {
  position: absolute;
  width: 14px;
  height: 14px;
  display: grid;
  place-items: center;
  font-size: 11px;
  color: #dfbe95;
  text-shadow: 0 0 8px rgba(223, 190, 149, 0.8);
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
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #dfbe95;
  letter-spacing: 2px;
}
.cardinal-top { top: -9px; }
.cardinal-bottom { bottom: -9px; }
.cardinal-line {
  width: 24px;
  height: 1px;
  background: #dfbe95;
  opacity: 0.6;
}

/* ========================================================
   CONTENT STYLING (SAFE INSIDE 1080x1080)
   ======================================================== */
.topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  margin-top: 10px;
}
.brand-name {
  font-family: 'Cinzel', 'Playfair Display', -apple-system-ui-serif, Georgia, serif;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 9px;
  text-transform: uppercase;
  color: #ffffff;
  text-align: center;
  line-height: 1;
  text-shadow: 0 0 24px rgba(255, 255, 255, 0.2), 0 2px 8px rgba(0,0,0,0.8);
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
  padding: 0 15px;
}

.center-question {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 58px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.18;
  letter-spacing: -0.5px;
  margin-bottom: 30px;
  text-shadow: 0 4px 24px rgba(0,0,0,0.8);
}

.decorative-divider {
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #dfbe95, transparent);
  margin-bottom: 32px;
}

.center-body {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 30px;
  line-height: 1.54;
  color: rgba(240, 235, 225, 0.9);
  font-weight: 400;
  margin-bottom: 38px;
  text-shadow: 0 2px 16px rgba(0,0,0,0.7);
}

.center-punchline {
  font-family: 'Cinzel', serif;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #dfbe95;
  padding: 12px 28px;
  border-radius: 30px;
  background: rgba(223, 190, 149, 0.08);
  border: 1px solid rgba(223, 190, 149, 0.32);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
}

.bottom-spacer {
  height: 10px;
  visibility: hidden;
}
</style>
</head>
<body>
  <!-- Ornate Vintage Academia Frame -->
  <div class="frame-container">
    <div class="frame-outer"></div>
    <div class="frame-inner"></div>

    <!-- Corners -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <!-- Inset Corner Diamonds -->
    <div class="corner-flourish flourish-tl">❖</div>
    <div class="corner-flourish flourish-tr">❖</div>
    <div class="corner-flourish flourish-bl">❖</div>
    <div class="corner-flourish flourish-br">❖</div>

    <!-- Top & Bottom Crests -->
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

  <!-- Topbar: Calverse in exact app font -->
  <div class="topbar">
    <div class="brand-name">CALVERSE</div>
  </div>

  <!-- Middle: Witty text -->
  <div class="center-container">
    <h1 class="center-question">Why not just ask an AI?</h1>
    <div class="decorative-divider"></div>
    <p class="center-body">Because an AI will write you a 4-paragraph philosophical essay, hallucinate that 7 &times; 8 = 54, hit your daily message limit, and still get the wrong answer on your homework.</p>
    <div class="center-punchline">Plug the values. Get the truth.</div>
  </div>

  <div class="bottom-spacer"></div>
</body>
</html>`;

fs.writeFileSync('/tmp/test_ornate.html', html);

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new',
  '--remote-debugging-port=9375',
  '--no-first-run',
  '--disable-gpu',
  '--user-data-dir=/tmp/chrome_test_ornate'
]);

setTimeout(async () => {
  try {
    const tabRes = await fetch('http://127.0.0.1:9375/json/new?file:///tmp/test_ornate.html', { method: 'PUT' });
    const tab = await tabRes.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    const send = (method, params = {}) => new Promise((resolve, reject) => {
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
      await send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
      await new Promise(r => setTimeout(r, 400));
      const s = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed/test_ornate_border.png', Buffer.from(s.data, 'base64'));
      console.log('Saved test_ornate_border.png');
      chrome.kill();
      process.exit(0);
    });
  } catch(e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 1200);
