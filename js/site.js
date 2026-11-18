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

// Concept strip: grab and throw with a mouse. Follows the pointer 1:1, then glides to a stop.
// Touch and trackpads keep the browser's own scrolling.
(() => {
  const strip = document.querySelector('.strip');
  if (!strip) return;
  let dragging = false, moved = 0, lastX = 0, lastT = 0, v = 0, raf = 0;
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  const glide = () => {
    v *= 0.94; // friction per frame
    if (Math.abs(v) < 0.05) { raf = 0; strip.classList.remove('gliding'); return; }
    strip.scrollLeft -= v * 16;
    raf = requestAnimationFrame(glide);
  };
  strip.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    stop();
    dragging = true; moved = 0; v = 0; lastX = e.clientX; lastT = e.timeStamp;
    strip.setPointerCapture(e.pointerId);
    strip.classList.add('dragging', 'gliding');
  });
  strip.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dt = Math.max(1, e.timeStamp - lastT);
    strip.scrollLeft -= dx;
    moved += Math.abs(dx);
    v = 0.8 * (dx / dt) + 0.2 * v; // px per ms, lightly smoothed
    lastX = e.clientX; lastT = e.timeStamp;
  });
  const release = (e) => {
    if (!dragging) return;
    dragging = false;
    strip.classList.remove('dragging');
    if (e.timeStamp - lastT > 80) v = 0; // held still before letting go: no throw
    if (reduced || !v) { strip.classList.remove('gliding'); return; }
    raf = requestAnimationFrame(glide);
  };
  strip.addEventListener('pointerup', release);
  strip.addEventListener('pointercancel', release);
  strip.addEventListener('wheel', stop, { passive: true });
  strip.addEventListener('click', (e) => { if (moved > 5) { e.preventDefault(); e.stopPropagation(); } }, true);
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

// Light / dark toggle. Starts light; a click is remembered on this device.
(() => {
  const btn = document.querySelector('.mode-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const label = btn.querySelector('.mode-label');
  const sync = () => {
    const next = root.dataset.mode === 'dark' ? 'Light' : 'Dark';
    label.textContent = next;
    btn.setAttribute('aria-label', `Switch to ${next.toLowerCase()} mode`);
  };
  btn.addEventListener('click', () => {
    root.dataset.mode = root.dataset.mode === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('mode', root.dataset.mode); } catch {}
    sync();
  });
  sync();
})();
