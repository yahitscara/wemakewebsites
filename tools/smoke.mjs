// Smoke test: live preview, package tabs, form guard, case links. node tools/smoke.mjs
import { Browser, sleep } from 'file:///C:/Users/mctop/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
const b = await Browser.launch();
const p = await b.newPage({ width: 1440, height: 900 });
await p.goto(pathToFileURL('index.html').href, { settleMs: 1500 });
const r = await p.eval(async () => {
  const out = {};
  const n = document.getElementById('biz-name'); n.value = "Joe's Barber & Shave"; n.dispatchEvent(new Event('input'));
  out.domain = document.querySelector('[data-out="url"]').textContent;
  out.domainFits = document.querySelector('.domain-name').scrollWidth <= document.querySelector('.domain-name').clientWidth + 2;
  document.getElementById('t-booked').click();
  out.bookedVisible = !document.getElementById('p-booked').hidden && document.getElementById('p-open').hidden;
  document.querySelector('[data-plan="Fully booked"]').click();
  out.packageCarried = document.getElementById('f-package').value;
  const f = document.getElementById('contact-form');
  f.requestSubmit ? (document.getElementById('f-name').value = 'x', document.getElementById('f-email').value = 'x', f.requestSubmit()) : 0;
  await new Promise((res) => setTimeout(res, 300));
  out.formStatus = f.querySelector('.form-status').textContent;
  out.links = [...document.querySelectorAll('a[href^="case/"], img, video source')].map((e) => e.getAttribute('href') || e.getAttribute('src'));
  return out;
});
r.missing = r.links.filter((l) => !existsSync(l)); delete r.links;
console.log(JSON.stringify(r, null, 1));
await b.close();
