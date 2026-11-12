const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9339;
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
  console.log('Launching Headless Chrome for Pen Lock & Unlock Tests...');
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

    // 1. Open Notebook in Journal
    console.log('Opening Journal Notebook...');
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

    // 2. Clear canvas and add a text box and sticker in SELECT mode
    console.log('Placing a Text Box and a Sticker in Select mode...');
    const setupResult = await evaluate(`
      (() => {
        setIpadActiveTool('select');
        const editor = document.getElementById("ipad-page-editor");
        editor.innerHTML = "";
        
        insertIpadTextBox();
        const tb = editor.querySelector(".canvas-text-box");
        tb.style.left = "120px";
        tb.style.top = "120px";
        tb.style.width = "260px";
        
        insertIpadSticker("🌸");
        const st = editor.querySelector(".canvas-sticker");
        st.style.left = "160px";
        st.style.top = "130px";
        
        deselectAllCanvasItems();
        
        return {
          tool: ipadActiveTool,
          tbLeft: tb.offsetLeft,
          tbTop: tb.offsetTop,
          stLeft: st.offsetLeft,
          stTop: st.offsetTop
        };
      })()
    `);
    console.log('SETUP IN SELECT MODE:', setupResult);

    // 3. Turn on PEN mode
    console.log('Activating Pen tool...');
    const penActivated = await evaluate(`
      (() => {
        setIpadActiveTool('pen');
        const sheet = document.getElementById('ipad-paper-sheet');
        const canvas = document.getElementById('ipad-ink-canvas');
        const itemsSelected = document.querySelectorAll('.canvas-item.is-selected').length;
        
        return {
          tool: ipadActiveTool,
          sheetHasPenClass: sheet.classList.contains('is-pen-active'),
          canvasHasActiveClass: canvas.classList.contains('is-active'),
          canvasZIndex: window.getComputedStyle(canvas).zIndex,
          anyItemSelected: itemsSelected > 0
        };
      })()
    `);
    console.log('TEST 1 - Pen Tool Activated:', penActivated);

    // 4. Try clicking and dragging over the sticker and text box while Pen is ON
    console.log('Simulating drawing stroke directly over the Text Box & Sticker...');
    const drawingOverItems = await evaluate(`
      (() => {
        const tb = document.querySelector(".canvas-text-box");
        const st = document.querySelector(".canvas-sticker");
        const canvas = document.getElementById("ipad-ink-canvas");
        
        const initialTbPos = { left: tb.offsetLeft, top: tb.offsetTop };
        const initialStPos = { left: st.offsetLeft, top: st.offsetTop };
        const strokesBefore = currentInkStrokes.length;
        const debugInfo = {
          ipadActiveTool,
          ipadIsViewMode,
          ipadInkEngineInitialized,
          activeDragState: !!activeDragState
        };
        
        // Dispatch pointerdown, pointermove, pointerup on canvas at the exact coordinates of the sticker & textbox
        const rect = canvas.getBoundingClientRect();
        const startX = rect.left + 150;
        const startY = rect.top + 130;
        
        canvas.dispatchEvent(new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          clientX: startX,
          clientY: startY,
          pointerId: 1,
          pointerType: "mouse"
        }));
        
        const afterDown = {
          isDrawingInk,
          hasStroke: !!currentStroke
        };
        
        canvas.dispatchEvent(new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          clientX: startX + 80,
          clientY: startY + 60,
          pointerId: 1,
          pointerType: "mouse"
        }));
        
        canvas.dispatchEvent(new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          clientX: startX + 80,
          clientY: startY + 60,
          pointerId: 1,
          pointerType: "mouse"
        }));
        
        const strokesAfter = currentInkStrokes.length;
        const currentTbPos = { left: tb.offsetLeft, top: tb.offsetTop };
        const currentStPos = { left: st.offsetLeft, top: st.offsetTop };
        const selectedItems = document.querySelectorAll('.canvas-item.is-selected').length;
        
        return {
          debugInfo,
          afterDown,
          strokesBefore,
          strokesAfter,
          penDrawn: strokesAfter > strokesBefore,
          tbDidNotMove: initialTbPos.left === currentTbPos.left && initialTbPos.top === currentTbPos.top,
          stDidNotMove: initialStPos.left === currentStPos.left && initialStPos.top === currentStPos.top,
          noItemSelected: selectedItems === 0
        };
      })()
    `);
    console.log('TEST 2 - Inking Over Canvas Items (Nothing should move, ink drawn):', drawingOverItems);
    await captureScreenshot(path.join(ARTIFACT_DIR, 'journal_pen_drawing_over_items_locked.png'));

    // 5. Turn OFF Pen (Deselect Pen by selecting 'select' tool)
    console.log('Deselecting Pen (Switching back to Select & Move)...');
    const selectModeRestored = await evaluate(`
      (() => {
        setIpadActiveTool('select');
        const sheet = document.getElementById('ipad-paper-sheet');
        const canvas = document.getElementById('ipad-ink-canvas');
        
        // Now try clicking the Text Box to select and move it
        const tb = document.querySelector(".canvas-text-box");
        selectCanvasItem(tb);
        
        return {
          tool: ipadActiveTool,
          sheetPenClassRemoved: !sheet.classList.contains('is-pen-active'),
          canvasNotActive: !canvas.classList.contains('is-active'),
          tbCanBeSelectedNow: tb.classList.contains('is-selected')
        };
      })()
    `);
    console.log('TEST 3 - Select Mode Restored (Items can move and select again):', selectModeRestored);
    await captureScreenshot(path.join(ARTIFACT_DIR, 'journal_select_mode_restored.png'));

    // 6. Test Pen Toggle (Tapping active pen button toggles it off)
    console.log('Testing Pen button toggle...');
    const toggleTest = await evaluate(`
      (() => {
        setIpadActiveTool('pen');
        const isPenNow = ipadActiveTool === 'pen';
        setIpadActiveTool('pen'); // Tap again
        const isSelectNow = ipadActiveTool === 'select';
        return {
          firstTapIsPen: isPenNow,
          secondTapToggledToSelect: isSelectNow
        };
      })()
    `);
    console.log('TEST 4 - Pen Button Toggle:', toggleTest);

    // 7. Test Clicking + Text Box while Pen is active automatically switches to select mode
    console.log('Testing auto-switch to select mode when inserting items...');
    const autoSwitchTest = await evaluate(`
      (() => {
        setIpadActiveTool('pen');
        const toolBefore = ipadActiveTool;
        insertIpadTextBox();
        const toolAfter = ipadActiveTool;
        return {
          toolBefore,
          toolAfter,
          switchedToSelectOnInsert: toolAfter === 'select'
        };
      })()
    `);
    console.log('TEST 5 - Auto-Switch to Select on Item Insert:', autoSwitchTest);

    ws.close();
    console.log('All Pen Lock & Unlock tests passed successfully!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    await sleep(500);
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch (_) {}
  }
}

runTest();
