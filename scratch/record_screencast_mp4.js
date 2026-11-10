const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const framesDir = '/tmp/calverse_screencast_frames';

if (fs.existsSync(framesDir)) {
  fs.rmSync(framesDir, { recursive: true, force: true });
}
fs.mkdirSync(framesDir, { recursive: true });

// Static HTTP server
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
});

server.listen(8894, '127.0.0.1', async () => {
  console.log('Static server listening on http://127.0.0.1:8894');

  const chromePort = 9342;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_screencast_profile'
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
      console.log('Connected to Chrome DevTools Protocol');
      await send('Page.enable');
      await send('DOM.enable');

      // 540x960 @ 2x = 1080x1920 Full HD Mobile Portrait
      await send('Emulation.setDeviceMetricsOverride', {
        width: 540,
        height: 960,
        deviceScaleFactor: 2,
        mobile: true
      });

      // Warm up cache & set black theme in localStorage
      await send('Page.navigate', { url: 'http://127.0.0.1:8894/index.html' });
      await new Promise(r => setTimeout(r, 1200));

      await send('Runtime.evaluate', {
        expression: `
          localStorage.setItem('calverse_theme', 'black');
          localStorage.setItem('calverse_build_tag', '20261031_tablet_desktop_unified_layout_v2');
          document.documentElement.setAttribute('data-t', 'black');
          if (document.body) document.body.setAttribute('data-t', 'black');
        `
      });

      let frameIndex = 0;
      ws.addEventListener('message', async (e) => {
        const msg = JSON.parse(e.data);
        if (msg.method === 'Page.screencastFrame') {
          const frameNum = String(frameIndex++).padStart(4, '0');
          fs.writeFileSync(path.join(framesDir, `frame_${frameNum}.png`), Buffer.from(msg.params.data, 'base64'));
          await send('Page.screencastFrameAck', { sessionId: msg.params.sessionId });
        }
      });

      console.log('Starting screencast recording...');
      // Start recording before navigation
      await send('Page.startScreencast', {
        format: 'png',
        quality: 100,
        maxWidth: 1080,
        maxHeight: 1920,
        everyNthFrame: 1
      });

      // Navigate to fresh boot
      await send('Page.navigate', { url: 'http://127.0.0.1:8894/index.html' });

      // Record for 3.6 seconds (spash intro + dimensional portal expansion + live dashboard)
      await new Promise(r => setTimeout(r, 3600));

      await send('Page.stopScreencast');
      console.log(`Recorded ${frameIndex} frames!`);

      chrome.kill();
      server.close();

      // Check how many frames we have
      const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).sort();
      console.log(`Found ${files.length} frame files on disk.`);

      // Compute FPS: files.length / 3.6s
      const calculatedFps = Math.max(24, Math.round(files.length / 3.6));
      console.log(`Calculated playback framerate: ${calculatedFps} fps`);

      const desktopMp4 = path.join(process.env.HOME, 'Desktop/Calverse_Opening.mp4');
      const artifactMp4 = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed/Calverse_Opening.mp4';
      const makeMp4Bin = path.join(__dirname, 'make_mp4');

      console.log(`Compiling MP4 via native AVAssetWriter hardware encoder...`);
      execSync(`"${makeMp4Bin}" "${framesDir}" ${calculatedFps} "${desktopMp4}"`, { stdio: 'inherit' });
      fs.copyFileSync(desktopMp4, artifactMp4);

      console.log('SUCCESS! Video generated at:');
      console.log('1. ' + desktopMp4);
      console.log('2. ' + artifactMp4);
      process.exit(0);
    });
  } catch (err) {
    console.error('Recording error:', err);
    chrome.kill();
    server.close();
    process.exit(1);
  }
});
