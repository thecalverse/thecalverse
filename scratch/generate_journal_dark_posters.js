const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const outDir = path.join(process.env.HOME, 'Desktop/Calverse_Journal_Dark_Posters');
fs.mkdirSync(outDir, { recursive: true });

const artifactDir = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed';

const postersData = [
  {
    id: '01_the_3am_overthinking',
    label: 'The 3 AM Overthinking Trap',
    question: 'Why do we need a journal?',
    body: 'Because your brain at 3:00 AM will convince you that your entire future is ruined just because you didn\'t understand slide 14 of today\'s lecture.',
    punchline: 'Put it on paper. Go to sleep.',
    accent: '#dfbe95'
  },
  {
    id: '02_cheaper_than_therapy',
    label: 'Cheaper Than Therapy',
    question: 'Why do we write our thoughts down?',
    body: 'Because paper never judges you, interrupts you, or rolls its eyes when you complain about the same problem set for the fifth time this week.',
    punchline: 'Your private sanctuary awaits.',
    accent: '#cda270'
  },
  {
    id: '03_the_mental_ram',
    label: 'The Mental RAM Problem',
    question: 'Why do we need a journal?',
    body: 'Your brain is a processor, not a hard drive. Trying to hold 47 unfinished thoughts, exam anxiety, and tomorrow\'s to-do list in working memory is why you feel exhausted.',
    punchline: 'Offload the clutter. Write it down.',
    accent: '#dfbe95'
  },
  {
    id: '04_the_time_capsule',
    label: 'The Academic Time Capsule',
    question: 'Why do we journal?',
    body: 'In three years, you won\'t remember the fear you felt before midterms or the quiet coffee shop where everything suddenly made sense—unless you ink it into existence today.',
    punchline: 'Archive your academic years.',
    accent: '#b89163'
  },
  {
    id: '05_untangling_chaotic_thoughts',
    label: 'Untangling The Chaos',
    question: 'Why write it down?',
    body: 'Thoughts sound terrifyingly chaotic inside your head. The moment they hit the page, you realize 80% of it was just stress, hunger, and caffeine.',
    punchline: 'Clarity is only a page away.',
    accent: '#dfbe95'
  },
  {
    id: '06_the_scholars_tradition',
    label: 'The Scholar\'s Tradition',
    question: 'Why keep an academic journal?',
    body: 'Marcus Aurelius, Da Vinci, Marie Curie, and Kafka all wrote down their doubts, breakthroughs, and daily chaos. You aren\'t alone; you\'re just continuing the tradition.',
    punchline: 'Join the scholar\'s sanctuary.',
    accent: '#cda270'
  },
  {
    id: '07_close_the_mental_tabs',
    label: 'Close The Mental Tabs',
    question: 'Why do we need a journal?',
    body: 'Because lying in bed staring at your ceiling replaying an awkward interaction from three weeks ago is not considered productive self-reflection.',
    punchline: 'Close the open tabs in your brain.',
    accent: '#dfbe95'
  },
  {
    id: '08_midnight_breakthroughs',
    label: 'Midnight Breakthroughs',
    question: 'Why write it down?',
    body: 'Because that brilliant idea you swear you\'ll remember tomorrow morning? You won\'t. Ink it before it evaporates into the dark.',
    punchline: 'Capture the breakthrough.',
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

  <!-- Middle: Witty & aesthetic journal truth -->
  <div class="center-container">
    <h1 class="center-question">${item.question}</h1>
    <div class="decorative-divider"></div>
    <p class="center-body">${item.body}</p>
    <div class="center-punchline">${item.punchline}</div>
  </div>

  <!-- Bottom -->
  <div class="footer-text">THE ACADEMIA JOURNAL • THECALVERSE.COM</div>
</body>
</html>`;
}

async function run() {
  console.log(`Starting generation of ${postersData.length} Dark Mode Journal Posters (1080x1350)...`);

  const chromePort = 9355;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_journal_posters_profile'
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
        const fileName = `Journal_Dark_${item.id}.png`;
        const filePath = path.join(outDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));

        // Save first one directly as main hero on Desktop
        if (i === 0) {
          const mainDesktop = path.join(process.env.HOME, 'Desktop/Calverse_Journal_Dark_Poster.png');
          fs.writeFileSync(mainDesktop, Buffer.from(screenshot.data, 'base64'));
          const mainArtifact = path.join(artifactDir, 'Calverse_Journal_Dark_Poster.png');
          fs.writeFileSync(mainArtifact, Buffer.from(screenshot.data, 'base64'));
        }

        // Also save each to artifact directory for presentation
        const artifactPath = path.join(artifactDir, `journal_dark_${item.id}.png`);
        fs.writeFileSync(artifactPath, Buffer.from(screenshot.data, 'base64'));

        console.log(`[${i + 1}/${postersData.length}] Generated: ${fileName}`);
      }

      console.log('All Dark Mode Journal Posters generated successfully!');
      chrome.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error('Error generating journal posters:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
