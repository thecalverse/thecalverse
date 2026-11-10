const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const framesDir = '/tmp/calverse_frames';
if (fs.existsSync(framesDir)) {
  fs.rmSync(framesDir, { recursive: true, force: true });
}
fs.mkdirSync(framesDir, { recursive: true });

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless',
  '--remote-debugging-port=9310'
]);

const htmlPath = path.resolve(__dirname, 'opening_recorder.html');

setTimeout(async () => {
  try {
    const res = await fetch(`http://127.0.0.1:9310/json/new?file://${htmlPath}`, { method: 'PUT' });
    const tab = await res.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    const send = (method, params = {}) => new Promise(r => {
      const id = Math.floor(Math.random()*100000);
      const h = (e) => { const m = JSON.parse(e.data); if (m.id === id) { ws.removeEventListener('message', h); r(m.result); } };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });

    ws.addEventListener('open', async () => {
      // 1080x1920 Full HD Mobile Portrait
      await send('Emulation.setDeviceMetricsOverride', { width: 540, height: 960, deviceScaleFactor: 2, mobile: true });
      await new Promise(r => setTimeout(r, 1200));

      const fps = 30;
      const duration = 2.4;
      const totalFrames = Math.floor(fps * duration);
      console.log(`Capturing ${totalFrames} frames at 1080x1920...`);

      for (let i = 0; i < totalFrames; i++) {
        const t = i / fps;
        await send('Runtime.evaluate', { expression: `window.seekTime(${t});` });
        // Give Chrome a few ms to layout
        await new Promise(r => setTimeout(r, 15));
        const s = await send('Page.captureScreenshot', { format: 'png' });
        const frameNum = String(i).padStart(4, '0');
        fs.writeFileSync(path.join(framesDir, `frame_${frameNum}.png`), Buffer.from(s.data, 'base64'));
        if (i % 15 === 0 || i === totalFrames - 1) {
          console.log(`Rendered frame ${i + 1}/${totalFrames} (${Math.round((i+1)/totalFrames*100)}%)`);
        }
      }

      chrome.kill();
      console.log('All frames captured! Calling native make_mp4...');

      const desktopMp4 = path.expanduser ? path.expanduser('~/Desktop/Calverse_Opening.mp4') : path.join(process.env.HOME, 'Desktop/Calverse_Opening.mp4');
      const artifactMp4 = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed/Calverse_Opening.mp4';
      const makeMp4Bin = path.join(__dirname, 'make_mp4');

      execSync(`"${makeMp4Bin}" "${framesDir}" 30 "${desktopMp4}"`, { stdio: 'inherit' });
      fs.copyFileSync(desktopMp4, artifactMp4);

      console.log('Video created successfully at:');
      console.log('1. ' + desktopMp4);
      console.log('2. ' + artifactMp4);
      process.exit(0);
    });
  } catch(e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 1000);
