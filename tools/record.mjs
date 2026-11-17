// Records a scroll-through of each live client site as frames, then ffmpeg makes a muted MP4 loop.
// Usage: node tools/record.mjs   (from the project root; needs ffmpeg on PATH)
import { Browser, sleep } from 'file:///C:/Users/mctop/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const sites = [['nickdaulton', 'https://nickdaultoncomics.com'], ['workwonder', 'https://workwonder.art']];
const views = [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 780, dsf: 1, mobile: true }]];
// FRAMES=520 OUT=preview node tools/record.mjs  → half speed, written to preview/ instead of the live images.
const FRAMES = +(process.env.FRAMES || 260), FPS = 15; // 260 frames ≈ 17 s
const OUT = process.env.OUT || 'img/work';
const b = await Browser.launch();
for (const [id, url] of sites) for (const [kind, vp] of views) {
  const dir = `tools/frames/${id}-${kind}`; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const p = await b.newPage(vp);
  await p.goto(url, { settleMs: 3000 });
  const total = await p.eval(() => document.documentElement.scrollHeight - innerHeight);
  // Hold on the first screen, then scroll evenly to the end.
  const hold = 30, step = Math.max(1, total / (FRAMES - hold));
  for (let i = 0; i < FRAMES; i++) {
    if (i >= hold) await p.wheel(step, { step, pauseMs: 0 });
    await sleep(40);
    await p.screenshot({ path: `${dir}/f${String(i).padStart(4, '0')}.jpg`, quality: 80 });
  }
  await p.close();
  const out = `${OUT}/${id}-${kind}.mp4`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/f%04d.jpg`,
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-movflags', '+faststart', '-an', out]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${dir}/f0010.jpg`, `${OUT}/${id}-${kind}-poster.jpg`]);
  console.log('made', out, 'scroll', total);
}
await b.close();
