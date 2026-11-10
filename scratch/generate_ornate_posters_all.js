const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const baseOutDir = path.join(process.env.HOME, 'Desktop/Calverse_Ornate_Posters');
const formats = ['Square_1080x1080', 'Portrait_1080x1350'];
const categories = ['01_Calculators', '02_Timer', '03_Journal', '04_Habits'];

for (const fmt of formats) {
  for (const c of categories) {
    fs.mkdirSync(path.join(baseOutDir, fmt, c), { recursive: true });
  }
}

const artifactDir = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed';

const campaignData = [
  // --- 01 CALCULATORS (6 Posters) ---
  {
    category: '01_Calculators',
    id: '01_ai_hallucinations',
    num: 1,
    question: 'Why not just ask an AI?',
    body: 'Because an AI will write you a 4-paragraph philosophical essay, hallucinate that 7 × 8 = 54, hit your daily message limit, and still get the wrong answer on your homework.',
    punchline: 'Plug the values. Get the truth.',
    accent: '#dfbe95'
  },
  {
    category: '01_Calculators',
    id: '02_instant_vs_typing_animation',
    num: 2,
    question: 'Why do we still need real calculators?',
    body: 'Because waiting 12 seconds for an AI chatbot to generate a slow typing animation when you just need the determinant of a 3×3 matrix is pure academic torture.',
    punchline: 'Instant input. Instant solution.',
    accent: '#cda270'
  },
  {
    category: '01_Calculators',
    id: '03_all_stem_formulas_one_place',
    num: 3,
    question: 'Do we really need all formulas in one place?',
    body: 'Yes. Because flipping between 6 browser tabs, a PDF formula sheet, and 3 different apps just to calculate projectile motion and mole concentration is why you hate studying.',
    punchline: 'Physics. Chemistry. Maths. All in one.',
    accent: '#dfbe95'
  },
  {
    category: '01_Calculators',
    id: '04_unlimited_steps_no_paywalls',
    num: 4,
    question: 'Why not use online homework solvers?',
    body: 'Because "You have reached your free question limit for today. Upgrade to Premium for $19.99/mo" at 11:45 PM is an act of psychological violence.',
    punchline: 'Unlimited working steps. Zero paywalls.',
    accent: '#b89163'
  },
  {
    category: '01_Calculators',
    id: '05_enter_values_boom',
    num: 5,
    question: 'Why a formula-driven calculator?',
    body: 'No prompt engineering. No begging a chatbot to "please show working". Just input your numbers, hit calculate, and boom: every single step laid out with mathematical rigor.',
    punchline: 'Enter values. Master the steps.',
    accent: '#dfbe95'
  },
  {
    category: '01_Calculators',
    id: '06_exam_hall_reality',
    num: 6,
    question: 'Why calculate manually?',
    body: 'Because an AI won\'t be sitting next to you in the exam hall. Understanding the step-by-step formula logic is the only thing that actually protects your GPA.',
    punchline: 'Understand the logic. Ace the exam.',
    accent: '#cda270'
  },

  // --- 02 TIMER (6 Posters) ---
  {
    category: '02_Timer',
    id: '01_the_5_minute_break',
    num: 1,
    question: 'Why do we need a timer?',
    body: 'Because a "5-minute break" without a timer will somehow turn into 3 hours of cleaning your room, researching the fall of the Roman Empire, and learning how to make sourdough.',
    punchline: 'Set the 25 minutes. Sit down.',
    accent: '#dfbe95'
  },
  {
    category: '02_Timer',
    id: '02_the_textbook_stare',
    num: 2,
    question: 'Why do we need a timer?',
    body: 'Because staring at page 47 of your textbook for 3 hours while contemplating every life decision you\'ve made since 2018 isn\'t called studying.',
    punchline: 'Spin the dial. 50 minutes. Flow state.',
    accent: '#cda270'
  },
  {
    category: '02_Timer',
    id: '03_the_1159_pm_panic',
    num: 3,
    question: 'Why do we need a timer?',
    body: 'Because "I study better under pressure" is just code for "I start 40 minutes before the 11:59 PM submission deadline."',
    punchline: 'Create the pressure now.',
    accent: '#dfbe95'
  },
  {
    category: '02_Timer',
    id: '04_the_wikipedia_rabbit_hole',
    num: 4,
    question: 'Why do we need a timer?',
    body: 'Because you sat down to review organic chemistry and somehow ended up watching a documentary on deep-sea bioluminescent squids at 2:00 AM.',
    punchline: '25 minutes on the clock. Stay on the page.',
    accent: '#b89163'
  },
  {
    category: '02_Timer',
    id: '05_motivation_is_a_myth',
    num: 5,
    question: 'Why do we need a timer?',
    body: 'Because motivation is a myth, but a ticking clock is a psychological weapon that forces momentum out of thin air.',
    punchline: 'Spin the wheel. Start.',
    accent: '#dfbe95'
  },
  {
    category: '02_Timer',
    id: '06_the_study_setup_procrastination',
    num: 6,
    question: 'Why do we need a timer?',
    body: 'Because lighting a scented candle, making an iced latte, and organizing 14 highlighters by color is not actual revision.',
    punchline: 'Hit start. Do the math.',
    accent: '#cda270'
  },

  // --- 03 JOURNAL (6 Posters) ---
  {
    category: '03_Journal',
    id: '01_the_3am_overthinking',
    num: 1,
    question: 'Why do we need a journal?',
    body: 'Because your brain at 3:00 AM will convince you that your entire future is ruined just because you didn\'t understand slide 14 of today\'s lecture.',
    punchline: 'Put it on paper. Go to sleep.',
    accent: '#dfbe95'
  },
  {
    category: '03_Journal',
    id: '02_cheaper_than_therapy',
    num: 2,
    question: 'Why do we write our thoughts down?',
    body: 'Because paper never judges you, interrupts you, or rolls its eyes when you complain about the same problem set for the fifth time this week.',
    punchline: 'Your private sanctuary awaits.',
    accent: '#cda270'
  },
  {
    category: '03_Journal',
    id: '03_the_mental_ram',
    num: 3,
    question: 'Why do we need a journal?',
    body: 'Your brain is a processor, not a hard drive. Trying to hold 47 unfinished thoughts, exam anxiety, and tomorrow\'s to-do list in working memory is why you feel exhausted.',
    punchline: 'Offload the clutter. Write it down.',
    accent: '#dfbe95'
  },
  {
    category: '03_Journal',
    id: '04_the_time_capsule',
    num: 4,
    question: 'Why do we journal?',
    body: 'In three years, you won\'t remember the fear you felt before midterms or the quiet coffee shop where everything suddenly made sense—unless you ink it into existence today.',
    punchline: 'Archive your academic years.',
    accent: '#b89163'
  },
  {
    category: '03_Journal',
    id: '05_untangling_chaotic_thoughts',
    num: 5,
    question: 'Why write it down?',
    body: 'Thoughts sound terrifyingly chaotic inside your head. The moment they hit the page, you realize 80% of it was just stress, hunger, and caffeine.',
    punchline: 'Clarity is only a page away.',
    accent: '#dfbe95'
  },
  {
    category: '03_Journal',
    id: '06_the_scholars_tradition',
    num: 6,
    question: 'Why keep an academic journal?',
    body: 'Marcus Aurelius, Da Vinci, Marie Curie, and Kafka all wrote down their doubts, breakthroughs, and daily chaos. You aren\'t alone; you\'re just continuing the tradition.',
    punchline: 'Join the scholar\'s sanctuary.',
    accent: '#cda270'
  },

  // --- 04 HABITS (6 Posters) ---
  {
    category: '04_Habits',
    id: '01_the_tuesday_casualty',
    num: 1,
    question: 'Why do we need a habit tracker?',
    body: 'Because "starting tomorrow, I\'m waking up at 5:00 AM, studying 8 hours, drinking 3 liters of water, and reinventing my life" has a 100% casualty rate by Tuesday.',
    punchline: 'Build real habits. Start small.',
    accent: '#dfbe95'
  },
  {
    category: '04_Habits',
    id: '02_sunday_motivation_is_a_liar',
    num: 2,
    question: 'Why do we track habits?',
    body: 'Because your Sunday night motivation is an emotional liar, but your Tuesday afternoon habit tracker tells the cold, honest truth.',
    punchline: 'Track reality. Not fantasy.',
    accent: '#cda270'
  },
  {
    category: '04_Habits',
    id: '03_consistency_over_heroism',
    num: 3,
    question: 'Why do we need a habit tracker?',
    body: 'Because pulling two 14-hour all-nighters before finals won\'t save a semester of doing nothing. Consistency beats heroism every single time.',
    punchline: '1 hour a day beats 20 hours at 3 AM.',
    accent: '#dfbe95'
  },
  {
    category: '04_Habits',
    id: '04_protect_the_chain',
    num: 4,
    question: 'Why track daily streaks?',
    body: 'Because your brain will gladly talk you out of revising today—until it sees a 14-day streak on the line. Protect the chain at all costs.',
    punchline: 'Never break the chain.',
    accent: '#b89163'
  },
  {
    category: '04_Habits',
    id: '05_systems_over_goals',
    num: 5,
    question: 'Why do we track habits?',
    body: 'You don\'t rise to the level of your goals; you fall to the level of your systems. Two problem sets a day doesn\'t feel like much until exam week arrives.',
    punchline: 'Small daily wins compound.',
    accent: '#dfbe95'
  },
  {
    category: '04_Habits',
    id: '06_the_dopamine_of_the_checkbox',
    num: 6,
    question: 'Why do we need a habit tracker?',
    body: 'Because the quiet, visceral dopamine hit of checking off that final circle after a brutal study day hits harder than scrolling TikTok for 2 hours.',
    punchline: 'Fill the circle. Earn the rest.',
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
   ORNATE VINTAGE GOLD FRAME (Gilded borders, Corners, Florets)
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

async function run() {
  console.log('Starting generation of Ornate Borders in Square (1080x1080) & Portrait (1080x1350)...');

  const chromePort = 9385;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_ornate_suite_profile'
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

      // 1. Render all 24 in SQUARE (1080x1080) -> ZERO CROPPING ON INSTA
      console.log('=== RENDERING 1080x1080 SQUARE (INSTA CROP-PROOF) ===');
      await send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1080, deviceScaleFactor: 1, mobile: false });
      
      for (let i = 0; i < campaignData.length; i++) {
        const item = campaignData[i];
        const html = generateHtml(item, 1080, 1080);
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);

        await send('Page.navigate', { url: dataUrl });
        await new Promise(r => setTimeout(r, 120));

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const fileName = `Poster_${String(item.num).padStart(2, '0')}_${item.id}.png`;
        const filePath = path.join(baseOutDir, 'Square_1080x1080', item.category, fileName);
        fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));

        // Save sample square posters to artifact directory
        const artifactName = `ornate_sq_${item.category.toLowerCase().replace(/^[0-9]+_/, '')}_${String(item.num).padStart(2, '0')}.png`;
        fs.writeFileSync(path.join(artifactDir, artifactName), Buffer.from(screenshot.data, 'base64'));

        console.log(`[SQ ${i + 1}/24] ${item.category}/${fileName}`);
      }

      // 2. Render all 24 in PORTRAIT (1080x1350) -> FULL FEED/STORY RATIO
      console.log('=== RENDERING 1080x1350 PORTRAIT (4:5 VERTICAL) ===');
      await send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });

      for (let i = 0; i < campaignData.length; i++) {
        const item = campaignData[i];
        const html = generateHtml(item, 1080, 1350);
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);

        await send('Page.navigate', { url: dataUrl });
        await new Promise(r => setTimeout(r, 120));

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const fileName = `Poster_${String(item.num).padStart(2, '0')}_${item.id}.png`;
        const filePath = path.join(baseOutDir, 'Portrait_1080x1350', item.category, fileName);
        fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));

        // Save sample portrait posters to artifact directory
        const artifactName = `ornate_pt_${item.category.toLowerCase().replace(/^[0-9]+_/, '')}_${String(item.num).padStart(2, '0')}.png`;
        fs.writeFileSync(path.join(artifactDir, artifactName), Buffer.from(screenshot.data, 'base64'));

        console.log(`[PT ${i + 1}/24] ${item.category}/${fileName}`);
      }

      console.log('ALL 48 ORNATE POSTERS GENERATED SUCCESSFULLY!');
      chrome.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error('Error in ornate suite generator:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
