const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9338;
const USER_DATA = '/tmp/chrome_test_timer_' + Date.now();
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
  console.log('Launching Headless Chrome for Timer Wake Lock Test...');
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

    // Mock macOS calverseNative message handler to verify native messages sent
    await evaluate(`
      window.__nativeMessages = [];
      window.webkit = {
        messageHandlers: {
          calverseNative: {
            postMessage: function(msg) {
              window.__nativeMessages.push(msg);
            }
          }
        }
      };
    `);

    // Open Timer screen
    console.log('Opening Timer screen...');
    await evaluate(`openTimer();`);
    await sleep(500);

    const initialStatus = await evaluate(`({
      timerRun: timerRun,
      isScreenKeepAwakeActive: isScreenKeepAwakeActive,
      nativeMessagesCount: window.__nativeMessages.length
    })`);
    console.log('1. Initial timer status (off):', initialStatus);

    if (initialStatus.timerRun !== false || initialStatus.isScreenKeepAwakeActive !== false) {
      throw new Error('Timer should initially be off and screen awake should be inactive');
    }

    // Start Timer
    console.log('Starting timer...');
    await evaluate(`startTimer();`);
    await sleep(600);

    const runningStatus = await evaluate(`({
      timerRun: timerRun,
      isScreenKeepAwakeActive: isScreenKeepAwakeActive,
      hasVideoFallback: !!timerKeepAwakeVideo,
      hasWakeLock: !!timerWakeLockSentinel,
      lastNativeMessage: window.__nativeMessages[window.__nativeMessages.length - 1]
    })`);
    console.log('2. Running timer status (on):', runningStatus);

    if (runningStatus.timerRun !== true || runningStatus.isScreenKeepAwakeActive !== true) {
      throw new Error('Timer should be running and isScreenKeepAwakeActive should be true');
    }
    if (runningStatus.lastNativeMessage?.action !== 'keepScreenAwake') {
      throw new Error(`Expected keepScreenAwake message to native bridge, got: ${JSON.stringify(runningStatus.lastNativeMessage)}`);
    }

    // Take screenshot of running timer focus mode
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot.result?.data) {
      const shotPath = path.join(ARTIFACT_DIR, 'verify_timer_running_screen_awake.png');
      fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));
      console.log('Saved running timer screenshot to:', shotPath);
    }

    // Pause Timer
    console.log('Pausing timer...');
    await evaluate(`pauseTimer();`);
    await sleep(400);

    const pausedStatus = await evaluate(`({
      timerRun: timerRun,
      isScreenKeepAwakeActive: isScreenKeepAwakeActive,
      lastNativeMessage: window.__nativeMessages[window.__nativeMessages.length - 1]
    })`);
    console.log('3. Paused timer status (off):', pausedStatus);

    if (pausedStatus.timerRun !== false || pausedStatus.isScreenKeepAwakeActive !== false) {
      throw new Error('Timer should be paused and isScreenKeepAwakeActive should be false');
    }
    if (pausedStatus.lastNativeMessage?.action !== 'allowScreenSleep') {
      throw new Error(`Expected allowScreenSleep message to native bridge, got: ${JSON.stringify(pausedStatus.lastNativeMessage)}`);
    }

    // Resume Timer, then test Finish Timer
    console.log('Starting timer again...');
    await evaluate(`startTimer();`);
    await sleep(400);

    console.log('Finishing timer...');
    await evaluate(`finishTimer();`);
    await sleep(400);

    const finishedStatus = await evaluate(`({
      timerRun: timerRun,
      isScreenKeepAwakeActive: isScreenKeepAwakeActive,
      lastNativeMessage: window.__nativeMessages[window.__nativeMessages.length - 1]
    })`);
    console.log('4. Finished timer status (off):', finishedStatus);

    if (finishedStatus.timerRun !== false || finishedStatus.isScreenKeepAwakeActive !== false) {
      throw new Error('Finished timer should set isScreenKeepAwakeActive to false');
    }
    if (finishedStatus.lastNativeMessage?.action !== 'allowScreenSleep') {
      throw new Error(`Expected allowScreenSleep message on finish, got: ${JSON.stringify(finishedStatus.lastNativeMessage)}`);
    }

    // Start Timer, then test Exit
    console.log('Starting timer again...');
    await evaluate(`startTimer();`);
    await sleep(400);

    console.log('Stopping timer and exiting focus mode...');
    await evaluate(`stopTimerAndExit();`);
    await sleep(400);

    const exitStatus = await evaluate(`({
      timerRun: timerRun,
      isScreenKeepAwakeActive: isScreenKeepAwakeActive,
      lastNativeMessage: window.__nativeMessages[window.__nativeMessages.length - 1]
    })`);
    console.log('5. Exited timer status (off):', exitStatus);

    if (exitStatus.timerRun !== false || exitStatus.isScreenKeepAwakeActive !== false) {
      throw new Error('Exiting timer should set isScreenKeepAwakeActive to false');
    }

    console.log('\n✅ ALL TIMER SCREEN WAKE LOCK TESTS PASSED PERFECTLY!');
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
