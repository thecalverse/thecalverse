const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const baseOutDir = path.join(process.env.HOME, 'Desktop/Calverse_Ornate_Posters');
const coreMinimalDir = path.join(process.env.HOME, 'Desktop/Calverse_Core_Posters');
const formats = ['Square_1080x1080', 'Portrait_1080x1350'];
const categories = ['05_Library', '06_Notes'];

for (const fmt of formats) {
  for (const c of categories) {
    fs.mkdirSync(path.join(baseOutDir, fmt, c), { recursive: true });
  }
  fs.mkdirSync(path.join(coreMinimalDir, fmt), { recursive: true });
}

const artifactDir = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed';

const campaignData = [
  // --- 05 LIBRARY (6 Campaign Posters) ---
  {
    category: '05_Library',
    id: '01_downloads_folder_cemetery',
    num: 1,
    question: 'Why do we need an academic library?',
    body: 'Because your Downloads folder currently has 47 files named "Lecture_Slides_Week_4_Final_Real_v3.pdf" and you still can\'t find the syllabus three days before finals.',
    punchline: 'One sanctuary. Every document.',
    accent: '#dfbe95'
  },
  {
    category: '05_Library',
    id: '02_whatsapp_group_scavenger',
    num: 2,
    question: 'Why organize your study files?',
    body: 'Because scrolling through 12,000 group chat messages, memes, and audio notes just to find the midterm formula sheet is not an efficient study strategy.',
    punchline: 'Stop scrolling. Start studying.',
    accent: '#cda270'
  },
  {
    category: '05_Library',
    id: '03_the_27_open_tabs',
    num: 3,
    question: 'Why a dedicated academic library?',
    body: 'Because keeping 27 research tabs, 4 PDF viewers, and 3 cloud drives open simultaneously until your laptop sounds like a jet engine is pure chaos.',
    punchline: 'Clean desk. Quiet mind.',
    accent: '#dfbe95'
  },
  {
    category: '05_Library',
    id: '04_the_lost_reference_at_2am',
    num: 4,
    question: 'Why archive your academic papers?',
    body: 'That brilliant diagram you saw three weeks ago that perfectly explains organic synthesis? You will spend 4 hours searching for it the night before the exam unless it has a permanent home.',
    punchline: 'Archive once. Master forever.',
    accent: '#b89163'
  },
  {
    category: '05_Library',
    id: '05_fragmentation_enemy_retention',
    num: 5,
    question: 'Why keep textbooks and slides together?',
    body: 'Textbooks on your tablet, lecture slides in your email, past papers in a zip file, and homework on the fridge. Fragmentation is the silent enemy of retention.',
    punchline: 'Physics. Chemistry. Maths. All in one.',
    accent: '#dfbe95'
  },
  {
    category: '05_Library',
    id: '06_the_scholars_vault',
    num: 6,
    question: 'Why build a personal library?',
    body: 'A scholar doesn\'t scatter their knowledge across a dozen chaotic folders. They curate a private vault of reference material that lasts well beyond the semester.',
    punchline: 'Curate your mind. Build your vault.',
    accent: '#cda270'
  },

  // --- 06 NOTES (6 Campaign Posters) ---
  {
    category: '06_Notes',
    id: '01_notes_vs_journal',
    num: 1,
    question: 'Isn\'t taking notes the same as journaling?',
    body: 'Journaling is where you confess that organic chemistry made you cry at 2:00 AM. Notes is where you systematically break down reaction mechanisms so it never happens again.',
    punchline: 'Heart in the journal. Brain in the notes.',
    accent: '#dfbe95'
  },
  {
    category: '06_Notes',
    id: '02_the_illusion_of_highlighting',
    num: 2,
    question: 'Why take structured study notes?',
    body: 'Because turning an entire 30-page textbook chapter neon yellow with a highlighter isn\'t called studying—it\'s just coloring inside the lines.',
    punchline: 'Synthesize. Structure. Retain.',
    accent: '#cda270'
  },
  {
    category: '06_Notes',
    id: '03_the_lecture_scramble',
    num: 3,
    question: 'Why do we need dedicated study notes?',
    body: 'Because your professor talked at 350 words per minute while changing slides every 12 seconds. If you don\'t distill the core concepts today, slide 18 will be alien by Friday.',
    punchline: 'Turn lecture noise into revision gold.',
    accent: '#dfbe95'
  },
  {
    category: '06_Notes',
    id: '04_the_3am_exam_sheet',
    num: 4,
    question: 'Why write revision notes?',
    body: 'When the exam begins in 4 hours, you won\'t reread a 600-page textbook. You will read the distilled formulas, bullet summaries, and clean Cornell notes you made weeks ago.',
    punchline: 'Write today. Thank yourself at finals.',
    accent: '#b89163'
  },
  {
    category: '06_Notes',
    id: '05_passive_vs_active',
    num: 5,
    question: 'Why write notes actively?',
    body: 'Staring passively at a screen gives your brain the comfortable illusion of understanding. Writing the concept in your own structured words forces the neural connection to stick.',
    punchline: 'Active recall beats passive reading.',
    accent: '#dfbe95'
  },
  {
    category: '06_Notes',
    id: '06_structure_beats_chaos',
    num: 6,
    question: 'Why structured note layouts?',
    body: 'Because disorganized scribble across 5 random spiral notebooks is why revision feels overwhelming. One quiet canvas with grids, formulas, and clean margins changes everything.',
    punchline: 'Structure your notes. Master your grades.',
    accent: '#cda270'
  }
];

