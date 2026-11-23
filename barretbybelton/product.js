(() => {
  const FABRICS = [
    { id: 'navy', c: '#14213d', k: 'f_navy', tier: 0 },
    { id: 'char', c: '#33363b', k: 'f_char', tier: 0 },
    { id: 'wine', c: '#5e1a2b', k: 'f_wine', tier: 1 },
    { id: 'olive', c: '#4a5230', k: 'f_olive', tier: 1 },
    { id: 'cream', c: '#d6cbb2', k: 'f_cream', tier: 2 }
  ];
  const STYLES = [{ id: 2, k: 'st2', base: 650000 }, { id: 3, k: 'st3', base: 820000 }];
  const FITS = [{ id: 'slim', k: 'fit_slim', ease: 4 }, { id: 'reg', k: 'fit_reg', ease: 7 }, { id: 'com', k: 'fit_com', ease: 11 }];
  const TIER_ADD = [0, 120000, 220000];
  const M = [
    { id: 'height', k: 'm_height', min: 150, max: 200, v: 175 },
    { id: 'chest', k: 'm_chest', min: 80, max: 130, v: 100 },
    { id: 'waist', k: 'm_waist', min: 66, max: 120, v: 86 },
    { id: 'shoulder', k: 'm_shoulder', min: 38, max: 56, v: 46 },
    { id: 'sleeve', k: 'm_sleeve', min: 54, max: 70, v: 63 },
    { id: 'jacket', k: 'm_jacket', min: 64, max: 86, v: 74 },
    { id: 'inseam', k: 'm_inseam', min: 70, max: 92, v: 81 }
  ];
  const S = { fabric: 'navy', style: 2, fit: 'reg', unit: 'cm', hot: null, m: Object.fromEntries(M.map(x => [x.id, x.v])) };

  const $ = id => document.getElementById(id);
  const fmt = cm => S.unit === 'cm' ? `${Math.round(cm)} cm` : `${(cm * 0.3937).toFixed(1)} in`;
  const money = n => 'TSh ' + n.toLocaleString(getLang() === 'sw' ? 'sw-TZ' : 'en-GB');
  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const f = v => Math.max(0, Math.min(255, v + amt));
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('');
  };

  function controls() {
    $('fabrics').innerHTML = FABRICS.map(f => `<button data-f="${f.id}" style="background:${f.c}" class="${S.fabric === f.id ? 'on' : ''}" aria-label="${t(f.k)}"></button>`).join('');
    $('fabname').textContent = t(FABRICS.find(f => f.id === S.fabric).k);
    $('styles').innerHTML = STYLES.map(s => `<button data-s="${s.id}" class="${S.style === s.id ? 'on' : ''}">${t(s.k)}</button>`).join('');
    $('fits').innerHTML = FITS.map(f => `<button data-fit="${f.id}" class="${S.fit === f.id ? 'on' : ''}">${t(f.k)}</button>`).join('');
    $('units').innerHTML = ['cm', 'in'].map(u => `<button data-u="${u}" class="${S.unit === u ? 'on' : ''}">${u}</button>`).join('');
    $('sliders').innerHTML = M.map(x => `
      <div class="row" data-id="${x.id}">
        <label for="r_${x.id}">${t(x.k)}</label>
        <input type="range" id="r_${x.id}" min="${x.min}" max="${x.max}" value="${S.m[x.id]}">
        <output id="o_${x.id}">${fmt(S.m[x.id])}</output>
      </div>`).join('');
  }

  function draw() {
    const m = S.m, fab = FABRICS.find(f => f.id === S.fabric), ease = FITS.find(f => f.id === S.fit).ease;
    const s = 2.7 + (m.height - 150) / 50 * 0.4, cx = 180;
    const neckY = 52, shY = neckY + 4 * s, chestY = shY + 24 * s, waistY = neckY + 44 * s, hemY = neckY + m.jacket * s;
    const hn = 6 * s, hs = m.shoulder * s / 2, hc = (m.chest / 2 + ease) * s / 2, hw = (m.waist / 2 + ease) * s / 2, hh = hw + 2 * s;
    const cuffY = shY + m.sleeve * s, cuffW = 9 * s, crotchY = waistY + 27 * s, legEnd = crotchY + m.inseam * s;
    const hwT = (m.waist / 2 + 5) * s / 2;
    const c = fab.c, dark = shade(c, -22), light = shade(c, 20), stroke = shade(c, 38);
    const hot = id => S.hot === id;
    const g = (id, inner) => `<g opacity="${hot(id) ? 1 : 0.42}" stroke="${hot(id) ? '#c9a26a' : '#f2ead8'}" stroke-width="${hot(id) ? 1.6 : 1}" fill="none" stroke-dasharray="4 3">${inner}</g>`;
    const label = (x, y, txt, id) => `<g><rect x="${x - 30}" y="${y - 11}" width="60" height="18" rx="2" fill="#0a0f16" opacity=".85"/><text x="${x}" y="${y + 2}" fill="${hot(id) ? '#c9a26a' : '#f2ead8'}" font-size="11" font-family="Inter,sans-serif" text-anchor="middle" font-weight="600">${txt}</text></g>`;

    const legL = `${cx - hwT},${waistY} ${cx - hwT + 4},${legEnd} ${cx - hwT + 4 + 18 * s},${legEnd} ${cx - 3},${crotchY} ${cx},${waistY}`;
    const legR = `${cx + hwT},${waistY} ${cx + hwT - 4},${legEnd} ${cx + hwT - 4 - 18 * s},${legEnd} ${cx + 3},${crotchY} ${cx},${waistY}`;
    const body = `${cx - hn},${neckY} ${cx - hs},${shY} ${cx - hc},${chestY} ${cx - hw},${waistY} ${cx - hh},${hemY} ${cx + hh},${hemY} ${cx + hw},${waistY} ${cx + hc},${chestY} ${cx + hs},${shY} ${cx + hn},${neckY}`;
    const vTip = waistY - 8;
    const shirt = `${cx - hn},${neckY} ${cx + hn},${neckY} ${cx},${vTip}`;
    const vest = S.style === 3 ? `<polygon points="${cx - hn + 3},${neckY + 30} ${cx + hn - 3},${neckY + 30} ${cx},${vTip + 24} " fill="${dark}"/><polygon points="${cx - hn},${neckY + 26} ${cx + hn},${neckY + 26} ${cx + hn - 2},${vTip + 10} ${cx},${vTip + 28} ${cx - hn + 2},${vTip + 10}" fill="${shade(c, -10)}" stroke="${stroke}" stroke-width=".8"/>` : '';
    const lapL = `${cx - hn},${neckY} ${cx - hn - 16},${neckY + 52} ${cx - 4},${vTip + 2} ${cx - 2},${vTip - 28}`;
    const lapR = `${cx + hn},${neckY} ${cx + hn + 16},${neckY + 52} ${cx + 4},${vTip + 2} ${cx + 2},${vTip - 28}`;
    const slL = `${cx - hs},${shY} ${cx - hs - 14},${cuffY} ${cx - hs - 14 + cuffW},${cuffY} ${cx - hc + 5},${chestY + 10}`;
    const slR = `${cx + hs},${shY} ${cx + hs + 14},${cuffY} ${cx + hs + 14 - cuffW},${cuffY} ${cx + hc - 5},${chestY + 10}`;

    $('suit').innerHTML = `
      <polygon points="${legL}" fill="${dark}" stroke="${stroke}" stroke-width="1"/>
      <polygon points="${legR}" fill="${dark}" stroke="${stroke}" stroke-width="1"/>
      <polygon points="${body}" fill="${c}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>
      <polygon points="${shirt}" fill="#e9e4d8"/>
      ${vest}
      <polygon points="${lapL}" fill="${light}" stroke="${stroke}" stroke-width=".8"/>
      <polygon points="${lapR}" fill="${light}" stroke="${stroke}" stroke-width=".8"/>
      <line x1="${cx}" y1="${vTip}" x2="${cx}" y2="${hemY}" stroke="${stroke}" stroke-width=".8"/>
      <polygon points="${slL}" fill="${c}" stroke="${stroke}" stroke-width="1" stroke-linejoin="round"/>
      <polygon points="${slR}" fill="${c}" stroke="${stroke}" stroke-width="1" stroke-linejoin="round"/>
      <circle cx="${cx - 4}" cy="${vTip + 22}" r="3" fill="#0a0f16"/><circle cx="${cx - 4}" cy="${vTip + 22 + 26}" r="3" fill="#0a0f16"/>
      ${g('shoulder', `<line x1="${cx - hs}" y1="${shY - 12}" x2="${cx + hs}" y2="${shY - 12}"/>`)}${label(cx, shY - 22, fmt(m.shoulder), 'shoulder')}
      ${g('chest', `<line x1="${cx - hc}" y1="${chestY}" x2="${cx + hc}" y2="${chestY}"/>`)}${label(cx - hc - 8 > 40 ? cx + hc - 24 : cx, chestY - 12, fmt(m.chest), 'chest')}
      ${g('waist', `<line x1="${cx - hw}" y1="${waistY}" x2="${cx + hw}" y2="${waistY}"/>`)}${label(cx, waistY + 14, fmt(m.waist), 'waist')}
      ${g('jacket', `<line x1="${cx + 100}" y1="${neckY}" x2="${cx + 100}" y2="${hemY}"/>`)}${label(cx + 100, (neckY + hemY) / 2, fmt(m.jacket), 'jacket')}
      ${g('sleeve', `<line x1="${cx - hs - 40}" y1="${shY}" x2="${cx - hs - 40}" y2="${cuffY}"/>`)}${label(cx - hs - 40, (shY + cuffY) / 2, fmt(m.sleeve), 'sleeve')}
      ${g('inseam', `<line x1="${cx + 14}" y1="${crotchY}" x2="${cx + 14}" y2="${legEnd}"/>`)}${label(cx + 14, (crotchY + legEnd) / 2, fmt(m.inseam), 'inseam')}
      ${g('height', `<line x1="342" y1="${neckY - 22}" x2="342" y2="${legEnd + 6}"/>`)}${label(330, (neckY + legEnd) / 2 + 60, fmt(m.height), 'height')}
    `;
  }

  function summary() {
    const st = STYLES.find(x => x.id === S.style), fab = FABRICS.find(f => f.id === S.fabric);
    const size = 2 * Math.round(S.m.chest / 4);
    $('sSize').textContent = 'EU ' + size;
    $('sPrice').textContent = money(st.base + TIER_ADD[fab.tier]);
    $('sReady').textContent = (S.style === 3 ? 16 : 14) + ' ' + t('days');
    const L = [t('wa_msg'), '',
      `${t('fabric')}: ${t(fab.k)}`, `${t('style')}: ${t(st.k)}`, `${t('fit')}: ${t(FITS.find(f => f.id === S.fit).k)}`, '',
      ...M.map(x => `${t(x.k)}: ${Math.round(S.m[x.id])} cm`), '',
      `${t('sum_size')}: EU ${size}`, `${t('sum_price')}: ${$('sPrice').textContent}`];
    $('send').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(L.join('\n'));
  }

  function refresh() { draw(); summary(); }

  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.f) S.fabric = b.dataset.f;
    else if (b.dataset.s) S.style = +b.dataset.s;
    else if (b.dataset.fit) S.fit = b.dataset.fit;
    else if (b.dataset.u) S.unit = b.dataset.u;
    else return;
    controls(); refresh();
  });
  document.addEventListener('input', e => {
    const r = e.target; if (r.type !== 'range') return;
    const id = r.closest('.row').dataset.id;
    S.m[id] = +r.value; S.hot = id;
    $('o_' + id).textContent = fmt(S.m[id]);
    refresh();
  });
  const setHot = (e, on) => {
    const row = e.target.closest && e.target.closest('.row'); if (!row) return;
    S.hot = on ? row.dataset.id : null;
    document.querySelectorAll('.row').forEach(r => r.classList.toggle('hot', r === row && on));
    draw();
  };
  document.addEventListener('pointerover', e => setHot(e, true));
  document.addEventListener('pointerout', e => setHot(e, false));
  document.addEventListener('focusin', e => setHot(e, true));
  document.addEventListener('focusout', e => setHot(e, false));
  document.addEventListener('langchange', () => { controls(); refresh(); });
  controls(); refresh();
})();
