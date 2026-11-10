const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const framesDir = '/tmp/calverse_real_frames';

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

server.listen(8899, '127.0.0.1', async () => {
  console.log('Static server listening on http://127.0.0.1:8899');

  const chromePort = 9338;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_record_profile_3'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const tabRes = await fetch(`http://127.0.0.1:${chromePort}/json/new?http://127.0.0.1:8899/index.html`, { method: 'PUT' });
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

      // Set standard 540x960 @ 2x = 1080x1920 Full HD Mobile Portrait
      await send('Emulation.setDeviceMetricsOverride', {
        width: 540,
        height: 960,
        deviceScaleFactor: 2,
        mobile: true
      });

      // Force black theme & current tag before load
      await send('Runtime.evaluate', {
        expression: `
          localStorage.setItem('calverse_theme', 'black');
          localStorage.setItem('calverse_build_tag', '20261031_tablet_desktop_unified_layout_v2');
          document.documentElement.setAttribute('data-t', 'black');
        `
      });

      // Wait 2s for page, fonts and images to load
      await new Promise(r => setTimeout(r, 2200));

      // Inject deterministic seekOpening function
      await send('Runtime.evaluate', {
        expression: `
          window.spDone = true; // prevent automatic timer
          window.seekOpening = function(t) {
            const sp = document.getElementById('sp');
            const ring = document.querySelector('.sp-ring');
            const app = document.getElementById('app');
            if (!sp || !ring || !app) return 'not found';
            
            app.classList.add('show');
            ring.style.animation = 'none';

            if (t < 1.0) {
              sp.style.display = 'flex';
              sp.style.opacity = '1';
              sp.style.background = '#070708';
              ring.style.opacity = String(Math.min(1, Math.max(0.15, t / 0.4)));
              ring.style.transform = 'translateY(' + (Math.sin(t * 3.5) * 2.5) + 'px) scale(1)';
            } else if (t < 2.2) {
              const p = (t - 1.0) / 1.2;
              const ease = 1 - Math.pow(1 - p, 3);
              const scale = 1 + ease * 9.0;
              sp.style.display = 'flex';
              sp.style.background = '#070708';
              ring.style.transform = 'translateY(0) scale(' + scale.toFixed(3) + ')';
              ring.style.opacity = String(Math.max(0, 1 - p * 1.35));
              sp.style.opacity = String(Math.max(0, 1 - Math.pow(p, 1.6)));
            } else {
              sp.style.display = 'none';
              sp.style.opacity = '0';
            }
            return 't=' + t;
          };
          window.seekOpening(0);
        `
      });

      console.log('Starting deterministic frame capture (1080x1920 @ 30fps)...');
      const fps = 30;
      const durationSeconds = 3.2;
      const totalFrames = Math.floor(fps * durationSeconds); // 96 frames

      for (let f = 0; f < totalFrames; f++) {
        const timeSec = f / fps;
        await send('Runtime.evaluate', {
          expression: `window.seekOpening(${timeSec});`
        });

        // Small pause for compositor
        await new Promise(r => setTimeout(r, 20));

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const frameNum = String(f).padStart(4, '0');
        fs.writeFileSync(path.join(framesDir, `frame_${frameNum}.png`), Buffer.from(screenshot.data, 'base64'));

        if (f % 16 === 0 || f === totalFrames - 1) {
          console.log(`Captured frame ${f + 1}/${totalFrames} (time: ${timeSec.toFixed(2)}s, ${Math.round((f + 1) / totalFrames * 100)}%)`);
        }
      }

      console.log('All frames captured! Closing Chrome & server...');
      chrome.kill();
      server.close();

      const desktopMp4 = path.join(process.env.HOME, 'Desktop/Calverse_Opening.mp4');
      const artifactMp4 = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed/Calverse_Opening.mp4';
      const makeMp4Bin = path.join(__dirname, 'make_mp4');

      console.log(`Compiling MP4 via native AVAssetWriter hardware encoder...`);
      execSync(`"${makeMp4Bin}" "${framesDir}" 30 "${desktopMp4}"`, { stdio: 'inherit' });
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
