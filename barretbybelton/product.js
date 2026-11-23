(() => {
  /* Chaque produit pointe vers une photo du mannequin déjà habillé (tryon/looks/NN.jpg).
     Quand les vraies photos haute résolution arrivent, on remplace les fichiers : le code ne change pas. */
  const CATS = [
    { id: 'suit', k: 'c_suit', items: [
      { id: 'suit-2piece-navy', price: 600000 }, { id: 'suit-2piece-charcoal', price: 600000 }, { id: 'suit-2piece-wine', price: 620000 },
      { id: 'suit-3piece-navy', price: 760000 }, { id: 'suit-3piece-charcoal', price: 760000 } ] },
    { id: 'jacket', k: 'c_jacket', items: [
      { id: 'jacket-sb-navy', price: 380000 }, { id: 'jacket-db-charcoal', price: 450000 } ] },
    { id: 'top', k: 'c_top', items: [
      { id: 'shirt-white', price: 90000 }, { id: 'shirt-blue', price: 95000 }, { id: 'shirt-pink', price: 95000 },
      { id: 'shirt-pinstripe', price: 105000 }, { id: 'shirt-chambray', price: 100000 }, { id: 'shirt-ivory', price: 95000 },
      { id: 'shirt-french', price: 120000 }, { id: 'waistcoat-charcoal', price: 160000 } ] },
    { id: 'trs', k: 'c_trs', items: [
      { id: 'trousers-charcoal', price: 220000 }, { id: 'trousers-navy', price: 220000 }, { id: 'trousers-grey', price: 225000 },
      { id: 'trousers-black', price: 230000 }, { id: 'trousers-beige', price: 235000 }, { id: 'trousers-brown', price: 230000 } ] },
    { id: 'tie', k: 'c_tie', items: [
      { id: 'tie-burgundy', price: 35000 }, { id: 'tie-silver', price: 38000 }, { id: 'tie-green', price: 42000 },
      { id: 'tie-mustard', price: 38000 }, { id: 'bowtie-black', price: 40000 } ] },
    { id: 'shoes', k: 'c_shoes', items: [
      { id: 'shoes-oxford', price: 170000 }, { id: 'shoes-loafer', price: 180000 }, { id: 'shoes-wingtip-brown', price: 210000 },
      { id: 'shoes-loafer-tan', price: 190000 }, { id: 'shoes-monk-oxblood', price: 230000 }, { id: 'shoes-monk-black', price: 220000 },
      { id: 'boots-chelsea-tan', price: 260000 } ] }
  ];
  CATS.forEach(c => c.items.forEach(i => { i.k = 'p_' + i.id; }));
  const PER = 6;
  const SIZES = [
    { id: 'S', chest: 92, waist: 78, shoulder: 44 }, { id: 'M', chest: 100, waist: 86, shoulder: 46 },
    { id: 'L', chest: 108, waist: 94, shoulder: 48 }, { id: 'XL', chest: 116, waist: 102, shoulder: 50 },
    { id: 'XXL', chest: 124, waist: 110, shoulder: 52 }
  ];
  const MEAS = [
    { id: 'height', k: 'm_height', min: 160, max: 195, v: 178 },
    { id: 'chest', k: 'm_chest', min: 84, max: 130, v: 100 },
    { id: 'waist', k: 'm_waist', min: 70, max: 120, v: 86 },
    { id: 'shoulder', k: 'm_shoulder', min: 40, max: 54, v: 46 },
    { id: 'sleeve', k: 'm_sleeve', min: 56, max: 70, v: 63 },
    { id: 'jacket', k: 'm_jacket', min: 66, max: 84, v: 74 },
    { id: 'inseam', k: 'm_inseam', min: 74, max: 90, v: 81 }
  ];
  const S = { page: 0, cat: 'suit', item: 'suit-2piece-navy', unit: 'cm', front: 'A', m: Object.fromEntries(MEAS.map(x => [x.id, x.v])) };

  const $ = id => document.getElementById(id);
  const fmt = cm => S.unit === 'cm' ? `${Math.round(cm)} cm` : `${(cm * 0.3937).toFixed(1)} in`;
  const money = n => 'TSh ' + n.toLocaleString(getLang() === 'sw' ? 'sw-TZ' : 'en-GB');
  const cat = () => CATS.find(c => c.id === S.cat);
  const all = () => CATS.flatMap(c => c.items.map(i => ({ ...i, cat: c })));
  const cur = () => all().find(i => i.id === S.item);
  const nearestSize = () => SIZES.reduce((a, b) => Math.abs(b.chest - S.m.chest) < Math.abs(a.chest - S.m.chest) ? b : a).id;

  function show(look) {
    const next = S.front === 'A' ? 'B' : 'A', imgN = $('img' + next), imgF = $('img' + S.front);
    const url = `tryon/looks/${look}.jpg`;
    const done = () => { imgN.classList.add('on'); imgF.classList.remove('on'); S.front = next; };
    imgN.onload = done; imgN.src = url;
    if (imgN.complete && imgN.naturalWidth) done();
  }

  function tabs() {
    $('tabs').innerHTML = CATS.map(c => `<button data-cat="${c.id}" class="${c.id === S.cat ? 'on' : ''}">${t(c.k)}</button>`).join('');
  }
  const maxPage = () => Math.max(0, Math.ceil(cat().items.length / PER) - 1);
  function cards() {
    const items = cat().items.slice(S.page * PER, S.page * PER + PER);
    const card = (it, i) => `<button class="card ${it.id === S.item ? 'on' : ''}" data-item="${it.id}" style="--i:${i}">
      <img src="tryon/products/${it.id}.jpg" onerror="this.onerror=null;this.src='tryon/thumbs/${it.id}.jpg'" alt=""><span>${t(it.k)}</span><b>${money(it.price)}</b>${it.id === S.item ? `<em>${t('worn')}</em>` : ''}</button>`;
    const L = items.filter((_, i) => i % 2 === 0), R = items.filter((_, i) => i % 2 === 1);
    $('cardsL').innerHTML = L.map(card).join('');
    $('cardsR').innerHTML = R.map(card).join('');
    const n = maxPage();
    $('pager').innerHTML = n ? `<button data-page="prev" ${S.page === 0 ? 'disabled' : ''}>&#8249;</button><span>${S.page + 1} / ${n + 1}</span><button data-page="next" ${S.page === n ? 'disabled' : ''}>&#8250;</button>` : '';
  }
  function bar() {
    const it = cur();
    $('pCat').textContent = t(it.cat.k);
    $('pName').textContent = t(it.k);
    $('pPrice').textContent = money(it.price);
    $('sSize').textContent = nearestSize() + ' (EU ' + 2 * Math.round(S.m.chest / 4) + ')';
    $('sReady').textContent = '14 ' + t('days');
    $('sizes').innerHTML = SIZES.map(s => `<button data-size="${s.id}" class="${nearestSize() === s.id ? 'on' : ''}">${s.id}</button>`).join('');
    $('units').innerHTML = ['cm', 'in'].map(u => `<button data-u="${u}" class="${S.unit === u ? 'on' : ''}">${u}</button>`).join('');
    const keep = $('sliders').querySelector('input:focus');
    if (!keep) $('sliders').innerHTML = MEAS.map(x => `
      <div class="row" data-id="${x.id}"><label for="r_${x.id}">${t(x.k)}</label>
      <input type="range" id="r_${x.id}" min="${x.min}" max="${x.max}" value="${S.m[x.id]}"><output id="o_${x.id}">${fmt(S.m[x.id])}</output></div>`).join('');
    const L = [t('wa_msg'), '', `${t('i_jsb') && ''}${t(it.cat.k)}: ${t(it.k)}`, `${t('sum_price')}: ${money(it.price)}`, '',
      `${t('size_h')}: ${nearestSize()} (EU ${2 * Math.round(S.m.chest / 4)})`, ...MEAS.map(x => `${t(x.k)}: ${Math.round(S.m[x.id])} cm`)];
    $('send').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(L.join('\n'));
  }
  function all_() { tabs(); cards(); bar(); }

  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.cat) { S.cat = b.dataset.cat; S.page = 0; S.item = cat().items[0].id; show(cur().id); }
    else if (b.dataset.page) { S.page = Math.max(0, Math.min(maxPage(), S.page + (b.dataset.page === 'next' ? 1 : -1))); }
    else if (b.dataset.item) { S.item = b.dataset.item; show(cur().id); }
    else if (b.dataset.size) { const z = SIZES.find(s => s.id === b.dataset.size); S.m.chest = z.chest; S.m.waist = z.waist; S.m.shoulder = z.shoulder; }
    else if (b.dataset.u) S.unit = b.dataset.u;
    else return;
    all_();
  });
  document.addEventListener('input', e => {
    const r = e.target; if (r.type !== 'range') return;
    const id = r.closest('.row').dataset.id; S.m[id] = +r.value;
    $('o_' + id).textContent = fmt(S.m[id]);
    $('sSize').textContent = nearestSize() + ' (EU ' + 2 * Math.round(S.m.chest / 4) + ')';
    $('sizes').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.size === nearestSize()));
    bar_link();
  });
  function bar_link() {
    const it = cur();
    const L = [t('wa_msg'), '', `${t(it.cat.k)}: ${t(it.k)}`, `${t('sum_price')}: ${money(it.price)}`, '',
      `${t('size_h')}: ${nearestSize()} (EU ${2 * Math.round(S.m.chest / 4)})`, ...MEAS.map(x => `${t(x.k)}: ${Math.round(S.m[x.id])} cm`)];
    $('send').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(L.join('\n'));
  }
  document.addEventListener('langchange', all_);
  all_(); $('imgA').src = `tryon/looks/${cur().id}.jpg`;
})();
