const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9345;
const USER_DATA = '/tmp/chrome_test_textbox_full_' + Date.now();
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
  console.log('Launching Headless Chrome for Full Text Box Resize & Containment Verification...');
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
        openNotebookInJournal('book_study');
        setIpadActiveTool('select');
      })()
    `);
    await sleep(1000);

    // Insert text box
    console.log('Inserting text box...');
    await evaluate(`insertIpadTextBox();`);
    await sleep(400);

    // User's multi-line text from screenshot
    const userTextHtml = 'Welcome Mate.........<br>Welcome to the<br>heaven......<br>Its dijoubu if u<br>aren\'t able to<br>express anything to<br>anyone..... Just<br>throw everything<br>here, am there for<br>you always...';

    console.log('Test 1: Setting 10 lines of text and verifying auto-adapt...');
    const result1 = await evaluate(`
      (() => {
        const item = document.querySelector("#ipad-page-editor .canvas-item.canvas-text-box");
        const body = item.querySelector(".canvas-text-body");
        body.innerHTML = ${JSON.stringify(userTextHtml)};
        autoResizeCanvasItemText(body);

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
    console.log('Test 1 Result:', result1);
    if (!result1.isEnclosed) throw new Error('Test 1 Failed: Text not enclosed after typing');

    // Test 2: Dragging sidewards (E handle) to extend width
    console.log('Test 2: Dragging E handle +120px sidewards...');
    const result2 = await evaluate(`
      (() => {
        const item = document.querySelector("#ipad-page-editor .canvas-item.canvas-text-box");
        const handleE = item.querySelector(".canvas-resize-e");
        const body = item.querySelector(".canvas-text-body");
        const rect = handleE.getBoundingClientRect();

        handleE.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 2, clientX: rect.left+4, clientY: rect.top+12, bubbles: true }));
        window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 2, clientX: rect.left+4+120, clientY: rect.top+12, bubbles: true }));

        const comp = window.getComputedStyle(item);
        const padY = (parseFloat(comp.paddingTop) || 10) + (parseFloat(comp.paddingBottom) || 14);
        const r = {
          width: item.offsetWidth,
          height: item.offsetHeight,
          bodyHeight: body.offsetHeight,
          fs: parseFloat(window.getComputedStyle(body).fontSize),
          isEnclosed: item.offsetHeight >= (body.offsetHeight + padY - 2)
        };

        window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 2, bubbles: true }));
        return r;
      })()
    `);
    console.log('Test 2 Result (Sidewards Drag):', result2);
    if (result2.width !== 400) throw new Error(`Test 2 Failed: Expected width 400, got ${result2.width}`);
    if (result2.fs !== 16) throw new Error(`Test 2 Failed: Font size changed during sidewards drag to ${result2.fs}`);
    if (!result2.isEnclosed) throw new Error('Test 2 Failed: Text not enclosed after sidewards drag');

    // Screenshot of sidewards resize
    const shotSideways = await send('Page.captureScreenshot', { format: 'png' });
    if (shotSideways.result?.data) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_sideways_resize.png'), Buffer.from(shotSideways.result.data, 'base64'));
      console.log('Saved verify_sideways_resize.png');
    }

    // Test 3: Dragging diagonally (SE handle) to expand both width and height
    console.log('Test 3: Dragging SE handle diagonally +100px X, +80px Y...');
    const result3 = await evaluate(`
      (() => {
        const item = document.querySelector("#ipad-page-editor .canvas-item.canvas-text-box");
        const handleSE = item.querySelector(".canvas-resize-handle");
        const body = item.querySelector(".canvas-text-body");
        const rect = handleSE.getBoundingClientRect();

        handleSE.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 3, clientX: rect.left+10, clientY: rect.top+10, bubbles: true }));
        window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 3, clientX: rect.left+10+100, clientY: rect.top+10+80, bubbles: true }));

        const comp = window.getComputedStyle(item);
        const padY = (parseFloat(comp.paddingTop) || 10) + (parseFloat(comp.paddingBottom) || 14);
        const r = {
          width: item.offsetWidth,
          height: item.offsetHeight,
          bodyHeight: body.offsetHeight,
          fs: parseFloat(window.getComputedStyle(body).fontSize),
          isEnclosed: item.offsetHeight >= (body.offsetHeight + padY - 2)
        };

        window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 3, bubbles: true }));
        return r;
      })()
    `);
    console.log('Test 3 Result (Diagonal Drag):', result3);
    if (!result3.isEnclosed) throw new Error('Test 3 Failed: Text not enclosed after diagonal drag');
    if (result3.width !== 500) throw new Error(`Test 3 Failed: Expected width 500, got ${result3.width}`);

    // Screenshot of diagonal resize
    const shotDiag = await send('Page.captureScreenshot', { format: 'png' });
    if (shotDiag.result?.data) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_diagonal_resize.png'), Buffer.from(shotDiag.result.data, 'base64'));
      console.log('Saved verify_diagonal_resize.png');
    }

    // Test 4: Dragging narrower (-200px)
    console.log('Test 4: Dragging E narrower (-200px) to verify line wrapping and height accommodation...');
    const result4 = await evaluate(`
      (() => {
        const item = document.querySelector("#ipad-page-editor .canvas-item.canvas-text-box");
        const handleE = item.querySelector(".canvas-resize-e");
        const body = item.querySelector(".canvas-text-body");
        const rect = handleE.getBoundingClientRect();

        handleE.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 4, clientX: rect.left+4, clientY: rect.top+12, bubbles: true }));
        window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 4, clientX: rect.left+4-200, clientY: rect.top+12, bubbles: true }));

        const comp = window.getComputedStyle(item);
        const padY = (parseFloat(comp.paddingTop) || 10) + (parseFloat(comp.paddingBottom) || 14);
        const r = {
          width: item.offsetWidth,
          height: item.offsetHeight,
          bodyHeight: body.offsetHeight,
          isEnclosed: item.offsetHeight >= (body.offsetHeight + padY - 2)
        };

        window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 4, bubbles: true }));
        return r;
      })()
    `);
    console.log('Test 4 Result (Narrowing & wrapping):', result4);
    if (!result4.isEnclosed) throw new Error('Test 4 Failed: Text not enclosed after narrowing width');

    // Test 5: Font size change via toolbar
    console.log('Test 5: Changing font size to 24pt via setCanvasItemFontSize...');
    const result5 = await evaluate(`
      (() => {
        const item = document.querySelector("#ipad-page-editor .canvas-item.canvas-text-box");
        setCanvasItemFontSize(item.id, 24);
        const body = item.querySelector(".canvas-text-body");
        const comp = window.getComputedStyle(item);
        const padY = (parseFloat(comp.paddingTop) || 10) + (parseFloat(comp.paddingBottom) || 14);
        return {
          height: item.offsetHeight,
          bodyHeight: body.offsetHeight,
          fs: parseFloat(window.getComputedStyle(body).fontSize),
          isEnclosed: item.offsetHeight >= (body.offsetHeight + padY - 2)
        };
      })()
    `);
    console.log('Test 5 Result (Font Size 24pt):', result5);
    if (result5.fs !== 24) throw new Error(`Test 5 Failed: Font size is ${result5.fs}, expected 24`);
    if (!result5.isEnclosed) throw new Error('Test 5 Failed: Text not enclosed after font size change');

    // Test 6: Fit text button
    console.log('Test 6: Testing fitCanvasItemToText...');
    const result6 = await evaluate(`
      (() => {
        const item = document.querySelector("#ipad-page-editor .canvas-item.canvas-text-box");
        fitCanvasItemToText(item);
        const body = item.querySelector(".canvas-text-body");
        const comp = window.getComputedStyle(item);
        const padY = (parseFloat(comp.paddingTop) || 10) + (parseFloat(comp.paddingBottom) || 14);
        return {
          width: item.offsetWidth,
          height: item.offsetHeight,
          bodyHeight: body.offsetHeight,
          isEnclosed: item.offsetHeight >= (body.offsetHeight + padY - 2)
        };
      })()
    `);
    console.log('Test 6 Result (Fit Text):', result6);
    if (!result6.isEnclosed) throw new Error('Test 6 Failed: Text not enclosed after Fit Text');

    console.log('\n🎉 ALL 6 COMPREHENSIVE TEXT BOX RESIZE & CONTAINMENT TESTS PASSED PERFECTLY!');
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
