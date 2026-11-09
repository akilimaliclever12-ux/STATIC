(() => {
  const stage = document.getElementById('top');
  const bg = document.getElementById('bg');
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  const scenes = [...stage.querySelectorAll('.scene')];
  const dots = [...document.querySelectorAll('#steps li')];
  const count = document.getElementById('count');
  const loader = document.getElementById('loader');
  const pct = document.getElementById('pct');
  const nav = document.getElementById('nav');
  document.getElementById('y').textContent = new Date().getFullYear();

  const N = scenes.length;
  let frames = [], total = 0, current = -1, smooth = 0, activeScene = -1;
  const pad = n => String(n).padStart(4, '0');

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; current = -1;
  }
  function draw(i) {
    const img = frames[i];
    if (!img || !img.complete || !img.naturalWidth || i === current) return;
    current = i;
    const r = Math.max(cv.width / img.naturalWidth, cv.height / img.naturalHeight);
    const w = img.naturalWidth * r, h = img.naturalHeight * r;
    ctx.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
  }
  function progress() {
    const r = stage.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / (stage.offsetHeight - innerHeight)));
  }
  function loop() {
    const p = progress();
    if (total) { smooth += (p * (total - 1) - smooth) * 0.12; draw(Math.round(smooth)); }
    const idx = Math.min(N - 1, Math.floor(p * N));
    if (idx !== activeScene) {
      activeScene = idx;
      scenes.forEach((s, i) => s.classList.toggle('on', i === idx));
      dots.forEach((d, i) => d.classList.toggle('on', i === idx));
      bg.style.background = scenes[idx].dataset.bg;
      count.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
    }
    nav.classList.toggle('solid', scrollY > 60);
    requestAnimationFrame(loop);
  }

  async function init() {
    resize(); addEventListener('resize', resize);
    let meta = null;
    try { const r = await fetch('frames/meta.json'); if (r.ok) meta = await r.json(); } catch {}
    if (!meta || !meta.count) {          // pas encore de vidéo : fonds de couleur seulement
      loader.classList.add('done');
    } else {
      total = meta.count; let loaded = 0;
      frames = Array.from({ length: total }, (_, i) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          pct.textContent = Math.round(++loaded / total * 100);
          if (i === 0) draw(0);
          if (loaded === total) loader.classList.add('done');
        };
        img.src = `frames/f${pad(i + 1)}.jpg`;
        return img;
      });
    }
    loop();
  }

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '+';
    let t0;
    const tick = t => {
      t0 ??= t; const k = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString('fr-FR') + (k === 1 ? suf : '');
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick); io.unobserve(el);
  }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));

  init();
})();
