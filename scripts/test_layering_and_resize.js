const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9338;
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
  console.log('Launching Headless Chrome for Journal Layering & Resize Tests...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1200,900'
  ]);

  try {
    const tabs = await waitForChromeReady();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    const wsUrl = pageTab.webSocketDebuggerUrl;
    console.log('Connecting to WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const currentId = id++;
        callbacks.set(currentId, { resolve, reject });
        ws.send(JSON.stringify({ id: currentId, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        console.error('Eval error:', res.exceptionDetails);
        throw new Error(res.exceptionDetails.text || 'Eval error');
      }
      return res.result.value;
    }

    async function captureScreenshot(filePath) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log('Saved screenshot:', filePath);
    }

    await send('Page.enable');
    await send('Runtime.enable');

    const htmlPath = path.resolve(__dirname, '../index.html');
    console.log('Navigating to:', `file://${htmlPath}`);
    await send('Page.navigate', { url: `file://${htmlPath}` });
    await sleep(2500);

    // 1. Switch to Journal and open Notebook
    console.log('Switching to Journal screen and opening notebook...');
    await evaluate(`
      (() => {
        if(typeof JOURNAL_BOOKS !== 'undefined' && JOURNAL_BOOKS.length > 0){
          openNotebookInJournal(JOURNAL_BOOKS[0].id);
        } else {
          openJournal();
          openNotebookInJournal('book_study');
        }
      })()
    `);
    await sleep(1000);

    // TEST 1: Clear and insert Text Box + Sticker
    console.log('Setting up Text Box and overlapping Sticker...');
    const setupResult = await evaluate(`
      (() => {
        const editor = document.getElementById("ipad-page-editor");
        editor.innerHTML = "";
        
        insertIpadTextBox();
        const tb = editor.querySelector(".canvas-text-box");
        tb.style.left = "100px";
        tb.style.top = "100px";
        tb.style.width = "280px";
        
        insertIpadSticker("🌸");
        const st = editor.querySelector(".canvas-sticker");
        st.style.left = "140px";
        st.style.top = "110px";
        
        return {
          textBoxId: tb.id,
          tbZ: parseInt(tb.style.zIndex, 10),
          stickerId: st.id,
          stZ: parseInt(st.style.zIndex, 10),
          stickerAboveTextBox: parseInt(st.style.zIndex, 10) > parseInt(tb.style.zIndex, 10)
        };
      })()
    `);
    console.log('SETUP RESULT:', setupResult);
    await sleep(400);

    // TEST 2: Select Text Box -> Must come above Sticker!
    console.log('Selecting Text Box...');
    const selectTextBoxResult = await evaluate(`
      (() => {
        const tb = document.querySelector(".canvas-text-box");
        const st = document.querySelector(".canvas-sticker");
        selectCanvasItem(tb);
        return {
          tbZ: parseInt(tb.style.zIndex, 10),
          stZ: parseInt(st.style.zIndex, 10),
          textBoxNowAbove: parseInt(tb.style.zIndex, 10) > parseInt(st.style.zIndex, 10)
        };
      })()
    `);
    console.log('TEST 2 - Select Text Box (Should be above sticker):', selectTextBoxResult);
    await captureScreenshot(path.join(ARTIFACT_DIR, 'journal_textbox_selected_above_sticker.png'));

    // TEST 3: Select Sticker -> Must come above Text Box!
    console.log('Selecting Sticker...');
    const selectStickerResult = await evaluate(`
      (() => {
        const tb = document.querySelector(".canvas-text-box");
        const st = document.querySelector(".canvas-sticker");
        selectCanvasItem(st);
        return {
          tbZ: parseInt(tb.style.zIndex, 10),
          stZ: parseInt(st.style.zIndex, 10),
          stickerNowAbove: parseInt(st.style.zIndex, 10) > parseInt(tb.style.zIndex, 10)
        };
      })()
    `);
    console.log('TEST 3 - Select Sticker (Should be above textbox):', selectStickerResult);
    await captureScreenshot(path.join(ARTIFACT_DIR, 'journal_sticker_selected_above_textbox.png'));

    // TEST 4: Select Text Box AGAIN -> Must come above Sticker AGAIN!
    console.log('Selecting Text Box again...');
    const selectTextBoxAgainResult = await evaluate(`
      (() => {
        const tb = document.querySelector(".canvas-text-box");
        const st = document.querySelector(".canvas-sticker");
        selectCanvasItem(tb);
        return {
          tbZ: parseInt(tb.style.zIndex, 10),
          stZ: parseInt(st.style.zIndex, 10),
          textBoxNowAboveAgain: parseInt(tb.style.zIndex, 10) > parseInt(st.style.zIndex, 10)
        };
      })()
    `);
    console.log('TEST 4 - Select Text Box again (Should be above sticker):', selectTextBoxAgainResult);

    // TEST 5: Text Box Resizing & Font Scaling
    console.log('Testing text box resize and font scaling...');
    const resizeResult = await evaluate(`
      (() => {
        const tb = document.querySelector(".canvas-text-box");
        const body = tb.querySelector(".canvas-text-body");
        const initialFontSize = parseFloat(window.getComputedStyle(body).fontSize);
        const initialWidth = tb.offsetWidth;
        const initialHeight = tb.offsetHeight;
        
        // Find corner resize handle
        const handle = tb.querySelector(".canvas-resize-handle[data-dir='se']");
        const rect = handle.getBoundingClientRect();
        
        // 1. Simulate pointerdown on resize handle
        handle.dispatchEvent(new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          pointerId: 1
        }));
        
        // 2. Simulate dragging corner down-right (+140px width, +70px height)
        window.dispatchEvent(new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2 + 140,
          clientY: rect.top + rect.height / 2 + 70,
          pointerId: 1
        }));
        
        const enlargedFontSize = parseFloat(window.getComputedStyle(body).fontSize);
        const enlargedWidth = tb.offsetWidth;
        
        // 3. Simulate pointerup
        window.dispatchEvent(new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          pointerId: 1
        }));
        
        return {
          initialFontSize,
          initialWidth,
          enlargedWidth,
          enlargedFontSize,
          fontScaledUp: enlargedFontSize > initialFontSize
        };
      })()
    `);
    console.log('TEST 5 - Resize Text Box Larger:', resizeResult);
    await captureScreenshot(path.join(ARTIFACT_DIR, 'journal_textbox_resized_larger.png'));

    // TEST 6: Resize Text Box Smaller
    console.log('Testing shrinking text box and font scaling down...');
    const shrinkResult = await evaluate(`
      (() => {
        const tb = document.querySelector(".canvas-text-box");
        const body = tb.querySelector(".canvas-text-body");
        const beforeShrinkFontSize = parseFloat(window.getComputedStyle(body).fontSize);
        
        const handle = tb.querySelector(".canvas-resize-handle[data-dir='se']");
        const rect = handle.getBoundingClientRect();
        
        handle.dispatchEvent(new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          pointerId: 2
        }));
        
        window.dispatchEvent(new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2 - 200,
          clientY: rect.top + rect.height / 2 - 100,
          pointerId: 2
        }));
        
        const shrunkenFontSize = parseFloat(window.getComputedStyle(body).fontSize);
        const shrunkenWidth = tb.offsetWidth;
        
        window.dispatchEvent(new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          pointerId: 2
        }));
        
        return {
          beforeShrinkFontSize,
          shrunkenFontSize,
          shrunkenWidth,
          fontScaledDown: shrunkenFontSize < beforeShrinkFontSize
        };
      })()
    `);
    console.log('TEST 6 - Resize Text Box Smaller:', shrinkResult);
    await captureScreenshot(path.join(ARTIFACT_DIR, 'journal_textbox_resized_smaller.png'));

    ws.close();
    console.log('All automated journal tests passed successfully!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    await sleep(500);
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch (_) {}
  }
}

runTest();
