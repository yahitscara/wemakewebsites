// wemakewebsites.work — the small amount of script the page needs.
// Everything still reads without it: plans fall back to all-visible, videos show posters.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal once on entry, staggered inside each group.
(() => {
  const targets = document.querySelectorAll('[data-reveal]');
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((el, i) => el.style.setProperty('--d', `${i * 80}ms`));
  });
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  targets.forEach((el) => io.observe(el));
  addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
})();

// Phone menu.
(() => {
  const btn = document.querySelector('.menu-word');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const nav = btn.closest('nav');
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
})();

// The live thing: your business name becomes a web address and a search result.
(() => {
  const name = document.getElementById('biz-name');
  const town = document.getElementById('biz-town');
  if (!name) return;
  const out = {
    domain: document.querySelector('[data-out="domain"]'),
    url: document.querySelector('[data-out="url"]'),
    title: document.querySelector('[data-out="title"]'),
    query: document.querySelector('[data-out="query"]'),
    fav: document.querySelector('[data-out="fav"]'),
    fbTitle: document.querySelector('[data-out="fb-title"]'),
  };
  const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '').slice(0, 28) || 'yourbusiness';
  function render() {
    const n = name.value.trim() || 'Your Business';
    const t = town.value.trim() || 'your town';
    const s = slug(n);
    out.domain.textContent = s;
    out.url.textContent = `${s}.com`;
    out.title.textContent = `${n} | ${t}`;
    out.query.textContent = `${n.toLowerCase()} ${t.toLowerCase()}`;
    out.fav.textContent = n.charAt(0).toUpperCase();
    out.fbTitle.textContent = `${n} - Home | Facebook`;
  }
  name.addEventListener('input', render);
  town.addEventListener('input', render);
  document.fonts?.ready.then(render);
  render();
})();

// Work: each project's title tears at the seam as it passes the stage.
(() => {
  const projects = [...document.querySelectorAll('.project')];
  if (!projects.length || reduced) return;
  let ticking = false;
  function update() {
    ticking = false;
    const vh = innerHeight;
    for (const p of projects) {
      const r = p.getBoundingClientRect();
      const range = r.height - vh;
      if (r.bottom < -vh || r.top > vh * 2) continue;
      // t runs 1 (stage arriving) → 0 (centred) → -1 (leaving)
      const t = Math.max(-1, Math.min(1, 1 - 2 * (-r.top / range)));
      const pane = 0.2 * vh * t;
      p.querySelector('.pane.left').style.transform = `translateY(${pane}px)`;
      p.querySelector('.pane.right').style.transform = `translateY(${-pane}px)`;
    }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();

// Play the site films only while they are on screen.
(() => {
  const vids = document.querySelectorAll('video[data-autoplay]');
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !reduced) e.target.play().catch(() => {});
      else e.target.pause();
    }
  }, { threshold: 0.15 });
  vids.forEach((v) => io.observe(v));
})();

// Concept strip: drag to scroll with a mouse.
(() => {
  const strip = document.querySelector('.strip');
  if (!strip) return;
  let down = false, x0 = 0, s0 = 0;
  strip.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; s0 = strip.scrollLeft; });
  addEventListener('pointerup', () => { down = false; });
  strip.addEventListener('pointermove', (e) => { if (down) strip.scrollLeft = s0 - (e.clientX - x0); });
  strip.addEventListener('dragstart', (e) => e.preventDefault());
})();

// Packages: one stage, the selected plan's figure.
(() => {
  const tabs = [...document.querySelectorAll('.plan-names [role="tab"]')];
  if (!tabs.length) return;
  function select(tab) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('focus', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); tabs[(i + d + tabs.length) % tabs.length].focus(); }
    });
  });
  // Choosing a plan's button carries it into the contact form.
  document.querySelectorAll('[data-plan]').forEach((a) => a.addEventListener('click', () => {
    const sel = document.getElementById('f-package');
    if (sel) sel.value = a.dataset.plan;
  }));
  select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
})();

// Contact form → Web3Forms. Falls back to a normal POST without script.
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = form.querySelector('[name="access_key"]').value;
    if (!key || key.startsWith('YOUR_')) {
      status.textContent = 'This form is not connected yet. Add the Web3Forms access key.';
      return;
    }
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      const data = await res.json();
      if (data.success) { form.reset(); status.textContent = 'Got it. We will be in touch within a day.'; }
      else status.textContent = data.message || 'Something went wrong. Try again, or email us.';
    } catch {
      status.textContent = 'Could not send. Check your connection, or email us.';
    }
  });
})();

// Colour scheme tester: ?themes shows a picker; ?theme=<name> sets one. Remembered for this tab only.
(() => {
  const q = new URLSearchParams(location.search);
  let saved = null; try { saved = sessionStorage.getItem('theme'); } catch {}
  if (!q.has('themes') && !q.has('theme') && !saved) return;
  const root = document.documentElement;
  const themes = { oxblood: '#7d0c14', forest: '#1f4a33', navy: '#1c2f6b', tomato: '#c8431f', slate: '#23292b', plum: '#4b1d48' };
  const bar = document.createElement('div');
  bar.className = 'theme-picker'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Colour scheme');
  for (const [name, colour] of Object.entries(themes)) {
    const b = document.createElement('button');
    b.type = 'button'; b.title = name; b.setAttribute('aria-label', name); b.style.background = colour;
    b.setAttribute('aria-pressed', String((root.dataset.theme || 'oxblood') === name));
    b.addEventListener('click', () => {
      if (name === 'oxblood') delete root.dataset.theme; else root.dataset.theme = name;
      try { sessionStorage.setItem('theme', name); } catch {}
      bar.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    });
    bar.append(b);
  }
  document.body.append(bar);
})();
