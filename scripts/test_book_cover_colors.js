const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const PORT = 9340;
const USER_DATA = '/tmp/chrome_test_prof_' + Date.now();

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
  throw new Error('Chrome did not become ready');
}

async function runTest() {
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
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const currentId = id++;
        callbacks.set(currentId, { resolve, reject });
        ws.send(JSON.stringify({ id: currentId, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
      return res.result ? res.result.value : undefined;
    }

    await send('Page.enable');
    await send('Page.navigate', { url: 'file:///Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse/index.html' });
    await sleep(2500);

    const report = await evaluate(`(() => {
      openJournal({ keepView: true });
      switchJournalMainView('books');
      renderJournalBookshelf();

      const cards = Array.from(document.querySelectorAll('.notebook-cover-card'));
      return cards.map(c => {
        const cs = window.getComputedStyle(c);
        return {
          title: c.querySelector('.notebook-cover-title')?.textContent,
          classes: c.className,
          backgroundImage: cs.backgroundImage,
          backgroundColor: cs.backgroundColor,
          hasGradient: cs.backgroundImage.includes('gradient')
        };
      });
    })()`);

    console.log('Book covers render report:\n', JSON.stringify(report, null, 2));

    const allHaveColors = report.every(r => r.hasGradient);
    console.log('All books have rich gradient colors:', allHaveColors);

    ws.close();
  } finally {
    chrome.kill();
  }
}

runTest().catch(console.error);
