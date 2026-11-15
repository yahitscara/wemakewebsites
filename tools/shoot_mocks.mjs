import { Browser, sleep } from 'file:///C:/Users/mctop/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { pathToFileURL } from 'node:url';
import { readdirSync } from 'node:fs';
const [dir, out] = process.argv.slice(2);
const b = await Browser.launch();
for (const f of readdirSync(dir).filter((x) => x.endsWith('.html'))) {
  const p = await b.newPage({ width: 390, height: 844, mobile: true, dsf: 2 });
  await p.goto(pathToFileURL(`${dir}/${f}`).href, { settleMs: 2500 });
  await sleep(1500);
  await p.screenshot({ path: `${out}/${f.replace('.html', '.png')}` });
  console.log(f);
}
await b.close();
