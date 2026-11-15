// Full-page screenshots of the live client sites (desktop + phone).
// Usage: node tools/shoot.mjs   (from the project root)
import { Browser, sleep } from 'file:///C:/Users/mctop/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const sites = [
  ['nickdaulton', 'https://nickdaultoncomics.com'],
  ['workwonder', 'https://workwonder.art'],
];
const b = await Browser.launch();
for (const [id, url] of sites) {
  for (const [kind, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844, dsf: 2, mobile: true }]]) {
    const p = await b.newPage(vp);
    await p.goto(url, { settleMs: 3000 });
    await p.wheel(8000); await sleep(800);
    await p.eval(() => window.scrollTo(0, 0)); await sleep(800);
    await p.screenshot({ path: `img/work/${id}-${kind}.jpg`, fullPage: true, quality: 80 });
    await p.close();
    console.log('shot', id, kind);
  }
}
await b.close();
