const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9339;
const USER_DATA = '/tmp/chrome_test_textbox_' + Date.now();
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
  console.log('Launching Headless Chrome for Text Box Auto-Adapt Test...');
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
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.result?.value;
    }

    console.log('Waiting for Calverse to initialize...');
    await sleep(2000);

    // Navigate to Journal
    console.log('Opening Journal...');
    await evaluate(`
      (() => {
        document.documentElement.setAttribute('data-t', 'dark');
        setActiveScreen('sJournal', 'Journal');
        switchJournalMainView('notebook');
        if(typeof openNotebookInJournal === 'function'){
          openNotebookInJournal('book_study');
        } else if(window.journalBooks && window.journalBooks.length > 0){
          openJournalNotebook(window.journalBooks[0].id);
        } else {
          openJournal();
        }
      })()
    `);
    await sleep(1200);

    // Set active tool to select
    await evaluate(`if(typeof setIpadActiveTool === 'function') setIpadActiveTool('select');`);
    await sleep(300);

    // Insert a text box
    console.log('Inserting text box...');
    await evaluate(`insertIpadTextBox();`);
    await sleep(400);

    // Populate with the EXACT text from the user's screenshot
    const userTextHtml = `Welcome Mate.........<br>Welcome to the<br>heaven......<br>Its dijoubu if u<br>aren't able to<br>express anything to<br>anyone..... Just<br>throw everything<br>here, am there for<br>you always...`;

    console.log('Typing multi-line text into text box...');
    const resultAfterType = await evaluate(`
      (() => {
        const item = document.querySelector("#ipad-page-editor .canvas-item.canvas-text-box");
        if(!item) return { error: "No text box found" };
        const body = item.querySelector(".canvas-text-body");
        body.innerHTML = \`${userTextHtml}\`;
        // Trigger auto-resize
        autoResizeCanvasItemText(body);

        const comp = window.getComputedStyle(item);
        const padY = (parseFloat(comp.paddingTop) || 10) + (parseFloat(comp.paddingBottom) || 14);
        return {
          itemWidth: item.offsetWidth,
          itemHeight: item.offsetHeight,
          bodyHeight: body.offsetHeight,
          bodyScrollHeight: body.scrollHeight,
          padY: padY,
          isEnclosed: item.offsetHeight >= (body.offsetHeight + padY - 2)
        };
      })()
    `);
    console.log('Result after typing 10 lines of text:', resultAfterType);

    if (!resultAfterType.isEnclosed) {
      throw new Error(`Text box height (${resultAfterType.itemHeight}px) does not enclose text body (${resultAfterType.bodyHeight}px + pad ${resultAfterType.padY}px)`);
    }

    // Capture screenshot of the adapted text box
    console.log('Taking screenshot of adapted text box...');
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot.result?.data) {
      const shotPath = path.join(ARTIFACT_DIR, 'verify_textbox_auto_adapted_to_text.png');
      fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));
      console.log('Saved screenshot to:', shotPath);
    }

    // Test changing font size
    console.log('Testing font size increase to 22pt...');
    const resultAfterFontSize = await evaluate(`
      (() => {
        const item = document.querySelector("#ipad-page-editor .canvas-item.canvas-text-box");
        setCanvasItemFontSize(item.id, 22);
        const body = item.querySelector(".canvas-text-body");
        const comp = window.getComputedStyle(item);
        const padY = (parseFloat(comp.paddingTop) || 10) + (parseFloat(comp.paddingBottom) || 14);
        return {
          itemHeight: item.offsetHeight,
          bodyHeight: body.offsetHeight,
          padY: padY,
          isEnclosed: item.offsetHeight >= (body.offsetHeight + padY - 2)
        };
      })()
    `);
    console.log('Result after font size 22pt:', resultAfterFontSize);
    if (!resultAfterFontSize.isEnclosed) {
      throw new Error('Text box failed to adapt after font size change');
    }

    // Test Fit Text button
    console.log('Testing Fit Text button (fitCanvasItemToText)...');
    const resultAfterFit = await evaluate(`
      (() => {
        const item = document.querySelector("#ipad-page-editor .canvas-item.canvas-text-box");
        fitCanvasItemToText(item);
        const body = item.querySelector(".canvas-text-body");
        const comp = window.getComputedStyle(item);
        const padY = (parseFloat(comp.paddingTop) || 10) + (parseFloat(comp.paddingBottom) || 14);
        return {
          itemWidth: item.offsetWidth,
          itemHeight: item.offsetHeight,
          bodyHeight: body.offsetHeight,
          isEnclosed: item.offsetHeight >= (body.offsetHeight + padY - 2)
        };
      })()
    `);
    console.log('Result after Fit Text:', resultAfterFit);
    if (!resultAfterFit.isEnclosed) {
      throw new Error('Text box failed to enclose text after Fit Text');
    }

    // Capture screenshot after Fit Text
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    if (shot2.result?.data) {
      const shotPath2 = path.join(ARTIFACT_DIR, 'verify_textbox_fitted_dimensions.png');
      fs.writeFileSync(shotPath2, Buffer.from(shot2.result.data, 'base64'));
      console.log('Saved screenshot 2 to:', shotPath2);
    }

    console.log('\n✅ ALL TEXT BOX OVERFLOW & AUTO-ADAPT TESTS PASSED PERFECTLY!');
    ws.close();
  } finally {
    try {
      chrome.kill('SIGKILL');
    } catch (_) {}
    try {
      fs.rmSync(USER_DATA, { recursive: true, force: true });
    } catch (_) {}
  }
}

runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
