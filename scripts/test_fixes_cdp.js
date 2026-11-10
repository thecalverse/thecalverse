const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9335;
const USER_DATA = '/tmp/chrome_test_prof_' + Date.now();
const ARTIFACT_DIR = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function waitForChromeReady() {
  for (let i = 0; i < 30; i++) {
    try {
      const tabs = await getJson(`http://127.0.0.1:${PORT}/json/list`);
      if (tabs && tabs.length > 0) return tabs;
    } catch (_) {}
    await sleep(300);
  }
  throw new Error('Chrome did not become ready in time');
}

async function runTest() {
  console.log('Launching Headless Chrome...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--window-size=1280,900',
    'file:///Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse/index.html'
  ], { detached: true });

  try {
    const tabs = await waitForChromeReady();
    console.log('Tabs detected:', tabs.map(t => ({ id: t.id, type: t.type, title: t.title })));
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    if (!pageTab) throw new Error('No tab found');

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    let id = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        pending.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return res.result?.result?.value;
    }

    async function captureScreenshot(filePath) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res.result?.data) {
        fs.writeFileSync(filePath, Buffer.from(res.result.data, 'base64'));
        console.log(`Saved screenshot: ${filePath}`);
      }
    }

    // Wait for the app scripts to load and execute
    await sleep(2000);

    console.log('Navigating to Journal view in Calverse...');
    await evaluate(`
      document.documentElement.setAttribute('data-t', 'dark'); setActiveScreen('sJournal', 'Journal');
      switchJournalMainView('notebook');
      if(window.journalBooks && window.journalBooks.length > 0){
        openJournalNotebook(window.journalBooks[0].id);
      } else {
        createDefaultJournalNotebook();
      }
    `);
    await sleep(800);

    // TEST 1: Check Heading placement
    const headingCheck = await evaluate(`
      (() => {
        const headingStrip = document.getElementById('ipad-page-heading-strip');
        const sheet = document.getElementById('ipad-paper-sheet');
        const titleInSheet = sheet ? sheet.querySelector('#ipad-page-title') : null;
        const titleInStrip = headingStrip ? headingStrip.querySelector('#ipad-page-title') : null;
        return {
          headingStripExists: !!headingStrip,
          titleInSheet: !!titleInSheet,
          titleInStrip: !!titleInStrip,
          headingAboveGlass: headingStrip ? (headingStrip.nextElementSibling?.id === 'ipad-screen-glass') : false
        };
      })()
    `);
    console.log('TEST 1 - Heading Placement:', headingCheck);

    // TEST 2: Insert Sticky Note and check delete button
    console.log('Inserting sticky note...');
    await evaluate(`
      insertIpadStickyPrompt();
    `);
    await sleep(400);

    const stickyCheck = await evaluate(`
      (() => {
        const stickies = document.querySelectorAll('.canvas-item.canvas-sticky');
        const lastSticky = stickies[stickies.length - 1];
        if(!lastSticky) return { exists: false };
        const delBtn = lastSticky.querySelector('.canvas-sticky-corner-del');
        return {
          exists: true,
          stickyId: lastSticky.id,
          hasDelBtn: !!delBtn,
          delBtnText: delBtn ? delBtn.textContent.trim() : null
        };
      })()
    `);
    console.log('TEST 2 - Sticky Note & Del Button:', stickyCheck);

    // Take screenshot of notebook with heading above and sticky note with corner delete button
    await captureScreenshot(path.join(ARTIFACT_DIR, 'journal_heading_and_sticky_dark.png'));

    // TEST 3: Delete sticky note via corner delete button
    console.log('Testing sticky deletion via corner delete button...');
    const deleteResult = await evaluate(`
      (() => {
        const stickiesBefore = document.querySelectorAll('.canvas-item.canvas-sticky').length;
        const lastSticky = document.querySelector('.canvas-item.canvas-sticky:last-of-type');
        const delBtn = lastSticky ? lastSticky.querySelector('.canvas-sticky-corner-del') : null;
        if(delBtn) {
          delBtn.click();
        }
        const stickiesAfter = document.querySelectorAll('.canvas-item.canvas-sticky').length;
        return {
          stickiesBefore,
          stickiesAfter,
          deleted: stickiesAfter < stickiesBefore
        };
      })()
    `);
    console.log('TEST 3 - Sticky Note Deletion:', deleteResult);

    // TEST 4: Open background modal and select background
    console.log('Opening background modal...');
    await evaluate(`openJournalBackgroundModal();`);
    await sleep(500);

    const modalOpenCheck = await evaluate(`
      (() => {
        const m = document.getElementById('journal-background-modal');
        return { isOpen: m && m.classList.contains('show') };
      })()
    `);
    console.log('Background Modal Open Check:', modalOpenCheck);

    console.log('Clicking a background card in the modal...');
    const selectBgResult = await evaluate(`
      (() => {
        const firstCard = document.querySelector('.journal-bg-card');
        if(firstCard){
          firstCard.click();
        }
        const m = document.getElementById('journal-background-modal');
        const isClosed = m && !m.classList.contains('show');
        const sheet = document.getElementById('ipad-paper-sheet');
        return {
          cardClicked: !!firstCard,
          modalDismissedImmediately: isClosed,
          sheetBgSet: !!(sheet.style.backgroundImage || sheet.className.includes('paper-'))
        };
      })()
    `);
    console.log('TEST 4 - Modal Auto-Dismiss on Select:', selectBgResult);

    await sleep(600);
    // Take screenshot showing applied background and dismissed modal
    await captureScreenshot(path.join(ARTIFACT_DIR, 'journal_new_bg_applied.png'));

    ws.close();
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    try {
      chrome.kill('SIGKILL');
    } catch (_) {}
    await sleep(500);
    try {
      fs.rmSync(USER_DATA, { recursive: true, force: true });
    } catch (_) {}
    console.log('Test completed.');
  }
}

runTest();
