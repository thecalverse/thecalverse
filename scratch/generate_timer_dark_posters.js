const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const outDir = path.join(process.env.HOME, 'Desktop/Calverse_Timer_Dark_Posters');
fs.mkdirSync(outDir, { recursive: true });

const artifactDir = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed';

const postersData = [
  {
    id: '01_the_5_minute_break',
    label: 'The 5-Minute Break Trap',
    question: 'Why do we need a timer?',
    body: 'Because a "5-minute break" without a timer will somehow turn into 3 hours of cleaning your room, researching the fall of the Roman Empire, and learning how to make sourdough.',
    punchline: 'Set the 25 minutes. Sit down.',
    accent: '#dfbe95'
  },
  {
    id: '02_the_textbook_stare',
    label: 'The Textbook Stare',
    question: 'Why do we need a timer?',
    body: 'Because staring at page 47 of your textbook for 3 hours while contemplating every life decision you\'ve made since 2018 isn\'t called studying.',
    punchline: 'Spin the dial. 50 minutes. Flow state.',
    accent: '#cda270'
  },
  {
    id: '03_the_1159_pm_panic',
    label: 'Under Pressure',
    question: 'Why do we need a timer?',
    body: 'Because "I study better under pressure" is just code for "I start 40 minutes before the 11:59 PM submission deadline."',
    punchline: 'Create the pressure now.',
    accent: '#dfbe95'
  },
  {
    id: '04_the_wikipedia_rabbit_hole',
    label: 'The Rabbit Hole',
    question: 'Why do we need a timer?',
    body: 'Because you sat down to review organic chemistry and somehow ended up watching a documentary on deep-sea bioluminescent squids at 2:00 AM.',
    punchline: '25 minutes on the clock. Stay on the page.',
    accent: '#b89163'
  },
  {
    id: '05_motivation_is_a_myth',
    label: 'The Psychological Weapon',
    question: 'Why do we need a timer?',
    body: 'Because motivation is a myth, but a ticking clock is a psychological weapon that forces momentum out of thin air.',
    punchline: 'Spin the wheel. Start.',
    accent: '#dfbe95'
  },
  {
    id: '06_the_study_setup_procrastination',
    label: 'The Setup Ritual',
    question: 'Why do we need a timer?',
    body: 'Because lighting a scented candle, making an iced latte, and organizing 14 highlighters by color is not actual revision.',
    punchline: 'Hit start. Do the math.',
    accent: '#cda270'
  }
];

function generateHtml(item) {
  return `<!DOCTYPE html>
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
    radial-gradient(circle at 50% 50%, rgba(223, 190, 149, 0.05) 0%, transparent 60%),
    radial-gradient(circle at 50% 12%, rgba(25, 27, 33, 0.5) 0%, transparent 40%),
    linear-gradient(180deg, #0b0c10 0%, #070708 50%, #050506 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 80px 90px 70px;
}

/* Subtle antique hairline border */
.v-border-outer {
  position: absolute;
  inset: 28px;
  border: 1px solid rgba(223, 190, 149, 0.16);
  pointer-events: none;
  border-radius: 12px;
}
.v-border-inner {
  position: absolute;
  inset: 36px;
  border: 1px dashed rgba(223, 190, 149, 0.08);
  pointer-events: none;
  border-radius: 8px;
}

/* Top bar: Exact app font (Cinzel) */
.topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  z-index: 10;
}
.brand-name {
  font-family: 'Cinzel', 'Playfair Display', -apple-system-ui-serif, 'New York', Georgia, serif;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 7px;
  text-transform: uppercase;
  color: #ffffff;
  text-align: center;
  line-height: 1;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
}

/* Center Content */
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
  font-size: 64px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.5px;
  margin-bottom: 34px;
  text-shadow: 0 4px 24px rgba(0,0,0,0.8);
}

.decorative-divider {
  width: 90px;
  height: 2px;
  background: linear-gradient(90deg, transparent, ${item.accent}, transparent);
  margin-bottom: 36px;
}

.center-body {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 32px;
  line-height: 1.56;
  color: rgba(240, 235, 225, 0.88);
  font-weight: 400;
  margin-bottom: 40px;
  text-shadow: 0 2px 16px rgba(0,0,0,0.7);
}

.center-punchline {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: ${item.accent};
  padding: 12px 26px;
  border-radius: 30px;
  background: rgba(223, 190, 149, 0.08);
  border: 1px solid rgba(223, 190, 149, 0.24);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

/* Bottom minimal indicator */
.footer-text {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: rgba(223, 190, 149, 0.45);
  position: relative;
  z-index: 10;
}
</style>
</head>
<body>
  <div class="v-border-outer"></div>
  <div class="v-border-inner"></div>

  <!-- Top: Calverse in exact app font -->
  <div class="topbar">
    <div class="brand-name">CALVERSE</div>
  </div>

  <!-- Middle: Witty & aesthetic timer truth -->
  <div class="center-container">
    <h1 class="center-question">${item.question}</h1>
    <div class="decorative-divider"></div>
    <p class="center-body">${item.body}</p>
    <div class="center-punchline">${item.punchline}</div>
  </div>

  <!-- Bottom -->
  <div class="footer-text">THE ACADEMIA FOCUS TIMER • THETCALVERSE.COM</div>
</body>
</html>`;
}

async function run() {
  console.log(`Starting generation of ${postersData.length} Dark Mode Timer Posters (1080x1350)...`);

  const chromePort = 9350;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_timer_posters_profile'
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
      console.log('Connected to Chrome DevTools Protocol');
      await send('Page.enable');
      await send('DOM.enable');

      // Set standard Instagram 4:5 vertical portrait: 1080x1350
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1080,
        height: 1350,
        deviceScaleFactor: 1,
        mobile: false
      });

      for (let i = 0; i < postersData.length; i++) {
        const item = postersData[i];
        const html = generateHtml(item);
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);

        await send('Page.navigate', { url: dataUrl });
        await new Promise(r => setTimeout(r, 150));

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const fileName = `Timer_Dark_${item.id}.png`;
        const filePath = path.join(outDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));

        // Save first one directly as main hero on Desktop
        if (i === 0) {
          const mainDesktop = path.join(process.env.HOME, 'Desktop/Calverse_Timer_Dark_Poster.png');
          fs.writeFileSync(mainDesktop, Buffer.from(screenshot.data, 'base64'));
          const mainArtifact = path.join(artifactDir, 'Calverse_Timer_Dark_Poster.png');
          fs.writeFileSync(mainArtifact, Buffer.from(screenshot.data, 'base64'));
        }

        // Also save each to artifact directory for presentation
        const artifactPath = path.join(artifactDir, `timer_dark_${item.id}.png`);
        fs.writeFileSync(artifactPath, Buffer.from(screenshot.data, 'base64'));

        console.log(`[${i + 1}/${postersData.length}] Generated: ${fileName}`);
      }

      console.log('All Dark Mode Timer Posters generated successfully!');
      chrome.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error('Error generating timer posters:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
