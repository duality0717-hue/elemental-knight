(function (scope) {
  'use strict';
  const ATTRS = {
    strength: { name: 'Fuerza', color: '#f46b71', detail: '+1,5 de daño por punto' },
    energy: { name: 'Energía', color: '#75b8ff', detail: '+2 de energía máxima por punto' },
    vitality: { name: 'Vitalidad', color: '#8bdc83', detail: '100 de vida inicial; +8 por punto' },
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
    { slot: 'Collar', name: 'Collar', group: 'Artefactos', detail: 'Recupera vida por baja', basePrice: 95 },
    { slot: 'Segunda mano', name: 'Segunda mano', group: 'Artefactos', detail: 'Arma secundaria o escudo', basePrice: 100 },
    { slot: 'Ala / capa', name: 'Capa', group: 'Armadura', detail: 'Segunda evolución · Protección adicional', basePrice: 140 }
  ];
  const ELEMENTS = { ice: {name:'Hielo',color:'#8de4ff',skill:'Invierno eterno'}, electric: {name:'Eléctrico',color:'#c8a2ff',skill:'Cadena del trueno'}, magma: {name:'Magma',color:'#ff995e',skill:'Erupción'}, poison: {name:'Veneno',color:'#a5db69',skill:'Miasma'} };
  const QUALITIES = {bronze:{name:'Bronce',power:1,color:'#b98755'},silver:{name:'Plata',power:2,color:'#c7d5e2'},gold:{name:'Oro',power:3,color:'#e5bf60'}};
  const WEAPONS = {sword:'Espada',staff:'Báculo',bow:'Arco',greatsword:'Mandoble',shield:'Escudo'};
  const ARMOR_SLOTS=[0,2,3,1,9], ARTIFACT_SLOTS=[4,8,5,6,7];
  const twoHanded = item => ['bow','greatsword'].includes(item?.weapon);
  const ROOMS = ['La entrada carbonizada', 'El osario', 'El santuario ardiente', 'Las forjas hundidas', 'El trono de ceniza'];
  const CLASSES = {
    mage: { name: 'Mago', attribute: 'energy', color: '#91d9ed', title: 'La voluntad del invierno', detail: '+5 Energía · Dominio arcano' },
    rogue: { name: 'Rogue', attribute: 'agility', color: '#c5a6ef', title: 'El filo del silencio', detail: '+5 Agilidad · Precisión y velocidad' },
    warrior: { name: 'Guerrero', attribute: 'strength', color: '#e6b17e', title: 'El juramento de hierro', detail: '+5 Fuerza · Poder cuerpo a cuerpo' }
  };
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  class Game {
    constructor(random = Math.random) { this.random = random; this.reset(); this.mode = 'ready'; }
    reset() {
      this.nextId = 1; this.chapter = 1; this.room = 1; this.kills = 0; this.mode = 'play'; this.paused = false;
      this.zones = null; this.zoneId = null; this.ally = null; this.doorCooldown = 0; this.chapterKills = 0;
      this.friendlyShots = [];
      this.time = 0; this.attack = 0; this.cooldown = 0; this.dashTime = 0; this.dashCooldown = 0;
      this.hero = { x: 54, y: 136, face: 0, hp: 100, stamina: 52, gold: 0, points: 0, inv: 1.5, slow: 0, poison: 0, poisonTick: 0, name: '', specialization: null,
        attributes: { strength: 1, energy: 1, vitality: 1, agility: 1 } };
      this.bag = []; this.equipped = Array(10).fill(null); this.stock = []; this.boss = null;
      this.evolution=0; this.skillCooldown=0; this.skillEffect=null; this.vault=this.vault||[];
      this.nextId=Math.max(this.nextId,...this.vault.map(i=>i.id+1));
      this.effects = []; this.notices = []; this.revision = 0; this.rewardClaimed = false;
      this.spawnRoom(); this.say('Entrás sin equipo. Cada esqueleto da oro y 1 punto libre. Enter abre el personaje.');
    }
    say(text) { this.message = text; this.revision++; }
    rank(slot) { const item=this.equipped[slot]; return item ? (QUALITIES[item.quality]?.power||1)*(1+(item.level||0)*.04) : 0; }
    artifactSet() {
      const weapon=this.equipped[4]; if(!weapon)return null;
      const slots=twoHanded(weapon)?[4,5,6,7]:ARTIFACT_SLOTS;
      return slots.every(i=>this.equipped[i]?.element===weapon.element)?weapon.element:null;
    }
    armorSet() { const items=ARMOR_SLOTS.map(i=>this.equipped[i]);return items.every(i=>i&&i.element===items[0]?.element)?items[0].element:null; }
    weaponType() { return this.equipped[4]?.weapon || (this.equipped[8]?.weapon!=='shield'&&this.equipped[8]?.weapon) || null; }
    stats() {
      const a = this.hero.attributes, r = i => this.rank(i), level = 1 + Math.floor(this.kills / 5);
      return { level, damage: (r(4) ? 24 + 6 * (r(4) - 1) : 12) + (a.strength - 1) * 1.5 + r(3) * 4 + r(5) * 6 + (this.equipped[8]&&this.equipped[8].weapon!=='shield'?r(8)*5:0),
        maxHp: 100 + (a.vitality - 1) * 8, maxEnergy: 50 + a.energy * 2,
        armor: r(0) * 3 + r(2) * 2 + r(9)*2 + (this.equipped[8]?.weapon==='shield'?r(8)*4:0) + (this.armorSet() ? 4 : 0),
        speed: 88 + (a.agility - 1) * .5 + r(1) * 10,
        delay: Math.max(.18, .48 / (1 + (a.agility - 1) * .01) * Math.pow(.88, r(6))),
        range: this.weaponType()==='greatsword'?65:r(4) ? 47 : 33, frost: false,
        lifeOnHit: .6 + .03 * (a.vitality - 1) + .015 * (a.strength - 1) + .01 * (a.agility - 1) + .1 * (level - 1) };
    }
    chances() { return { gear: this.room * 5 / 100, potion: (15 + (this.room - 1) * 10) / 100 }; }
    transferVault(id, withdraw=false) {
      if(!this.paused||!this.canManage())return false;
      const from=withdraw?this.vault:this.bag,to=withdraw?this.bag:this.vault;
      const index=from.findIndex(i=>i.id===id);if(index<0||to.length>=200)return false;
      to.push(from.splice(index,1)[0]);this.say(withdraw?'Objeto retirado del baúl.':'Objeto guardado en el baúl.');return true;
    }
    skill() {
      const element=this.artifactSet();
      if(!element||!this.active()||this.skillCooldown>0||this.hero.stamina<25)return false;
      this.hero.stamina-=25;this.skillCooldown=18;
      const radius=element==='magma'?85:element==='electric'?500:150;
      this.skillEffect={element,x:this.hero.x,y:this.hero.y,radius,life:1};
      let targets=(this.mode==='boss'?[this.boss]:this.enemies).filter(e=>e.hp>0&&Math.hypot(e.x-this.hero.x,e.y-this.hero.y)<radius);
      if(element==='electric')targets=targets.sort((a,b)=>Math.hypot(a.x-this.hero.x,a.y-this.hero.y)-Math.hypot(b.x-this.hero.x,b.y-this.hero.y)).slice(0,3);
      const damage={ice:45,electric:70,magma:100,poison:20}[element]+this.stats().damage*.3;
      for(const e of targets){e.hp=Math.max(0,e.hp-damage);if(element==='ice')e.slow=4;if(element==='poison')e.venom={remaining:6,tick:1};if(!e.hp){if(e===this.boss)this.defeatBoss();else this.kill(e);}}
      const before=this.enemies.length;this.enemies=this.enemies.filter(e=>e.hp>0);if(before&&!this.enemies.length)this.clearedCombat();
      this.say(ELEMENTS[element].skill+' · '+targets.length+' objetivo(s).');return true;
    }
    spawnRoom() {
      if (this.chapter === 2 && this.room < 5) { this.createLabyrinth(); return; }
      this.hero.x = 54; this.hero.y = 136; this.hero.inv = 1.5; this.hero.face = 0;
      this.shots = []; this.hazards = []; this.effects = []; this.notices = [];
      this.chests = [{ x: 70, y: 60 }, { x: 236, y: 218 }, { x: 412, y: 64 }].map(p => ({ ...p, open: false }));
      this.enemies = Array.from({ length: this.room + 2 }, (_, i) => ({ x: 240 + (i % 2) * 110, y: 55 + Math.floor(i / 2) * 52,
        hp: this.room === 3 && i === 0 ? 130 : 44 + this.room * 7, max: this.room === 3 && i === 0 ? 130 : 44 + this.room * 7,
        kind: this.room === 3 && i === 0 ? 'elite' : 'caster', slow: 0, fire: 2.5 + i * .75, warning: false,
        phase: 'chase', timer: 1, face: Math.PI, swing: 0 }));
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
    gear(slot, rank = 1, options={}) {
      const element=options.element||Object.keys(ELEMENTS)[Math.floor(this.random()*4)];
      const quality=(slot<5||slot===8||slot===9)?(options.quality||Object.keys(QUALITIES)[clamp(rank-1,0,2)]):null;
      const pool=slot===8?['sword','staff','shield']:['sword','staff','bow','greatsword'];
      return { id:this.nextId++,kind:'gear',slot,rank,element,quality,level:clamp(options.level??0,0,25),
        ...([4,8].includes(slot)?{weapon:options.weapon||pool[Math.floor(this.random()*pool.length)]}:{}),
        ...(slot===9?{style:options.style||(this.random()<.5?'cape':'wings')}:{} ) };
    }
    potion(attribute, power = this.room) { return { id: this.nextId++, kind: 'potion', attribute, power }; }
    itemName(item) { return item.kind === 'potion' ? 'Poción de ' + ATTRS[item.attribute].name.toLowerCase() : (WEAPONS[item.weapon]||(item.slot===9?(item.style==='wings'?'Alas':'Capa'):ITEMS[item.slot].slot))+' · '+ELEMENTS[item.element].name+(item.quality?' · '+QUALITIES[item.quality].name:'')+' · Nv. '+item.level; }
    acquireGear(rank = 1, source='normal') {
      const owned = new Set([...this.bag.filter(i => i.kind === 'gear'), ...this.equipped.filter(Boolean)].map(i => i.slot));
      const eligible=ITEMS.map((_,i)=>i).filter(i=>i!==9||this.evolution>=2);
      const available = eligible.filter(i => !owned.has(i));
      const pool = available.length ? available : eligible;
      const level=source==='boss'?Math.min(25,5*this.chapter):source==='elite'?Math.min(25,this.chapter+Math.floor(this.random()*3)):0;
      const item = this.gear(pool[Math.floor(this.random() * pool.length)], rank,{level,quality:Object.keys(QUALITIES)[Math.floor(this.random()*3)]}); this.bag.push(item); return item;
    }
    equip(id, targetSlot) {
      if (!this.canManage()) return false;
      const index = this.bag.findIndex(i => i.id === id && i.kind === 'gear'); if (index < 0) return false;
      const item=this.bag[index], slot=targetSlot??item.slot;
      if(slot===9&&this.evolution<2){this.say('Ala/capa se desbloquea en la segunda evolución.');return false;}
      if(item.weapon){if(![4,8].includes(slot)||(slot===4&&item.weapon==='shield')||(slot===8&&twoHanded(item)))return false;}
      else if(slot!==item.slot)return false;
      if(slot===8&&twoHanded(this.equipped[4])){this.say('El arco y el mandoble ocupan ambas manos. Quitá primero el arma principal.');return false;}
      this.bag.splice(index,1);
      if(slot===4&&twoHanded(item)&&this.equipped[8]){this.bag.push(this.equipped[8]);this.equipped[8]=null;}
      const old=this.equipped[slot];item.slot=slot;this.equipped[slot]=item;if(old)this.bag.push(old);
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
        this.rewardClaimed = true; const item = this.acquireGear(3,'boss'); this.hero.gold += 200;
        for (const key of Object.keys(ATTRS)) this.bag.push(this.potion(key, 8));
        this.mode = this.chapter === 1 ? 'chapter-complete' : 'won'; this.say('¡Victoria! Cofre lujoso: ' + this.itemName(item) + ', 200 de oro y cuatro pociones de +8.' + (this.chapter === 1 ? ' Tu viaje continúa en el capítulo II.' : ' Venciste a Mórtigo junto a tu sombra.')); return true;
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
      enemy.rewarded = true; this.kills++; this.chapterKills++; this.hero.points++;
      if(enemy.kind==='elite')this.acquireGear(2,'elite');
      const gold = 4 + this.room * 2 + Math.floor(this.random() * 5); this.hero.gold += gold;
      if (this.rank(7)) this.hero.hp = Math.min(this.stats().maxHp, this.hero.hp + this.rank(7) * 6);
      this.notices.push({ x: enemy.x, y: enemy.y - 23, text: '+' + gold + ' oro · +1 punto', life: 1.2 }); this.revision++;
    }
    strike() {
      if (!this.active() || this.cooldown > 0) return;
      const s = this.stats(); this.cooldown = s.delay; this.attack = .18; let damageDealt = 0;
      const weapon=this.weaponType();
      if (['staff','bow'].includes(weapon)||(!weapon&&this.chapter === 2 && ['mage', 'rogue'].includes(this.hero.specialization))) {
        const type = weapon==='bow'||(!weapon&&this.hero.specialization==='rogue') ? 'arrow' : this.equipped[4]?.element||this.equipped[8]?.element||'ice', speed = type === 'arrow' ? 220 : 155;
        this.friendlyShots.push({ x: this.hero.x, y: this.hero.y, vx: Math.cos(this.hero.face) * speed, vy: Math.sin(this.hero.face) * speed, life: 2.8, damage: s.damage, type, owner: 'hero' });
        return;
      }
      for (const e of this.enemies) {
        const dx = e.x - this.hero.x, dy = e.y - this.hero.y, distance = Math.hypot(dx, dy);
        const dot = (dx * Math.cos(this.hero.face) + dy * Math.sin(this.hero.face)) / (distance || 1);
        if (e.hp > 0 && distance < s.range + (e.kind === 'elite' ? 7 : 0) && (dot > -.15 || distance < 17)) {
          damageDealt += Math.min(e.hp, s.damage + (s.frost ? 10 : 0));
          e.hp -= s.damage; e.slow = this.equipped[4]?.element==='ice' ? 1.6 : 0;
          e.x = clamp(e.x + Math.cos(this.hero.face) * 11, 22, 458); e.y = clamp(e.y + Math.sin(this.hero.face) * 11, 32, 243);
          if (e.hp <= 0) this.kill(e);
        }
      }
      const previous = this.enemies.length; this.enemies = this.enemies.filter(e => e.hp > 0);
      if (previous && !this.enemies.length) this.clearedCombat();
      if (this.mode === 'boss' && this.boss.hp > 0) {
        const dx = this.boss.x - this.hero.x, dy = this.boss.y - this.hero.y, dist = Math.hypot(dx, dy);
        if (dist < s.range + (this.chapter === 2 ? 27 : 12) && (dx * Math.cos(this.hero.face) + dy * Math.sin(this.hero.face)) / (dist || 1) > -.1) {
          damageDealt += Math.min(this.boss.hp, s.damage);
          this.boss.hp = Math.max(0, this.boss.hp - s.damage);
          this.boss.hit = .15;
          if (!this.boss.hp) this.defeatBoss();
        }
      }
      // One recovery per successful swing, even when it hits multiple targets.
      if (damageDealt > 0) this.hero.hp = Math.min(s.maxHp, this.hero.hp + Math.min(s.lifeOnHit, damageDealt * .08));
    }
    hurt(amount = 10 + this.room) {
      if (!this.active() || this.hero.inv > 0) return false;
      this.hero.hp = Math.max(0, this.hero.hp - Math.max(2, amount - this.stats().armor));
      this.hero.inv = 1.1;
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
      const pool = ITEMS.map((_, i) => i).filter(i=>i!==9||this.evolution>=2); this.stock = [];
      for (let i = 0; i < 6; i++) { const slot = pool.splice(Math.floor(this.random() * pool.length), 1)[0], rank = this.random() < .3 ? 2 : 1;
        const quality=Object.keys(QUALITIES)[Math.floor(this.random()*3)];this.stock.push({ ...this.gear(slot, rank,{quality}), price: ITEMS[slot].basePrice + (QUALITIES[quality].power - 1) * 35, sold: false }); }
      this.say('Tienda de la quinta sala · Vida y energía restauradas. Prepará tu build: ' + (this.chapter===2?'Mórtigo te espera.':'tu sombra te espera.'));
    }
    buy(id) {
      if (this.mode !== 'shop') return false;
      const item = this.stock.find(i => i.id === id); if (!item || item.sold || this.hero.gold < item.price) return false;
      this.hero.gold -= item.price; item.sold = true; const {price,sold,...bought}=item;this.bag.push(bought);
      this.say(this.itemName(item) + ' comprado. Está en la mochila, todavía no equipado.'); return true;
    }
    enterBoss() {
      if (this.mode !== 'shop') return false;
      this.mode = 'boss'; this.paused = false; this.enemies = []; this.chests = []; this.shots = []; this.hazards = [];
      this.hero.x = 70; this.hero.y = 136; this.hero.face = 0; this.hero.inv = 2;
      this.friendlyShots = []; this.zones = null; this.hero.poison = 0;
      if (this.chapter === 2) {
        this.boss = { x: 335, y: 150, hp: 1000, max: 1000, timer: 1.6, phase: 'rest', cycle: 0, hit: 0, style: 'cleave', face: Math.PI, swing: 0, kind: 'plague' };
        this.ally = { x: 115, y: 180, face: 0, hp: 1, fire: 1, swing: 0, equipment: this.equipped.map(i => i ? { ...i } : null) };
        this.say('MÓRTIGO · Guerrero de la peste. Tu sombra pelea a tu lado: sus proyectiles celestes dañan al jefe.'); return true;
      }
      this.boss = { x: 335, y: 136, hp: 650, max: 650, timer: 1.4, phase: 'rest', cycle: 0, hit: 0, target: null,
        style: 'mage', face: Math.PI, swing: 0, equipment: this.equipped.map(i => i ? { ...i } : null) };
      this.say('EL ECO · Tu propia sombra. Hielo, lluvia de flechas y espada. Mirá las señales antes de atacar.'); return true;
    }
    specialize(name, specialization) {
      if (this.mode !== 'awakening' || this.hero.specialization || !CLASSES[specialization] || typeof name !== 'string') return false;
      const clean = name.trim();
      if (!clean || Array.from(clean).length > 20 || /[\u0000-\u001f\u007f]/.test(clean)) { this.say('Elegí un nombre de 1 a 20 caracteres.'); return false; }
      const before = this.stats(), key = CLASSES[specialization].attribute;
      this.hero.name = clean; this.hero.specialization = specialization;
      this.evolution=Math.max(1,this.evolution);
      this.hero.attributes[key] = Math.min(100, this.hero.attributes[key] + 5);
      this.hero.stamina += this.stats().maxEnergy - before.maxEnergy;
      this.mode = 'reward'; this.paused = false;
      this.say(clean + ', ' + CLASSES[specialization].name + ': tu camino acaba de comenzar. Abrí el cofre lujoso con E.'); return true;
    }
    advance() {
      if (this.mode !== 'play' || this.enemies.length || this.chapter === 2) return false;
      if (this.room < 4) { this.room++; this.spawnRoom(); this.say('Sala ' + this.room + ' · ' + ROOMS[this.room - 1]); }
      else this.enterShop();
      return true;
    }
    bossTick(dt) {
      if (this.chapter === 2) { this.plagueTick(dt); return; }
      const b = this.boss; b.hit = Math.max(0, b.hit - dt); b.swing = Math.max(0, b.swing - dt); b.timer -= dt;
      const dx = this.hero.x - b.x, dy = this.hero.y - b.y, distance = Math.hypot(dx, dy) || 1;
      if (b.phase === 'rest') {
        b.face = Math.atan2(dy, dx);
        const meleeNext = b.cycle % 3 === 2, desired = meleeNext ? 48 : 115;
        const move = distance > desired + 10 ? 1 : distance < desired - 25 ? -1 : 0;
        b.x = clamp(b.x + dx / distance * move * 38 * dt, 36, 444); b.y = clamp(b.y + dy / distance * move * 38 * dt, 50, 228);
      }
      if (b.timer <= 0) {
        if (b.phase === 'rest') {
          b.style = ['mage', 'rogue', 'warrior'][b.cycle % 3]; b.phase = 'warning'; b.timer = 1;
          b.target = { x: this.hero.x, y: this.hero.y }; b.face = Math.atan2(dy, dx);
          if (b.style === 'rogue') this.hazards.push({ ...b.target, type: 'arrows', radius: 42, timer: 1, life: 1.45, fired: false });
          if (b.style === 'warrior') this.hazards.push({ x: b.x, y: b.y, type: 'sword', angle: b.face, radius: 72, timer: 1, life: 1.35, fired: false });
          this.say(b.style === 'mage' ? 'SOMBRA · Mago: prepara bolas de hielo.' : b.style === 'rogue' ? 'SOMBRA · Rogue: salí de la zona de flechas.' : 'SOMBRA · Guerrero: esquivá el arco de la espada.');
        } else {
          if (b.style === 'mage') { const base = Math.atan2(b.target.y - b.y, b.target.x - b.x); for (const offset of [-.36, -.18, 0, .18, .36]) this.shots.push({ x: b.x, y: b.y - 6, vx: Math.cos(base + offset) * 90, vy: Math.sin(base + offset) * 90, life: 5, type: 'ice' }); }
          if (b.style === 'warrior') b.swing = .35;
          b.phase = 'rest'; b.timer = b.hp < b.max / 2 ? 1.6 : 2; b.cycle++;
        }
      }
      for (const h of this.hazards) { h.timer -= dt; h.life -= dt; if (h.timer <= 0 && !h.fired) {
        h.fired = true; const ax = this.hero.x - h.x, ay = this.hero.y - h.y, dist = Math.hypot(ax, ay);
        const inArc = h.type !== 'sword' || (ax * Math.cos(h.angle) + ay * Math.sin(h.angle)) / (dist || 1) > .35;
        if (dist < h.radius && inArc) this.hurt(h.type === 'sword' ? 28 : 18);
      } }
      this.hazards = this.hazards.filter(h => h.life > 0);
    }
    beginChapter2() {
      if (this.chapter !== 1 || this.mode !== 'chapter-complete' || !this.hero.specialization) return false;
      this.chapter = 2; this.room = 1; this.chapterKills = 0; this.boss = null; this.ally = null;
      this.mode = 'play'; this.paused = false; this.rewardClaimed = false; this.stock = [];
      this.hero.hp = this.stats().maxHp; this.hero.stamina = this.stats().maxEnergy; this.hero.poison = 0;
      this.spawnRoom(); this.say('CAPÍTULO II · La catedral de la peste. ' + this.hero.name + ', explorá los anexos y encontrá el umbral dorado hacia la sala 2.'); return true;
    }
    createLabyrinth() {
      // A connected loop, two dead ends and a hidden exit; rotate it per room.
      const layout = [['hub',0,0,'Atrio de los lamentos'],['north',0,-1,'Galería de santos ciegos'],['east',1,0,'Relicario vacío'],['west',-1,0,'Pasaje de las cadenas'],['south',0,1,'Sepulcro de ceniza'],['cross',-1,-1,'Osario de los juramentos'],['exit',-2,-1,'Umbral sellado']];
      const turns = (this.room - 1 + Math.floor(this.random() * 4)) % 4;
      const rotate = (x,y) => { for(let i=0;i<turns;i++) [x,y]=[-y,x]; return [x,y]; };
      const directions = {up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
      this.zones = Object.fromEntries(layout.map(([id,x,y,name]) => { [x,y]=rotate(x,y); return [id,{id,x,y,name,doors:{},enemies:[],chests:[],visited:false,cleared:false}]; }));
      for(const z of Object.values(this.zones)) for(const [dir,[dx,dy]] of Object.entries(directions)) {
        const other=Object.values(this.zones).find(n=>n.x===z.x+dx&&n.y===z.y+dy); if(other)z.doors[dir]=other.id;
      }
      const [ex,ey]=rotate(0,-1), exitDir=Object.keys(directions).find(d=>directions[d][0]===ex&&directions[d][1]===ey);
      this.zones.exit.doors[exitDir]='next';
      for(let i=0;i<this.room+2;i++) {
        const elite=this.room===3&&i===this.room+1, hp=elite?190:65+this.room*9;
        const e={x:300+(i%2)*60,y:115+(i%3)*35,hp,max:hp,kind:elite?'elite':'caster',slow:0,fire:2.5+i*.5,warning:false,phase:'chase',timer:1,face:Math.PI,swing:0};
        this.zones[i===0?'hub':i===1?'cross':'exit'].enemies.push(e);
      }
      for(const [id,x,y] of [['hub',85,205],['east',330,105],['south',150,130]])this.zones[id].chests.push({x,y,open:false});
      this.zoneId='hub';this.enterZone('hub');this.hero.x=240;this.hero.y=175;
    }
    enterZone(id, fromDirection) {
      const z=this.zones[id];this.zoneId=id;z.visited=true;
      this.enemies=z.enemies;this.chests=z.chests;this.shots=[];this.hazards=[];this.friendlyShots=[];this.notices=[];
      const entries={right:[50,136],left:[430,136],up:[240,216],down:[240,70]};
      const [x,y]=entries[fromDirection]||[240,175];this.hero.x=x;this.hero.y=y;this.hero.inv=1.5;this.dashTime=0;this.doorCooldown=.5;
      this.revision++;
    }
    doors() {
      if(this.chapter===2&&this.zones&&this.mode==='play')return this.zones[this.zoneId].doors;
      return this.mode==='play'&&this.chapter===1?{right:'next'}:{};
    }
    travel(direction) {
      if(!this.active()||this.mode!=='play'||this.enemies.length||this.doorCooldown>0)return false;
      const target=this.doors()[direction];if(!target)return false;
      if(this.chapter===1)return this.advance();
      const current=this.zones[this.zoneId];current.enemies=this.enemies;
      if(target==='next') {
        if(Object.values(this.zones).some(z=>z.enemies.some(e=>e.hp>0))){this.say('El umbral sigue sellado. Quedan enemigos en los anexos.');this.doorCooldown=1;return false;}
        if(this.room===4){this.zones=null;this.zoneId=null;this.enterShop();}
        else {this.room++;this.spawnRoom();this.say('Sala '+this.room+'/5 · Un nuevo laberinto. Encontrá el umbral dorado.');}
      } else {this.enterZone(target,direction);this.say('Sala '+this.room+' · '+this.zones[target].name+'. Seguís explorando la misma sala.');}
      return true;
    }
    clearedCombat() {
      this.shots=[];
      if(this.chapter===2&&this.zones){const z=this.zones[this.zoneId];z.enemies=this.enemies;z.cleared=true;
        if(Object.values(this.zones).some(n=>n.enemies.some(e=>e.hp>0))){this.say('Anexo despejado. Las puertas se abren; seguí explorando.');return;}
      }
      this.hero.hp=Math.min(this.stats().maxHp,this.hero.hp+35);this.say('Sala despejada · +35 de vida. Revisá los cofres y buscá la salida.');
    }
    defeatBoss() {
      if(this.chapter===2)this.evolution=2;
      this.boss.hp=0;this.mode=this.chapter===1?'awakening':'reward';this.shots=[];this.hazards=[];this.friendlyShots=[];this.hero.poison=0;
      this.chests=[{x:330,y:136,open:false,luxury:true}];
      this.say(this.chapter===1?'Tu sombra cayó. Elegí tu nombre y tu especialización.':'Mórtigo cayó. Tu sombra inclina la cabeza: sobrevivieron juntos. Abrí el cofre lujoso con E.');
    }
    friendlyTick(dt) {
      for(const p of this.friendlyShots){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
        const targets=this.mode==='boss'?[this.boss]:this.enemies;
        const target=targets.find(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<(e===this.boss?28:e.kind==='elite'?17:12));
        if(!target)continue;const dealt=Math.min(target.hp,p.damage);target.hp=Math.max(0,target.hp-p.damage);target.hit=.15;p.life=0;
        if(p.type==='ice'&&target!==this.boss)target.slow=1.6;
        if(p.type==='poison')target.venom={remaining:3,tick:1};
        if(p.owner==='hero')this.hero.hp=Math.min(this.stats().maxHp,this.hero.hp+Math.min(this.stats().lifeOnHit,dealt*.08));
        if(!target.hp){if(target===this.boss){this.defeatBoss();break;}this.kill(target);const previous=this.enemies.length;this.enemies=this.enemies.filter(e=>e.hp>0);if(previous&&!this.enemies.length)this.clearedCombat();}
      }
      this.friendlyShots=this.friendlyShots.filter(p=>p.life>0&&p.x>16&&p.x<464&&p.y>24&&p.y<252);
    }
    plagueTick(dt) {
      const b=this.boss;b.timer-=dt;b.hit=Math.max(0,b.hit-dt);b.swing=Math.max(0,b.swing-dt);
      const dx=this.hero.x-b.x,dy=this.hero.y-b.y,d=Math.hypot(dx,dy)||1;
      if(b.phase==='rest'){b.face=Math.atan2(dy,dx);if(d>65){b.x=clamp(b.x+dx/d*27*dt,50,430);b.y=clamp(b.y+dy/d*27*dt,80,220);}}
      if(b.timer<=0){if(b.phase==='rest'){
        b.style=['cleave','miasma','volley'][b.cycle%3];b.phase='warning';b.timer=1.1;b.target={x:this.hero.x,y:this.hero.y};
        if(b.style==='cleave')this.hazards.push({x:b.x,y:b.y,type:'sword',poison:true,angle:b.face,radius:86,timer:1.1,life:1.5,fired:false});
        if(b.style==='miasma')for(const offset of [-38,0,38])this.hazards.push({x:clamp(b.target.x+offset,45,435),y:clamp(b.target.y+Math.abs(offset)*.5,55,220),type:'poison',radius:28,timer:1.1,life:5.1,fired:false});
        this.say(b.style==='cleave'?'MÓRTIGO · Espada envenenada: salí del arco.':b.style==='miasma'?'MÓRTIGO · Miasma: alejate de los círculos verdes.':'MÓRTIGO · Salva de veneno: prepará la esquiva.');
      }else{
        if(b.style==='volley')for(const offset of [-.45,-.225,0,.225,.45])this.shots.push({x:b.x,y:b.y,vx:Math.cos(b.face+offset)*82,vy:Math.sin(b.face+offset)*82,life:5,type:'poison'});
        if(b.style==='cleave')b.swing=.4;b.phase='rest';b.timer=b.hp<b.max*.4?1.5:2.1;b.cycle++;
      }}
      for(const h of this.hazards){h.timer-=dt;h.life-=dt;const ax=this.hero.x-h.x,ay=this.hero.y-h.y,dist=Math.hypot(ax,ay);
        if(h.timer<=0){const first=!h.fired;h.fired=true;const inArc=h.type!=='sword'||(ax*Math.cos(h.angle)+ay*Math.sin(h.angle))/(dist||1)>.35;
          if(dist<h.radius&&inArc&&(first||h.type==='poison')&&this.hurt(h.type==='sword'?30:9)){this.hero.poison=4;this.hero.poisonTick=1;}
        }
      }this.hazards=this.hazards.filter(h=>h.life>0);
      const a=this.ally;if(a){a.fire-=dt;a.swing=Math.max(0,a.swing-dt);a.face=Math.atan2(b.y-a.y,b.x-a.x);
        const tx=clamp(this.hero.x+55,35,445),ty=clamp(this.hero.y+35,50,230),ad=Math.hypot(tx-a.x,ty-a.y)||1;
        if(ad>10){a.x+=(tx-a.x)/ad*62*dt;a.y+=(ty-a.y)/ad*62*dt;}
        if(a.fire<=0){a.fire=1.4;a.swing=.18;this.friendlyShots.push({x:a.x,y:a.y,vx:Math.cos(a.face)*170,vy:Math.sin(a.face)*170,life:3,damage:18,type:'echo',owner:'ally'});}
      }
    }
    eliteTick(e, dt) {
      const dx = this.hero.x - e.x, dy = this.hero.y - e.y, distance = Math.hypot(dx, dy) || 1;
      e.swing = Math.max(0, e.swing - dt); e.timer -= dt;
      if (e.phase === 'windup') {
        if (e.timer <= 0) { const dot = (dx * Math.cos(e.face) + dy * Math.sin(e.face)) / distance;
          if (distance < 48 && dot > .2) this.hurt(22);
          e.phase = 'recover'; e.timer = 1; e.swing = .3; e.warning = false;
        }
      } else if (e.phase === 'recover') { if (e.timer <= 0) e.phase = 'chase'; }
      else { e.face = Math.atan2(dy, dx); if (distance > 30) { e.x += dx / distance * (e.slow > 0 ? 13 : 32) * dt; e.y += dy / distance * (e.slow > 0 ? 13 : 32) * dt; }
        if (distance < 48) { e.phase = 'windup'; e.timer = .75; e.warning = true; } }
    }
    tick(dt, keys = {}) {
      if (this.paused || !['play', 'boss', 'reward'].includes(this.mode)) return;
      this.skillCooldown=Math.max(0,this.skillCooldown-dt);
      if(this.skillEffect){this.skillEffect.life-=dt;if(this.skillEffect.life<=0)this.skillEffect=null;}
      for(const e of [...this.enemies,...(this.mode==='boss'?[this.boss]:[])]){
        if(!e.venom||e.hp<=0)continue;
        e.venom.remaining=Math.max(0,e.venom.remaining-dt);e.venom.tick-=dt;
        if(e.venom.tick<=0){e.venom.tick+=1;e.hp=Math.max(0,e.hp-6);if(!e.hp){if(e===this.boss)this.defeatBoss();else this.kill(e);}}
        if(!e.venom.remaining)e.venom=null;
      }
      const aliveBefore=this.enemies.length;this.enemies=this.enemies.filter(e=>e.hp>0);if(aliveBefore&&!this.enemies.length)this.clearedCombat();
      this.time += dt; this.hero.inv = Math.max(0, this.hero.inv - dt); this.attack = Math.max(0, this.attack - dt);
      this.cooldown = Math.max(0, this.cooldown - dt); this.dashCooldown = Math.max(0, this.dashCooldown - dt);
      this.hero.slow = Math.max(0, this.hero.slow - dt);
      this.doorCooldown = Math.max(0,this.doorCooldown-dt);
      if(this.hero.poison>0){this.hero.poison=Math.max(0,this.hero.poison-dt);this.hero.poisonTick-=dt;if(this.hero.poisonTick<=0){this.hero.poisonTick=1;this.hurt(6);}}
      if(this.mode==='dead')return;
      const s = this.stats();
      this.hero.stamina = Math.min(s.maxEnergy, this.hero.stamina + dt * 15);
      let dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0), len = Math.hypot(dx, dy);
      if (len) this.hero.face = Math.atan2(dy, dx);
      if (this.dashTime > 0) { this.dashTime -= dt; dx = Math.cos(this.hero.face); dy = Math.sin(this.hero.face); len = 1; }
      if (len) { const speed = this.dashTime > 0 ? 270 : s.speed * (this.hero.slow > 0 ? .7 : 1); this.hero.x = clamp(this.hero.x + dx / len * speed * dt, 20, 460); this.hero.y = clamp(this.hero.y + dy / len * speed * dt, 32, 243); }
      if (keys.hit) this.strike();
      for (const e of this.enemies) {
        if (!this.active()) break;
        e.slow = Math.max(0, e.slow - dt); const ax = this.hero.x - e.x, ay = this.hero.y - e.y, distance = Math.hypot(ax, ay) || 1;
        if (e.kind === 'elite') { this.eliteTick(e, dt); continue; }
        const speed = e.slow > 0 ? 12 : 20 + this.room * 2;
        const direction = distance > 115 ? 1 : distance < 65 ? -1 : 0;
        e.x = clamp(e.x + ax / distance * speed * dt * direction, 22, 458); e.y = clamp(e.y + ay / distance * speed * dt * direction, 36, 243);
        if (distance < 17) this.hurt();
        e.fire -= dt; e.warning = e.fire < .5;
        if (e.fire < 0 && this.active()) { e.fire = 3.8 + this.random(); this.shots.push({ x: e.x, y: e.y, vx: ax / distance * 66, vy: ay / distance * 66, life: 5 }); }
      }
      if (this.mode === 'boss') this.bossTick(dt);
      for (const p of this.shots) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (Math.hypot(p.x - this.hero.x, p.y - this.hero.y) < 10 && this.active()) { const hit = this.hurt(p.type === 'ice' ? 12 : 10 + this.room); if (hit && p.type === 'ice') this.hero.slow = 1.2; if(hit&&p.type==='poison'){this.hero.poison=4;this.hero.poisonTick=1;} p.life = 0; } }
      this.shots = this.shots.filter(p => p.life > 0 && p.x > 16 && p.x < 464 && p.y > 24 && p.y < 252);
      for (const n of this.notices) { n.life -= dt; n.y -= dt * 10; } this.notices = this.notices.filter(n => n.life > 0);
      if(this.active())this.friendlyTick(dt);
      if(this.mode==='play'&&!this.enemies.length){const h=this.hero;
        const dir=h.x>445&&Math.abs(h.y-136)<23?'right':h.x<35&&Math.abs(h.y-136)<23?'left':h.y<43&&Math.abs(h.x-240)<23?'up':h.y>235&&Math.abs(h.x-240)<23?'down':null;
        if(dir)this.travel(dir);
      }
    }
  }
  scope.ElementalEngine = { Game, ITEMS, ATTRS, ROOMS, CLASSES, ELEMENTS, QUALITIES, WEAPONS, ARMOR_SLOTS, ARTIFACT_SLOTS, twoHanded };
  if (typeof module !== 'undefined' && module.exports) module.exports = scope.ElementalEngine;
})(globalThis);
