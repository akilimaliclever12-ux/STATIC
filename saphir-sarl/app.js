(() => {
  const nav = document.getElementById('nav');
  document.getElementById('y').textContent = new Date().getFullYear();
  const pad = n => String(n).padStart(4, '0');

  function createStage(stage, folder) {
    const canvas = stage.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const scenes = [...stage.querySelectorAll('.scene')];
    const bar = stage.querySelector('.progress i');
    const loader = stage.querySelector('.loader');
    const pct = loader.querySelector('span');
    let frames = [], total = 0, current = -1, target = 0, smooth = 0, started = false;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      current = -1;
      draw(Math.round(smooth));
    }
    function draw(i) {
      const img = frames[i];
      if (!img || !img.complete || !img.naturalWidth || i === current) return;
      current = i;
      const cw = canvas.width, ch = canvas.height;
      const r = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * r, h = img.naturalHeight * r;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    function progress() {
      const rect = stage.getBoundingClientRect();
      const max = stage.offsetHeight - innerHeight;
      return Math.min(1, Math.max(0, -rect.top / max));
    }
    function loop() {
      const p = progress();
      target = p * (total - 1);
      smooth += (target - smooth) * 0.12;
      draw(Math.round(smooth));
      scenes.forEach(s => s.classList.toggle('on', p >= +s.dataset.from && p < +s.dataset.to));
      bar.style.height = (p * 100) + '%';
      requestAnimationFrame(loop);
    }
    async function start() {
      if (started) return; started = true;
      let meta;
      try { meta = await (await fetch(folder + '/meta.json')).json(); }
      catch { loader.textContent = 'Vidéo en préparation…'; return; }
      total = meta.count;
      let loaded = 0;
      frames = Array.from({ length: total }, (_, i) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loaded++;
          pct.textContent = Math.round(loaded / total * 100);
          if (i === 0) resize();
          if (loaded === total) loader.classList.add('done');
        };
        img.src = `${folder}/f${pad(i + 1)}.jpg`;
        return img;
      });
      addEventListener('resize', resize);
      resize();
      loop();
    }
    return { start };
  }

  // Stage 1 charge tout de suite ; stage 2 charge quand on approche.
  createStage(document.getElementById('top'), 'frames').start();
  const s2 = document.getElementById('etapes');
  const stage2 = createStage(s2, s2.dataset.frames);
  new IntersectionObserver((es, o) => {
    if (es.some(e => e.isIntersecting)) { stage2.start(); o.disconnect(); }
  }, { rootMargin: '300% 0px' }).observe(s2);

  addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 60), { passive: true });

  /* ---- Stats count-up ---- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '+';
    let t0;
    const tick = t => {
      t0 ??= t;
      const k = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (k === 1 ? suf : '');
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    io.unobserve(el);
  }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));

})();
