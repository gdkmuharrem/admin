// Kullanım:
//   node render.cjs stills 1.5 5 10      -> out/still-<sn>.png
//   node render.cjs                      -> out/getstack-tanitim-1.mp4
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30;
const outDir = path.resolve(__dirname, 'out');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => window.TOTAL);

  if (process.argv[2] === 'stills') {
    for (const s of process.argv.slice(3).map(Number)) {
      await page.evaluate(t => window.renderAt(t), s);
      await page.screenshot({ path: path.join(outDir, `still-${s}.png`) });
      console.log('still', s);
    }
    await browser.close();
    return;
  }

  const out = path.join(outDir, 'getstack-tanitim-1.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', '-r', String(FPS), '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(total * FPS);
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.renderAt(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log('frame', i, '/', frames);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done', out);
})();
