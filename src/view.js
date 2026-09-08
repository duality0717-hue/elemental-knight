(() => {
  'use strict';
  const root = document.getElementById('ember-dungeon'), $ = selector => root.querySelector(selector);
  const { Game, ITEMS, ATTRS } = globalThis.ElementalEngine, game = new Game();
  const canvas = $('#ek-canvas'), painter = new globalThis.ElementalPainter(canvas);
  let panel = false, pausedBeforePanel = false, keys = {}, last = 0, lastRevision = -1, hudTimer = 0;
  const node = (tag, className, text) => { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; };
  function button(text, callback, disabled = false, label) {
    const b = node('button', '', text); b.type = 'button'; b.disabled = disabled;
    if (label) b.setAttribute('aria-label', label);
    b.onclick = () => { callback(); refresh(); }; return b;
  }
  function icon(item) { const e = node('canvas', 'ek-icon'); e.width = e.height = 20; e.setAttribute('aria-hidden', 'true'); painter.icon(e, item); return e; }
  function updateHud() {
    const s = game.stats(), h = game.hero;
    $('#ek-life').textContent = 'Vida ' + Math.ceil(h.hp) + '/' + s.maxHp;
    $('#ek-energy').textContent = 'Energía ' + Math.floor(h.stamina) + '/' + s.maxEnergy;
    $('#ek-gold').textContent = h.gold + ' oro'; $('#ek-points').textContent = h.points + ' puntos libres';
    $('#ek-room').textContent = 'Sala ' + game.room + '/5' + (game.boss ? ' · Dragón' : '');
    const odds = game.chances();
    $('#ek-chances').textContent = 'Cofres: equipo ' + Math.round(odds.gear * 100) + '% · poción ' + Math.round(odds.potion * 100) + '% · resto oro';
    $('#ek-kills').textContent = 'Esqueletos ' + game.kills + '/18';
  }
  function inventory() {
    const statBox = $('#ek-stat-list'); statBox.replaceChildren();
    $('#ek-available').textContent = game.hero.points + ' puntos disponibles para distribuir';
    for (const [key, def] of Object.entries(ATTRS)) {
      const row = node('div', 'ek-stat'), title = node('strong', '', def.name + ' · ' + game.hero.attributes[key] + '/100'); title.style.color = def.color;
      const plus = button('+', () => game.invest(key), !game.canManage() || !game.hero.points || game.hero.attributes[key] >= 100, 'Sumar un punto a ' + def.name);
      const track = node('div', 'ek-stat-track'), fill = node('span'); fill.style.width = game.hero.attributes[key] + '%'; fill.style.background = def.color; track.append(fill);
      row.append(title, node('small', '', def.detail), plus, track); statBox.append(row);
    }
    const s = game.stats(), derived = $('#ek-derived'); derived.replaceChildren();
    for (const text of ['Daño: ' + s.damage, 'Protección: ' + s.armor, 'Vida máxima: ' + s.maxHp, 'Energía máxima: ' + s.maxEnergy,
      'Ataques/seg: ' + (1 / s.delay).toFixed(1), 'Regeneración: 4 vida/seg']) derived.append(node('span', '', text));
    const slotBox = $('#ek-slots'); slotBox.replaceChildren();
    ITEMS.forEach((def, slot) => {
      const item = game.equipped[slot], card = node('div', 'ek-slot');
      card.append(node('span', 'ek-slot-label', def.group + ' · ' + def.slot), icon(item || { kind: 'empty', slot }), node('span', 'ek-item-name' + (!item ? ' ek-empty' : ''), item ? game.itemName(item) : 'Vacío'));
      if (item) card.append(button('Quitar', () => game.unequip(slot), !game.canManage(), 'Quitar ' + def.name));
      slotBox.append(card);
    });
    $('#ek-count').textContent = game.equipped.filter(Boolean).length + '/8';
    $('#ek-bonuses').textContent = 'Hierro ' + game.equipped.slice(0, 4).filter(Boolean).length + '/4: +2 protección. Escarcha ' + game.equipped.slice(4).filter(Boolean).length + '/4: +10 contra fuego.';
    const backpack = $('#ek-inventory'); backpack.replaceChildren(); $('#ek-bag-count').textContent = '(' + game.bag.length + ')';
    if (!game.bag.length) backpack.append(node('p', 'ek-muted', 'Vacía. Acá aparecen piezas y pociones de los cofres.'));
    for (const item of game.bag) {
      const isPotion = item.kind === 'potion';
      const card = button('', () => isPotion ? game.drink(item.id) : game.equip(item.id), !game.canManage(), (isPotion ? 'Usar ' : 'Equipar ') + game.itemName(item));
      card.className = 'ek-bag-item';
      card.title = game.itemName(item) + ' · ' + (isPotion ? '+' + item.power + ' puntos' + (item.attribute === 'vitality' ? ' y cura 35%' : '') : ITEMS[item.slot].detail);
      const name = node('span', '', isPotion ? ATTRS[item.attribute].name + ' +' + item.power : ITEMS[item.slot].slot + (item.rank > 1 ? ' +' + item.rank : ''));
      if (isPotion) name.style.color = ATTRS[item.attribute].color;
      card.append(icon(item), name);
      backpack.append(card);
    }
  }
  function shop() {
    const stock = $('#ek-shop-stock'); stock.replaceChildren();
    for (const item of game.stock) {
      const card = node('div', 'ek-offer'); card.append(icon(item), node('strong', '', game.itemName(item)), node('small', '', ITEMS[item.slot].slot + ' · ' + ITEMS[item.slot].detail),
        button(item.sold ? 'Vendido' : 'Comprar · ' + item.price + ' oro', () => game.buy(item.id), item.sold || game.hero.gold < item.price)); stock.append(card);
    }
    const chests = $('#ek-shop-chests'); chests.replaceChildren();
    game.chests.forEach((chest, i) => chests.append(button(chest.open ? 'Cofre ' + (i + 1) + ' abierto' : 'Abrir cofre ' + (i + 1), () => game.openChest(i), chest.open)));
  }
  function refresh() {
    const focused = document.activeElement?.getAttribute?.('aria-label');
    $('#ek-world').hidden = panel || game.mode === 'shop'; $('#ek-character').hidden = !panel; $('#ek-shop').hidden = panel || game.mode !== 'shop';
    $('#ek-panel').setAttribute('aria-expanded', String(panel)); $('#ek-message').textContent = game.message;
    $('#ek-start').textContent = game.mode === 'ready' ? 'Entrar a la cripta' : 'Reiniciar';
    $('#ek-attack').textContent = (game.rank(4) ? 'Espada' : 'Puños') + ' · Espacio';
    $('#ek-attack').disabled = !game.active(); $('#ek-dash').disabled = !game.active();
    $('#ek-open').disabled = panel || !['play', 'reward'].includes(game.mode);
    $('#ek-pause').disabled = panel || !['play', 'boss', 'reward'].includes(game.mode);
    $('#ek-pause').textContent = game.paused ? 'Seguir' : 'Pausa';
    updateHud(); if (panel) inventory(); if (game.mode === 'shop' && !panel) shop();
    if (panel && focused) { for (const b of root.querySelectorAll('[aria-label]')) if (b.getAttribute('aria-label') === focused && !b.disabled) { b.focus({ preventScroll: true }); break; } }
    lastRevision = game.revision;
  }
  function togglePanel() {
    keys = {};
    if (!panel) { pausedBeforePanel = game.paused; game.paused = true; panel = true; }
    else { panel = false; game.paused = pausedBeforePanel; }
    refresh();
    if (panel) { $('#ek-close').focus({ preventScroll: true }); $('#ek-character').scrollIntoView({ block: 'start' }); }
  }
  $('#ek-panel').onclick = $('#ek-close').onclick = $('#ek-shop-build').onclick = togglePanel;
  $('#ek-start').onclick = () => { panel = false; keys = {}; game.reset(); refresh(); };
  $('#ek-pause').onclick = () => { keys = {}; game.paused = !game.paused; refresh(); };
  $('#ek-enter-boss').onclick = () => { game.enterBoss(); keys = {}; refresh(); };
  $('#ek-open').onclick = () => { game.openChest(); refresh(); };
  $('#ek-dash').onclick = () => { game.dash(); updateHud(); };
  $('#ek-attack').onclick = () => game.strike();
  $('#ek-attack').onpointerdown = e => { e.preventDefault(); if (!game.active()) return; keys.hit = true; e.currentTarget.setPointerCapture(e.pointerId); game.strike(); };
  $('#ek-attack').onpointerup = $('#ek-attack').onpointercancel = () => { keys.hit = false; };
  for (const b of root.querySelectorAll('[data-dir]')) { b.onpointerdown = e => { e.preventDefault(); keys[b.dataset.dir] = true; b.setPointerCapture(e.pointerId); }; b.onpointerup = b.onpointercancel = () => { keys[b.dataset.dir] = false; }; }
  const map = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat) togglePanel(); return; }
    if (e.key === 'Escape' && panel) { e.preventDefault(); togglePanel(); return; }
    if (panel) return;
    const k = map[e.key] || map[e.key.toLowerCase()]; if (k) { e.preventDefault(); keys[k] = true; }
    if (e.code === 'Space' && game.active()) { e.preventDefault(); keys.hit = true; game.strike(); }
    if (e.key.toLowerCase() === 'e' && !e.repeat) { game.openChest(); refresh(); }
    if (e.key === 'Shift' && !e.repeat) { e.preventDefault(); game.dash(); }
  });
  document.addEventListener('keyup', e => { const k = map[e.key] || map[e.key.toLowerCase()]; if (k) keys[k] = false; if (e.code === 'Space') keys.hit = false; });
  function blur() { keys = {}; if (game.active() || game.mode === 'reward') { game.paused = true; refresh(); } }
  window.addEventListener('blur', blur); document.addEventListener('visibilitychange', () => { if (document.hidden) blur(); });
  canvas.onpointerdown = e => { if (!game.active()) return; const r = canvas.getBoundingClientRect(); game.hero.face = Math.atan2((e.clientY - r.top) * 272 / r.height - game.hero.y, (e.clientX - r.left) * 480 / r.width - game.hero.x); game.strike(); };
  refresh();
  function frame(now) { const dt = Math.min(.035, (now - last) / 1000 || 0); last = now; game.tick(dt, keys); painter.draw(game);
    hudTimer += dt; if (hudTimer > .12) { updateHud(); hudTimer = 0; } if (lastRevision !== game.revision) refresh(); requestAnimationFrame(frame); }
  requestAnimationFrame(frame);
})();
