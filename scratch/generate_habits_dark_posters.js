const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const outDir = path.join(process.env.HOME, 'Desktop/Calverse_Habits_Dark_Posters');
fs.mkdirSync(outDir, { recursive: true });

const artifactDir = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed';

const postersData = [
  {
    id: '01_the_tuesday_casualty',
    label: 'The Tuesday Casualty',
    question: 'Why do we need a habit tracker?',
    body: 'Because "starting tomorrow, I\'m waking up at 5:00 AM, studying 8 hours, drinking 3 liters of water, and reinventing my life" has a 100% casualty rate by Tuesday.',
    punchline: 'Build real habits. Start small.',
    accent: '#dfbe95'
  },
  {
    id: '02_sunday_motivation_is_a_liar',
    label: 'Sunday Motivation',
    question: 'Why do we track habits?',
    body: 'Because your Sunday night motivation is an emotional liar, but your Tuesday afternoon habit tracker tells the cold, honest truth.',
    punchline: 'Track reality. Not fantasy.',
    accent: '#cda270'
  },
  {
    id: '03_consistency_over_heroism',
    label: 'Consistency Over Heroism',
    question: 'Why do we need a habit tracker?',
    body: 'Because pulling two 14-hour all-nighters before finals won\'t save a semester of doing nothing. Consistency beats heroism every single time.',
    punchline: '1 hour a day beats 20 hours at 3 AM.',
    accent: '#dfbe95'
  },
  {
    id: '04_protect_the_chain',
    label: 'Protect The Chain',
    question: 'Why track daily streaks?',
    body: 'Because your brain will gladly talk you out of revising today—until it sees a 14-day streak on the line. Protect the chain at all costs.',
    punchline: 'Never break the chain.',
    accent: '#b89163'
  },
  {
    id: '05_systems_over_goals',
    label: 'Systems Over Goals',
    question: 'Why do we track habits?',
    body: 'You don\'t rise to the level of your goals; you fall to the level of your systems. Two problem sets a day doesn\'t feel like much until exam week arrives.',
    punchline: 'Small daily wins compound.',
    accent: '#dfbe95'
  },
  {
    id: '06_the_dopamine_of_the_checkbox',
    label: 'The Checkbox Dopamine',
    question: 'Why do we need a habit tracker?',
    body: 'Because the quiet, visceral dopamine hit of checking off that final circle after a brutal study day hits harder than scrolling TikTok for 2 hours.',
    punchline: 'Fill the circle. Earn the rest.',
    accent: '#cda270'
  },
  {
    id: '07_discipline_outlasts_motivation',
    label: 'Discipline Outlasts Motivation',
    question: 'Why track your routines?',
    body: 'Motivation is an unreliable visitor who vanishes the moment coursework gets difficult. Habits are the loyal soldier that shows up regardless.',
    punchline: 'Discipline outlasts motivation.',
    accent: '#dfbe95'
  },
  {
    id: '08_the_brain_fuel_balance',
    label: 'The Brain Fuel Balance',
    question: 'Why do we track habits?',
    body: 'Because studying for 6 hours means nothing if you slept for 2, drank zero water, and can\'t remember your own name during the exam.',
    punchline: 'Track your brain\'s fuel.',
    accent: '#b89163'
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
    radial-gradient(circle at 50% 50%, rgba(223, 190, 149, 0.05) 0%, transparent 62%),
    radial-gradient(circle at 50% 12%, rgba(28, 30, 36, 0.45) 0%, transparent 40%),
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

/* Subtle vintage border */
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

  <!-- Middle: Witty & aesthetic habit truth -->
  <div class="center-container">
    <h1 class="center-question">${item.question}</h1>
    <div class="decorative-divider"></div>
    <p class="center-body">${item.body}</p>
    <div class="center-punchline">${item.punchline}</div>
  </div>

  <!-- Bottom -->
  <div class="footer-text">THE ACADEMIA HABIT TRACKER • THECALVERSE.COM</div>
</body>
</html>`;
}

async function run() {
  console.log(`Starting generation of ${postersData.length} Dark Mode Habit Posters (1080x1350)...`);

  const chromePort = 9360;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_habits_posters_profile'
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
        const fileName = `Habits_Dark_${item.id}.png`;
        const filePath = path.join(outDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));

        // Save first one directly as main hero on Desktop
        if (i === 0) {
          const mainDesktop = path.join(process.env.HOME, 'Desktop/Calverse_Habits_Dark_Poster.png');
          fs.writeFileSync(mainDesktop, Buffer.from(screenshot.data, 'base64'));
          const mainArtifact = path.join(artifactDir, 'Calverse_Habits_Dark_Poster.png');
          fs.writeFileSync(mainArtifact, Buffer.from(screenshot.data, 'base64'));
        }

        // Also save each to artifact directory for presentation
        const artifactPath = path.join(artifactDir, `habits_dark_${item.id}.png`);
        fs.writeFileSync(artifactPath, Buffer.from(screenshot.data, 'base64'));

        console.log(`[${i + 1}/${postersData.length}] Generated: ${fileName}`);
      }

      console.log('All Dark Mode Habit Posters generated successfully!');
      chrome.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error('Error generating habits posters:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
