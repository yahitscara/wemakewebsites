// Quick look: screenshot a page at a given width. node tools/peek.mjs <file> <width> <out> [scrollY]
import { Browser, sleep } from 'file:///C:/Users/mctop/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { pathToFileURL } from 'node:url';
const [file, w, out, y = 0] = process.argv.slice(2);
const b = await Browser.launch();
const mobile = +w < 600;
const p = await b.newPage({ width: +w, height: mobile ? 844 : 900, mobile, dsf: 1 });
await p.goto(pathToFileURL(file).href, { settleMs: 1500 });
await p.eval(`window.scrollTo(0, ${y})`); await sleep(1200);
console.log(await p.eval(() => { const m = document.querySelector('.menu-word'); if (!m) return 'none'; const r = m.getBoundingClientRect(); return JSON.stringify({ r, d: getComputedStyle(m).display, top: document.elementFromPoint(r.x + 5, r.y + 5)?.className }); }));
await p.screenshot({ path: out });
await b.close();
