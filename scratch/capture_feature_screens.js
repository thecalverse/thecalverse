const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outDir = '/tmp/calverse_ad_screens';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(rootDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(8893, '127.0.0.1', async () => {
  const chromePort = 9345;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_feature_screens'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const tabRes = await fetch(`http://127.0.0.1:${chromePort}/json/new?http://127.0.0.1:8893/index.html`, { method: 'PUT' });
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
      await send('DOM.enable');
      await send('Emulation.setDeviceMetricsOverride', { width: 540, height: 960, deviceScaleFactor: 2, mobile: true });

      // Dismiss splash immediately and warm up
      await send('Runtime.evaluate', {
        expression: `
          localStorage.setItem('calverse_theme', 'black');
          localStorage.setItem('calverse_build_tag', '20261031_tablet_desktop_unified_layout_v2');
          if (window.hideSpImmediately) window.hideSpImmediately();
          else if (window.hideSp) window.hideSp();
          document.documentElement.setAttribute('data-t', 'black');
          if (document.body) document.body.setAttribute('data-t', 'black');
        `
      });
      await new Promise(r => setTimeout(r, 1500));

      const capture = async (name, setupExpr) => {
        if (setupExpr) {
          await send('Runtime.evaluate', { expression: setupExpr });
          await new Promise(r => setTimeout(r, 800));
        }
        const s = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(outDir, `${name}.png`);
        fs.writeFileSync(filePath, Buffer.from(s.data, 'base64'));
        console.log(`Saved screenshot: ${name}.png`);
      };

      // 1. Dashboard (Dark)
      await capture('dash_dark', `bnav('home'); document.documentElement.setAttribute('data-t', 'black'); if (document.body) document.body.setAttribute('data-t', 'black');`);

      // 2. Dashboard (Latte)
      await capture('dash_latte', `bnav('home'); document.documentElement.setAttribute('data-t', 'light'); if (document.body) document.body.setAttribute('data-t', 'light');`);

      // 3. Calculators - Scientific (Dark)
      await capture('calc_sci_dark', `document.documentElement.setAttribute('data-t', 'black'); if (document.body) document.body.setAttribute('data-t', 'black'); go('Sci');`);

      // 4. Calculators - Scientific (Latte)
      await capture('calc_sci_latte', `document.documentElement.setAttribute('data-t', 'light'); if (document.body) document.body.setAttribute('data-t', 'light'); go('Sci');`);

      // 5. Calculators - Matrix (Dark)
      await capture('calc_matrix_dark', `document.documentElement.setAttribute('data-t', 'black'); if (document.body) document.body.setAttribute('data-t', 'black'); go('Matrix');`);

      // 6. Timer (Dark)
      await capture('timer_dark', `document.documentElement.setAttribute('data-t', 'black'); if (document.body) document.body.setAttribute('data-t', 'black'); bnav('timer');`);

      // 7. Timer (Latte)
      await capture('timer_latte', `document.documentElement.setAttribute('data-t', 'light'); if (document.body) document.body.setAttribute('data-t', 'light'); bnav('timer');`);

      // 8. Journal (Dark)
      await capture('journal_dark', `document.documentElement.setAttribute('data-t', 'black'); if (document.body) document.body.setAttribute('data-t', 'black'); bnav('journal');`);

      // 9. Journal (Latte)
      await capture('journal_latte', `document.documentElement.setAttribute('data-t', 'light'); if (document.body) document.body.setAttribute('data-t', 'light'); bnav('journal');`);

      // 10. Notes (Dark)
      await capture('notes_dark', `document.documentElement.setAttribute('data-t', 'black'); if (document.body) document.body.setAttribute('data-t', 'black'); bnav('notes');`);

      // 11. Notes (Latte)
      await capture('notes_latte', `document.documentElement.setAttribute('data-t', 'light'); if (document.body) document.body.setAttribute('data-t', 'light'); bnav('notes');`);

      // 12. Habits / Tracker (Dark)
      await capture('tracker_dark', `document.documentElement.setAttribute('data-t', 'black'); if (document.body) document.body.setAttribute('data-t', 'black'); bnav('tracker');`);

      // 13. Habits / Tracker (Latte)
      await capture('tracker_latte', `document.documentElement.setAttribute('data-t', 'light'); if (document.body) document.body.setAttribute('data-t', 'light'); bnav('tracker');`);

      console.log('All feature screenshots captured successfully!');
      chrome.kill();
      server.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('Capture error:', err);
    chrome.kill();
    server.close();
    process.exit(1);
  }
});