// Minimal single-word title posters
const minimalPosters = [
  {
    id: 'library',
    category: '05_Library',
    filename: '00_Library_Minimal.png',
    title: 'LIBRARY',
    accent: '#dfbe95'
  },
  {
    id: 'notes',
    category: '06_Notes',
    filename: '00_Notes_Minimal.png',
    title: 'NOTES',
    accent: '#cda270'
  }
];

function generateCampaignHtml(item, width, height) {
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

/* ORNATE VINTAGE GOLD FRAME */
.frame-container {
  position: absolute;
  inset: ${isSquare ? '36px' : '48px'};
  pointer-events: none;
  z-index: 2;
}

.frame-outer {
  position: absolute;
  inset: 0;
  border: 1.5px solid transparent;
  border-image: linear-gradient(135deg, #f5e6d3 0%, #dfbe95 25%, #8c6a40 50%, #dfbe95 75%, #f5e6d3 100%) 1;
  box-shadow: inset 0 0 40px rgba(223, 190, 149, 0.04), 0 0 25px rgba(223, 190, 149, 0.06);
}

.frame-inner {
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(223, 190, 149, 0.24);
}

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
  font-size: ${isSquare ? '50px' : '58px'};
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
  background: linear-gradient(90deg, transparent, ${item.accent}, transparent);
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
  color: ${item.accent};
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
    <h1 class="center-question">${item.question}</h1>
    <div class="decorative-divider"></div>
    <p class="center-body">${item.body}</p>
    <div class="center-punchline">${item.punchline}</div>
  </div>

  <div class="bottom-spacer"></div>
</body>
</html>`;
}

function generateMinimalHtml(item, width, height) {
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

/* ORNATE VINTAGE GOLD FRAME */
.frame-container {
  position: absolute;
  inset: ${isSquare ? '36px' : '48px'};
  pointer-events: none;
  z-index: 2;
}

.frame-outer {
  position: absolute;
  inset: 0;
  border: 1.5px solid transparent;
  border-image: linear-gradient(135deg, #f5e6d3 0%, #dfbe95 25%, #8c6a40 50%, #dfbe95 75%, #f5e6d3 100%) 1;
  box-shadow: inset 0 0 40px rgba(223, 190, 149, 0.04), 0 0 25px rgba(223, 190, 149, 0.06);
}

.frame-inner {
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(223, 190, 149, 0.24);
}

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
  max-width: 920px;
  position: relative;
  z-index: 10;
  padding: 0 20px;
}

.center-title {
  font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
  font-size: ${isSquare ? '74px' : '84px'};
  font-weight: 800;
  letter-spacing: 12px;
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
  console.log('Generating 14 Posters for Library & Notes (Campaign + Minimal)...');

  const chromePort = 9395;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_lib_notes_profile'
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

        console.log(`\n=== RENDERING ${fmt} ===`);
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });

        // 1. Render Campaign Posters
        for (const item of campaignData) {
          const html = generateCampaignHtml(item, width, height);
          await send('Page.navigate', { url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}` });
          await new Promise(r => setTimeout(r, 600));

          const screenshot = await send('Page.captureScreenshot', { format: 'png' });
          const buffer = Buffer.from(screenshot.data, 'base64');

          const filename = `${String(item.num).padStart(2, '0')}_${item.id}.png`;
          const outPath = path.join(baseOutDir, fmt, item.category, filename);
          fs.writeFileSync(outPath, buffer);
          console.log(`Saved Campaign: ${outPath}`);

          // Copy artifact for inline display
          const artifactName = `ornate_${isSquare ? 'sq' : 'pt'}_${item.category.slice(3).toLowerCase()}_${String(item.num).padStart(2, '0')}.png`;
          fs.writeFileSync(path.join(artifactDir, artifactName), buffer);
        }

        // 2. Render Minimal Posters
        for (const item of minimalPosters) {
          const html = generateMinimalHtml(item, width, height);
          await send('Page.navigate', { url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}` });
          await new Promise(r => setTimeout(r, 600));

          const screenshot = await send('Page.captureScreenshot', { format: 'png' });
          const buffer = Buffer.from(screenshot.data, 'base64');

          // Save to category folder
          const outPathCat = path.join(baseOutDir, fmt, item.category, item.filename);
          fs.writeFileSync(outPathCat, buffer);

          // Also save to Desktop/Calverse_Core_4_Posters (extended to all core minimal)
          const corePath = path.join(process.env.HOME, 'Desktop/Calverse_Core_4_Posters', fmt, `0${item.id === 'library' ? '5' : '6'}_${item.title}.png`);
          fs.writeFileSync(corePath, buffer);
          console.log(`Saved Minimal: ${outPathCat}`);

          // Copy artifact
          const artifactName = `core4_${isSquare ? 'sq' : 'pt'}_${item.id}.png`;
          fs.writeFileSync(path.join(artifactDir, artifactName), buffer);
        }
      }

      console.log('\nAll 14 Library & Notes Posters (28 files total) generated successfully in Square and Portrait!');
      ws.close();
      chrome.kill();
      process.exit(0);
    });

  } catch (err) {
    console.error('Error rendering posters:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
