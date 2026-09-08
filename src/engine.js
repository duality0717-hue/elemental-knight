(function (scope) {
  'use strict';
  const ATTRS = {
    strength: { name: 'Fuerza', color: '#f46b71', detail: '+2 de daño por punto' },
    energy: { name: 'Energía', color: '#75b8ff', detail: '+2 de energía máxima por punto' },
    vitality: { name: 'Vitalidad', color: '#8bdc83', detail: '+6 de vida máxima por punto' },
    agility: { name: 'Agilidad', color: '#bc91f5', detail: 'Más movimiento y ataques más rápidos' }
  };
  const ITEMS = [
    { slot: 'Pechera', name: 'Coraza del guardián', group: 'Armadura', detail: 'Reduce daño recibido', basePrice: 90 },
    { slot: 'Botas', name: 'Botas del guardián', group: 'Armadura', detail: 'Más velocidad', basePrice: 65 },
    { slot: 'Casco', name: 'Yelmo del guardián', group: 'Armadura', detail: 'Reduce daño recibido', basePrice: 75 },
    { slot: 'Guantes', name: 'Guanteletes del guardián', group: 'Armadura', detail: 'Más daño', basePrice: 70 },
    { slot: 'Arma', name: 'Espada de escarcha', group: 'Artefactos', detail: 'Más alcance y ralentización', basePrice: 100 },
    { slot: 'Anillo', name: 'Anillo de hielo', group: 'Artefactos', detail: 'Más daño', basePrice: 80 },
    { slot: 'Pulsera', name: 'Pulsera del deshielo', group: 'Artefactos', detail: 'Ataques más rápidos', basePrice: 85 },
    { slot: 'Collar', name: 'Corazón de invierno', group: 'Artefactos', detail: 'Recupera vida por baja', basePrice: 95 }
  ];
  const ROOMS = ['La entrada carbonizada', 'El osario', 'El santuario ardiente', 'Las forjas hundidas', 'El trono de ceniza'];
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  class Game {
    constructor(random = Math.random) { this.random = random; this.reset(); this.mode = 'ready'; }
    reset() {
      this.nextId = 1; this.room = 1; this.kills = 0; this.mode = 'play'; this.paused = false;
      this.time = 0; this.attack = 0; this.cooldown = 0; this.dashTime = 0; this.dashCooldown = 0;
      this.hero = { x: 54, y: 136, face: 0, hp: 140, stamina: 52, gold: 0, points: 0, inv: 1.5, safe: 0,
        attributes: { strength: 1, energy: 1, vitality: 1, agility: 1 } };
      this.bag = []; this.equipped = Array(8).fill(null); this.stock = []; this.boss = null;
      this.effects = []; this.notices = []; this.revision = 0; this.rewardClaimed = false;
      this.spawnRoom(); this.say('Entrás sin equipo. Cada esqueleto da oro y 1 punto libre. Enter abre el personaje.');
    }
    say(text) { this.message = text; this.revision++; }
    rank(slot) { return this.equipped[slot]?.rank || 0; }
    stats() {
      const a = this.hero.attributes, r = i => this.rank(i);
      return { damage: (r(4) ? 24 + 6 * (r(4) - 1) : 18) + (a.strength - 1) * 2 + r(3) * 4 + r(5) * 6,
        maxHp: 140 + (a.vitality - 1) * 6, maxEnergy: 50 + a.energy * 2,
        armor: r(0) * 3 + r(2) * 2 + (this.equipped.slice(0, 4).every(Boolean) ? 2 : 0),
        speed: 92 + (a.agility - 1) * .5 + r(1) * 10,
        delay: Math.max(.17, .40 - (a.agility - 1) * .002 - r(6) * .045),
        range: r(4) ? 47 : 33, frost: this.equipped.slice(4).every(Boolean) };
    }
    chances() { return { gear: this.room * 5 / 100, potion: (15 + (this.room - 1) * 10) / 100 }; }
    spawnRoom() {
      this.hero.x = 54; this.hero.y = 136; this.hero.inv = 1.5; this.hero.face = 0;
      this.shots = []; this.hazards = []; this.effects = []; this.notices = [];
      this.chests = [{ x: 70, y: 60 }, { x: 236, y: 218 }, { x: 412, y: 64 }].map(p => ({ ...p, open: false }));
      this.enemies = Array.from({ length: this.room + 2 }, (_, i) => ({ x: 240 + (i % 2) * 110, y: 55 + Math.floor(i / 2) * 52,
        hp: 44 + this.room * 7, max: 44 + this.room * 7, slow: 0, fire: 2.5 + i * .75, warning: false }));
      this.revision++;
    }
    active() { return !this.paused && ['play', 'boss'].includes(this.mode); }
    canManage() { return !['dead', 'ready'].includes(this.mode); }
    invest(key) {
      if (!this.canManage() || !ATTRS[key] || this.hero.points < 1 || this.hero.attributes[key] >= 100) return false;
      const before = this.stats(); this.hero.points--; this.hero.attributes[key]++;
      this.hero.hp += this.stats().maxHp - before.maxHp;
      this.hero.stamina += this.stats().maxEnergy - before.maxEnergy;
      this.say(ATTRS[key].name + ' aumentó a ' + this.hero.attributes[key] + '/100.'); return true;
    }
    gear(slot, rank = 1) { return { id: this.nextId++, kind: 'gear', slot, rank }; }
    potion(attribute, power = this.room) { return { id: this.nextId++, kind: 'potion', attribute, power }; }
    itemName(item) { return item.kind === 'potion' ? 'Poción de ' + ATTRS[item.attribute].name.toLowerCase() : ITEMS[item.slot].name + (item.rank > 1 ? ' +' + item.rank : ''); }
    acquireGear(rank = 1) {
      const owned = new Set([...this.bag.filter(i => i.kind === 'gear'), ...this.equipped.filter(Boolean)].map(i => i.slot));
      const available = ITEMS.map((_, i) => i).filter(i => !owned.has(i));
      const pool = available.length ? available : ITEMS.map((_, i) => i);
      const item = this.gear(pool[Math.floor(this.random() * pool.length)], rank); this.bag.push(item); return item;
    }
    equip(id) {
      if (!this.canManage()) return false;
      const index = this.bag.findIndex(i => i.id === id && i.kind === 'gear'); if (index < 0) return false;
      const [item] = this.bag.splice(index, 1), old = this.equipped[item.slot];
      this.equipped[item.slot] = item; if (old) this.bag.push(old);
      this.say(this.itemName(item) + ' equipado manualmente.'); return true;
    }
    unequip(slot) {
      if (!this.canManage() || !this.equipped[slot]) return false;
      this.bag.push(this.equipped[slot]); this.equipped[slot] = null; this.say(ITEMS[slot].slot + ' enviado a la mochila.'); return true;
    }
    drink(id) {
      if (!this.canManage()) return false;
      const index = this.bag.findIndex(i => i.id === id && i.kind === 'potion'); if (index < 0) return false;
      const item = this.bag[index], before = this.stats(), added = Math.min(item.power, 100 - this.hero.attributes[item.attribute]);
      if (!added && !(item.attribute === 'vitality' && this.hero.hp < before.maxHp)) { this.say('Atributo al máximo. Conservás la poción.'); return false; }
      this.hero.attributes[item.attribute] += added;
      this.hero.hp += this.stats().maxHp - before.maxHp; this.hero.stamina += this.stats().maxEnergy - before.maxEnergy;
      if (item.attribute === 'vitality') this.hero.hp = Math.min(this.stats().maxHp, this.hero.hp + this.stats().maxHp * .35);
      if (item.attribute === 'energy') this.hero.stamina = this.stats().maxEnergy;
      if (added && added < item.power) item.power -= added; else this.bag.splice(index, 1);
      this.say(ATTRS[item.attribute].name + ' +' + added + (item.attribute === 'vitality' ? ' · Recuperaste vida.' : '.')); return true;
    }
    openChest(shopIndex) {
      if (this.paused || !['play', 'reward', 'shop'].includes(this.mode)) return false;
      const chest = this.mode === 'shop' ? this.chests[shopIndex] : this.chests.find(b => !b.open && Math.hypot(b.x - this.hero.x, b.y - this.hero.y) < 32);
      if (chest?.open) return false;
      if (!chest) { this.say('Acercate a un cofre y presioná E.'); return false; }
      chest.open = true;
      if (chest.luxury) {
        if (this.rewardClaimed) return false;
        this.rewardClaimed = true; const item = this.acquireGear(3); this.hero.gold += 200;
        for (const key of Object.keys(ATTRS)) this.bag.push(this.potion(key, 8));
        this.mode = 'won'; this.say('¡Victoria! Cofre lujoso: ' + this.itemName(item) + ', 200 de oro y cuatro pociones de +8.'); return true;
      }
      const roll = this.random(), chance = this.chances();
      if (roll < chance.gear) {
        const item = this.acquireGear(); this.say('Encontraste ' + this.itemName(item) + '. Equipalo desde la mochila con Enter.');
      } else if (roll < chance.gear + chance.potion) {
        const keys = Object.keys(ATTRS), item = this.potion(keys[Math.floor(this.random() * keys.length)]);
        this.bag.push(item); this.say(this.itemName(item) + ' (+' + item.power + ') en la mochila. Hacé clic para usarla.');
      } else {
        const gold = 10 + this.room * 6 + Math.floor(this.random() * 11); this.hero.gold += gold; this.say('Cofre: +' + gold + ' de oro.');
      }
      return true;
    }
    kill(enemy) {
      if (enemy.rewarded) return;
      enemy.rewarded = true; this.kills++; this.hero.points++;
      const gold = 4 + this.room * 2 + Math.floor(this.random() * 5); this.hero.gold += gold;
      if (this.rank(7)) this.hero.hp = Math.min(this.stats().maxHp, this.hero.hp + this.rank(7) * 6);
      this.notices.push({ x: enemy.x, y: enemy.y - 23, text: '+' + gold + ' oro · +1 punto', life: 1.2 }); this.revision++;
    }
    strike() {
      if (!this.active() || this.cooldown > 0) return;
      const s = this.stats(); this.cooldown = s.delay; this.attack = .18;
      for (const e of this.enemies) {
        const dx = e.x - this.hero.x, dy = e.y - this.hero.y, distance = Math.hypot(dx, dy);
        const dot = (dx * Math.cos(this.hero.face) + dy * Math.sin(this.hero.face)) / (distance || 1);
        if (e.hp > 0 && distance < s.range && (dot > -.15 || distance < 17)) {
          e.hp -= s.damage + (s.frost ? 10 : 0); e.slow = this.rank(4) ? 1.6 : 0;
          e.x = clamp(e.x + Math.cos(this.hero.face) * 11, 22, 458); e.y = clamp(e.y + Math.sin(this.hero.face) * 11, 32, 243);
          if (e.hp <= 0) this.kill(e);
        }
      }
      const previous = this.enemies.length; this.enemies = this.enemies.filter(e => e.hp > 0);
      if (previous && !this.enemies.length) { this.shots = []; this.hero.hp = Math.min(s.maxHp, this.hero.hp + 35); this.say('Sala despejada · +35 de vida. Revisá los cofres antes de avanzar.'); }
      if (this.mode === 'boss' && this.boss.hp > 0) {
        const dx = this.boss.x - this.hero.x, dy = this.boss.y - this.hero.y, dist = Math.hypot(dx, dy);
        if (dist < s.range + 27 && (dx * Math.cos(this.hero.face) + dy * Math.sin(this.hero.face)) / (dist || 1) > -.1) {
          this.boss.hp = Math.max(0, this.boss.hp - s.damage);
          this.boss.hit = .15;
          if (!this.boss.hp) { this.mode = 'reward'; this.shots = []; this.hazards = []; this.chests = [{ x: 330, y: 136, open: false, luxury: true }]; this.say('¡Cayó Terragrán! Acercate al cofre lujoso y abrilo con E.'); }
        }
      }
    }
    hurt(amount = 10 + this.room) {
      if (!this.active() || this.hero.inv > 0) return false;
      this.hero.hp = Math.max(0, this.hero.hp - Math.max(2, amount - this.stats().armor));
      this.hero.inv = 1.1; this.hero.safe = 0;
      if (!this.hero.hp) { this.mode = 'dead'; this.say('Caíste. Reiniciá para volver a intentarlo.'); }
      return true;
    }
    dash() {
      if (!this.active() || this.dashCooldown > 0 || this.hero.stamina < 20) return false;
      this.hero.stamina -= 20; this.dashTime = .17; this.dashCooldown = .7; this.hero.inv = Math.max(this.hero.inv, .35); return true;
    }
    enterShop() {
      if (this.mode === 'shop') return;
      this.room = 5; this.spawnRoom(); this.enemies = [];
      this.mode = 'shop'; this.shots = []; this.hero.hp = this.stats().maxHp; this.hero.stamina = this.stats().maxEnergy;
      const pool = ITEMS.map((_, i) => i); this.stock = [];
      for (let i = 0; i < 6; i++) { const slot = pool.splice(Math.floor(this.random() * pool.length), 1)[0], rank = this.random() < .3 ? 2 : 1;
        this.stock.push({ ...this.gear(slot, rank), price: ITEMS[slot].basePrice + (rank - 1) * 35, sold: false }); }
      this.say('Tienda de la quinta sala · Vida y energía restauradas. Comprá piezas y equipalas antes del dragón.');
    }
    buy(id) {
      if (this.mode !== 'shop') return false;
      const item = this.stock.find(i => i.id === id); if (!item || item.sold || this.hero.gold < item.price) return false;
      this.hero.gold -= item.price; item.sold = true; this.bag.push({ id: item.id, kind: 'gear', slot: item.slot, rank: item.rank });
      this.say(this.itemName(item) + ' comprado. Está en la mochila, todavía no equipado.'); return true;
    }
    enterBoss() {
      if (this.mode !== 'shop') return false;
      this.mode = 'boss'; this.paused = false; this.enemies = []; this.chests = []; this.shots = []; this.hazards = [];
      this.hero.x = 70; this.hero.y = 136; this.hero.face = 0; this.hero.inv = 2;
      this.boss = { x: 335, y: 136, hp: 650, max: 650, timer: 1.4, phase: 'rest', cycle: 0, hit: 0, target: null };
      this.say('Terragrán, dragón de tierra · Salí de los círculos antes del impacto. Shift permite esquivar.'); return true;
    }
    advance() {
      if (this.mode !== 'play' || this.enemies.length) return false;
      if (this.room < 4) { this.room++; this.spawnRoom(); this.say('Sala ' + this.room + ' · ' + ROOMS[this.room - 1]); }
      else this.enterShop();
      return true;
    }
    bossTick(dt) {
      const b = this.boss; b.hit = Math.max(0, b.hit - dt); b.timer -= dt;
      if (b.timer <= 0) {
        if (b.phase === 'rest') { b.phase = 'warning'; b.timer = 1; b.target = { x: this.hero.x, y: this.hero.y }; this.hazards.push({ ...b.target, radius: 35, timer: 1, life: 1.25, fired: false }); }
        else { b.phase = 'rest'; b.timer = b.hp < b.max / 2 ? 1.4 : 2; b.cycle++;
          const base = Math.atan2(this.hero.y - b.y, this.hero.x - b.x);
          for (const offset of [-.35, 0, .35]) this.shots.push({ x: b.x - 12, y: b.y, vx: Math.cos(base + offset) * 72, vy: Math.sin(base + offset) * 72, life: 6, earth: true }); }
      }
      if (Math.hypot(this.hero.x - b.x, this.hero.y - b.y) < 34) this.hurt(18);
      for (const h of this.hazards) { h.timer -= dt; h.life -= dt; if (h.timer <= 0 && !h.fired) { h.fired = true; if (Math.hypot(h.x - this.hero.x, h.y - this.hero.y) < h.radius) this.hurt(24); } }
      this.hazards = this.hazards.filter(h => h.life > 0);
    }
    tick(dt, keys = {}) {
      if (this.paused || !['play', 'boss', 'reward'].includes(this.mode)) return;
      this.time += dt; this.hero.inv = Math.max(0, this.hero.inv - dt); this.attack = Math.max(0, this.attack - dt);
      this.cooldown = Math.max(0, this.cooldown - dt); this.dashCooldown = Math.max(0, this.dashCooldown - dt);
      const s = this.stats(); this.hero.safe += dt;
      if (this.hero.safe > 3) this.hero.hp = Math.min(s.maxHp, this.hero.hp + dt * 4);
      this.hero.stamina = Math.min(s.maxEnergy, this.hero.stamina + dt * 15);
      let dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0), len = Math.hypot(dx, dy);
      if (len) this.hero.face = Math.atan2(dy, dx);
      if (this.dashTime > 0) { this.dashTime -= dt; dx = Math.cos(this.hero.face); dy = Math.sin(this.hero.face); len = 1; }
      if (len) { const speed = this.dashTime > 0 ? 270 : s.speed; this.hero.x = clamp(this.hero.x + dx / len * speed * dt, 20, 460); this.hero.y = clamp(this.hero.y + dy / len * speed * dt, 32, 243); }
      if (keys.hit) this.strike();
      for (const e of this.enemies) {
        if (!this.active()) break;
        e.slow = Math.max(0, e.slow - dt); const ax = this.hero.x - e.x, ay = this.hero.y - e.y, distance = Math.hypot(ax, ay) || 1;
        const speed = e.slow > 0 ? 12 : 20 + this.room * 2;
        if (distance > 15) { e.x += ax / distance * speed * dt; e.y += ay / distance * speed * dt; }
        if (distance < 17) this.hurt();
        e.fire -= dt; e.warning = e.fire < .5;
        if (e.fire < 0 && this.active()) { e.fire = 3.8 + this.random(); this.shots.push({ x: e.x, y: e.y, vx: ax / distance * 66, vy: ay / distance * 66, life: 5 }); }
      }
      if (this.mode === 'boss') this.bossTick(dt);
      for (const p of this.shots) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (Math.hypot(p.x - this.hero.x, p.y - this.hero.y) < 10 && this.active()) { this.hurt(p.earth ? 18 : 10 + this.room); p.life = 0; } }
      this.shots = this.shots.filter(p => p.life > 0 && p.x > 16 && p.x < 464 && p.y > 24 && p.y < 252);
      for (const n of this.notices) { n.life -= dt; n.y -= dt * 10; } this.notices = this.notices.filter(n => n.life > 0);
      if (this.mode === 'play' && !this.enemies.length && this.hero.x > 445 && Math.abs(this.hero.y - 136) < 25) this.advance();
    }
  }
  scope.ElementalEngine = { Game, ITEMS, ATTRS, ROOMS };
  if (typeof module !== 'undefined' && module.exports) module.exports = scope.ElementalEngine;
})(globalThis);
