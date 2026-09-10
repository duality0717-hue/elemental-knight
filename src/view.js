(() => {
  'use strict';
  const root = document.getElementById('ember-dungeon'), $ = selector => root.querySelector(selector);
  const { Game, ITEMS, ATTRS, CLASSES } = globalThis.ElementalEngine;
  let game = new Game();
  const canvas = $('#ek-canvas'), painter = new globalThis.ElementalPainter(canvas);
  let panel = false, pausedBeforePanel = false, keys = {}, last = 0, lastRevision = -1, hudTimer = 0;
  const saveKey='elemental-knight-save-v1'+(location.pathname.includes('/.qa/')?':qa:'+location.pathname:'');
  let storedSave=null,saveTimer=0,expandedFallback=false;
  try{storedSave=globalThis.ElementalSave.decode(localStorage.getItem(saveKey));}catch{}
  function saveGame(manual=false){
    const data=globalThis.ElementalSave.encode(game);if(!data)return false;
    try{localStorage.setItem(saveKey,data);storedSave=true;$('#ek-save-status').textContent=(manual?'Partida guardada':'Guardado automático')+' · '+new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});return true;}
    catch{if(manual)$('#ek-save-status').textContent='El navegador no permite guardar acá. Abrí index.html en tu navegador.';return false;}
  }
  function fitCanvas(){
    if(!root.classList.contains('ek-expanded')){canvas.style.width='';canvas.style.height='';return;}
    if($('#ek-world').hidden)return;
    const box=$('#ek-world'),width=Math.max(1,Math.min(box.clientWidth,box.clientHeight*480/272));
    canvas.style.width=width+'px';canvas.style.height=(width*272/480)+'px';
  }
  function fullscreenState(){
    const expanded=document.fullscreenElement===root||expandedFallback;
    root.classList.toggle('ek-expanded',expanded);root.classList.toggle('ek-full-window',expandedFallback);
    $('#ek-fullscreen').textContent=expanded?'⛶ Salir de pantalla completa':'⛶ Pantalla completa';$('#ek-fullscreen').setAttribute('aria-pressed',String(expanded));
    keys={};requestAnimationFrame(fitCanvas);
  }
  $('#ek-fullscreen').onclick=async()=>{
    try{if(document.fullscreenElement===root)await document.exitFullscreen();else if(expandedFallback)expandedFallback=false;else if(root.requestFullscreen&&document.fullscreenEnabled)await root.requestFullscreen();else expandedFallback=true;}
    catch{expandedFallback=true;$('#ek-save-status').textContent='Vista ampliada. Para ocupar toda la pantalla, abrí el juego en tu navegador.';}
    fullscreenState();
  };
  document.addEventListener('fullscreenchange',fullscreenState);
  new ResizeObserver(fitCanvas).observe($('#ek-world'));
  $('#ek-save').onclick=()=>saveGame(true);
  $('#ek-load').onclick=()=>{
    let recovered;try{recovered=globalThis.ElementalSave.decode(localStorage.getItem(saveKey));}catch{}
    if(!recovered){$('#ek-save-status').textContent='No se pudo recuperar la partida.';return;}
    game=recovered;panel=false;keys={};lastRevision=-1;refresh();$('#ek-save-status').textContent='Partida recuperada'+(game.paused?' · Tocá Seguir para jugar.':'.');
  };
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
    $('#ek-room').textContent = 'Cap. ' + game.chapter + ' · Nivel ' + s.level + ' · Sala ' + game.room + '/5';
    $('#ek-life').classList.toggle('ek-poisoned',game.hero.poison>0);
    const odds = game.chances();
    $('#ek-chances').textContent = 'Cofres: equipo ' + Math.round(odds.gear * 100) + '% · poción ' + Math.round(odds.potion * 100) + '% · resto oro';
    $('#ek-kills').textContent = 'Esqueletos del capítulo ' + game.chapterKills + '/18';
  }
  function inventory() {
    painter.portrait($('#ek-portrait'),game);
    $('#ek-identity').textContent=game.hero.specialization?CLASSES[game.hero.specialization].name+' · '+CLASSES[game.hero.specialization].title:'Sin especialización · Nivel '+game.stats().level;
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
      'Ataques/seg: ' + (1 / s.delay).toFixed(2), 'Movimiento: ' + s.speed.toFixed(1),
      'Cura por acierto: hasta ' + s.lifeOnHit.toFixed(2), 'Límite: 8% del daño real',
      'Nivel ' + s.level + ' · +1 cada 5 esqueletos', 'Un ataque acertado = una curación']) derived.append(node('span', '', text));
    derived.append(node('span', 'ek-heal-formula', 'Curación = 0,6 + 0,03(V−1) + 0,015(F−1) + 0,01(A−1) + 0,1(nivel−1). V: vitalidad · F: fuerza · A: agilidad.'));
    const slotBox = $('#ek-slots'); slotBox.replaceChildren();
    ITEMS.forEach((def, slot) => {
      const item = game.equipped[slot], card = node('div', 'ek-slot');
      card.append(node('span', 'ek-slot-label', def.group + ' · ' + def.slot), icon(item || { kind: 'empty', slot }), node('span', 'ek-item-name' + (!item ? ' ek-empty' : ''), item ? game.itemName(item) : 'Vacío'));
      if(item){card.dataset.rank=item.rank;card.append(node('small','ek-item-detail',ITEMS[slot].detail+' · Rango '+item.rank));}
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
    $('#ek-save').disabled=['ready','dead'].includes(game.mode);
    $('#ek-load').hidden=!storedSave||!['ready','dead'].includes(game.mode);
    const focused = document.activeElement?.getAttribute?.('aria-label');
    $('#ek-world').hidden = panel || ['shop','awakening'].includes(game.mode); $('#ek-character').hidden = !panel; $('#ek-shop').hidden = panel || game.mode !== 'shop';
    $('#ek-awakening').hidden=panel || game.mode!=='awakening';
    $('#ek-title').textContent=game.chapter===2?'La catedral de la peste':'La Cripta de Brasas';
    $('#ek-next-chapter').hidden=panel||game.mode!=='chapter-complete';
    $('#ek-exploration').hidden=panel||game.chapter!==2||!game.zones||game.mode!=='play';
    if(!$('#ek-exploration').hidden)exploration();
    $('#ek-enter-boss').textContent=game.chapter===2?'Enfrentar al guerrero de la peste →':'Enfrentar a mi sombra →';
    $('#ek-panel').setAttribute('aria-expanded', String(panel)); $('#ek-message').textContent = game.message;
    $('#ek-start').textContent = game.mode === 'ready' ? 'Entrar a la cripta' : 'Reiniciar';
    $('#ek-attack').textContent = (game.chapter===2&&game.hero.specialization==='mage'?'Hielo':game.chapter===2&&game.hero.specialization==='rogue'?'Flecha':game.rank(4)?'Espada':'Puños') + ' · Espacio';
    $('#ek-attack').disabled = !game.active(); $('#ek-dash').disabled = !game.active();
    $('#ek-open').disabled = panel || !['play', 'reward'].includes(game.mode);
    $('#ek-pause').disabled = panel || !['play', 'boss', 'reward'].includes(game.mode);
    $('#ek-pause').textContent = game.paused ? 'Seguir' : 'Pausa';
    updateHud(); if (panel) inventory(); if (game.mode === 'shop' && !panel) shop();
    if (panel && focused) { for (const b of root.querySelectorAll('[aria-label]')) if (b.getAttribute('aria-label') === focused && !b.disabled) { b.focus({ preventScroll: true }); break; } }
    lastRevision = game.revision;
    requestAnimationFrame(fitCanvas);
  }
  function exploration(){
    const z=game.zones[game.zoneId],dirs={up:'arriba',right:'derecha',down:'abajo',left:'izquierda'};
    $('#ek-location').textContent='Sala '+game.room+' · '+z.name;
    $('#ek-route').textContent=game.enemies.length?(game.enemies.length===1?'Derrotá al enemigo':'Derrotá a los '+game.enemies.length+' enemigos')+' para abrir las puertas.':'Puertas abiertas: '+Object.keys(z.doors).map(d=>dirs[d]).join(' · ')+'.';
    $('#ek-class-help').textContent=CLASSES[game.hero.specialization].name+' · '+({mage:'Lanzás hielo que ralentiza a los esbirros.',rogue:'Disparás flechas rápidas a distancia.',warrior:'Tu espada conserva el daño, alcance y efectos de tus artefactos.'}[game.hero.specialization])+' Apuntá con la dirección de movimiento o un clic en la mazmorra.';
    const visible=Object.values(game.zones).filter(n=>n.visited||Object.values(game.zones).some(v=>v.visited&&Object.values(v.doors).includes(n.id)));
    const minX=Math.min(...visible.map(n=>n.x)),minY=Math.min(...visible.map(n=>n.y)),maxX=Math.max(...visible.map(n=>n.x)),maxY=Math.max(...visible.map(n=>n.y));
    const map=$('#ek-map');map.replaceChildren();map.style.gridTemplateColumns='repeat('+(maxX-minX+1)+',28px)';map.style.gridTemplateRows='repeat('+(maxY-minY+1)+',28px)';
    for(const n of visible){const tile=node('span','ek-map-cell'+(n.id===z.id?' ek-current':n.visited?' ek-visited':''),n.id===z.id?'◆':!n.visited?'?':n.id==='exit'?'✦':'○');tile.style.gridColumn=n.x-minX+1;tile.style.gridRow=n.y-minY+1;tile.title=n.visited?n.name:'Anexo sin explorar';map.append(tile);}
    map.setAttribute('aria-label',visible.filter(n=>n.visited).length+' de 7 anexos explorados. Ubicación: '+z.name);
  }
  function togglePanel() {
    keys = {};
    if (!panel) { pausedBeforePanel = game.paused; game.paused = true; panel = true; }
    else { panel = false; game.paused = pausedBeforePanel; }
    refresh();
    if (panel) { $('#ek-close').focus({ preventScroll: true }); $('#ek-character').scrollIntoView({ block: 'start' }); }
  }
  let selectedClass='mage';
  for(const [key,def] of Object.entries(CLASSES)){
    const card=button('',()=>{selectedClass=key;for(const b of $('#ek-classes').children)b.setAttribute('aria-pressed',String(b.dataset.class===key));});
    card.dataset.class=key;card.setAttribute('aria-pressed',String(key===selectedClass));card.style.setProperty('--class-color',def.color);
    card.append(node('span','ek-class-sigil',{mage:'❄',rogue:'➶',warrior:'†'}[key]),node('strong','',def.name),node('small','',def.title),node('span','',def.detail));$('#ek-classes').append(card);
  }
  $('#ek-destiny').onsubmit=e=>{e.preventDefault();if(game.specialize($('#ek-name').value,selectedClass)){$('#ek-name-error').textContent='';keys={};refresh();}else $('#ek-name-error').textContent='Escribí un nombre de 1 a 20 caracteres.';};
  $('#ek-panel').onclick = $('#ek-close').onclick = $('#ek-shop-build').onclick = togglePanel;
  $('#ek-start').onclick = () => { panel = false; keys = {}; $('#ek-name').value=''; game.reset(); refresh(); };
  $('#ek-next-chapter').onclick=()=>{keys={};panel=false;game.beginChapter2();refresh();};
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
    if (document.querySelector('#ek-settings[open]')) return;
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||game.mode==='awakening') return;
    if(e.key==='Escape'&&expandedFallback){expandedFallback=false;fullscreenState();return;}
    if(e.key==='Enter'&&['ek-next-chapter','ek-start','ek-fullscreen','ek-save','ek-load'].includes(e.target.id))return;
    if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat) togglePanel(); return; }
    if (e.key === 'Escape' && panel) { e.preventDefault(); togglePanel(); return; }
    if (panel) return;
    const k = map[e.key] || map[e.key.toLowerCase()]; if (k) { e.preventDefault(); keys[k] = true; }
    if (e.code === 'Space' && game.active()) { e.preventDefault(); keys.hit = true; game.strike(); }
    if (e.key.toLowerCase() === 'e' && !e.repeat) { game.openChest(); refresh(); }
    if (e.key === 'Shift' && !e.repeat) { e.preventDefault(); game.dash(); }
  });
  document.addEventListener('keyup', e => { const k = map[e.key] || map[e.key.toLowerCase()]; if (k) keys[k] = false; if (e.code === 'Space') keys.hit = false; });
  function blur() { saveGame(); keys = {}; if (game.active() || game.mode === 'reward') { game.paused = true; refresh(); } }
  window.addEventListener('knight:settings', blur);
  window.addEventListener('pagehide',()=>saveGame());
  window.addEventListener('blur', blur); document.addEventListener('visibilitychange', () => { if (document.hidden) blur(); });
  canvas.onpointerdown = e => { if (!game.active()) return; const r = canvas.getBoundingClientRect(); game.hero.face = Math.atan2((e.clientY - r.top) * 272 / r.height - game.hero.y, (e.clientX - r.left) * 480 / r.width - game.hero.x); game.strike(); };
  refresh();
  function frame(now) { const dt = Math.min(.035, (now - last) / 1000 || 0); last = now; game.tick(dt, keys); painter.draw(game);
    saveTimer+=dt;if(saveTimer>=5){saveTimer=0;saveGame();}
    hudTimer += dt; if (hudTimer > .12) { updateHud(); hudTimer = 0; } if (lastRevision !== game.revision) refresh(); requestAnimationFrame(frame); }
  requestAnimationFrame(frame);
})();
