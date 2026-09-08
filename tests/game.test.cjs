const assert = require('node:assert/strict');
const { Game, ATTRS } = require('../src/engine.js');
let checks = 0;
function test(name, fn) { fn(); checks++; console.log('PASS ' + name); }
function game(roll=.99) { const g = new Game(() => roll); g.reset(); return g; }
function open(g, index=0) { g.hero.x=g.chests[index].x;g.hero.y=g.chests[index].y;return g.openChest(); }
test('start empty; attributes 1/100; no gold, no free points',()=>{
 const g=game();assert.equal(g.hero.hp,100);assert.equal(g.hero.gold,0);assert.equal(g.hero.points,0);assert.equal(g.bag.length,0);assert(g.equipped.every(i=>i===null));assert(Object.values(g.hero.attributes).every(x=>x===1));assert.equal(g.stats().damage,12);
});
test('one free point and gold per skeleton, never double rewards',()=>{
 const g=game(),e=g.enemies[0];g.kill(e);assert.equal(g.hero.points,1);assert.equal(g.hero.gold,10);g.kill(e);assert.equal(g.hero.points,1);
});
test('distribution costs points, affects combat, respects cap',()=>{
 const g=game();assert(!g.invest('strength'));g.hero.points=2;assert(g.invest('strength'));assert.equal(g.stats().damage,13.5);assert.equal(g.hero.points,1);assert(!g.invest('unknown'));g.hero.attributes.strength=100;assert(!g.invest('strength'));assert.equal(g.hero.points,1);assert(g.invest('vitality'));assert.equal(g.stats().maxHp,108);assert.equal(g.hero.hp,108);
});
test('gear odds unchanged; potion odds rise by 10%; chests never empty or repeat',()=>{
 for(let room=1;room<=5;room++){
  const g=game();g.room=room;g.spawnRoom();const p=g.chances();assert.equal(p.gear,room*5/100);assert.equal(p.potion,(15+(room-1)*10)/100);
  for(const [roll,kind] of [[0,'gear'],[p.gear,'potion'],[p.gear+p.potion,'gold'],[.999,'gold']]){
   g.bag=[];g.chests[0].open=false;g.random=()=>roll;const before=g.hero.gold;assert(open(g));
   if(kind==='gold')assert(g.hero.gold>before);else {assert.equal(g.bag[0].kind,kind);if(kind==='potion')assert.equal(g.bag[0].power,room);}
   assert(g.equipped.every(i=>!i));const count=g.bag.length,gold=g.hero.gold;assert(!open(g));assert.equal(g.bag.length,count);assert.equal(g.hero.gold,gold);
  }
 }
});
test('range, pause and death prevent chest rewards',()=>{const g=game();assert(!g.openChest());g.paused=true;assert(!open(g));g.paused=false;g.mode='dead';assert(!open(g));});
test('manual equip, unequip and same-slot replacement preserve items',()=>{
 const g=game(0);open(g);const item=g.bag[0];assert(!g.equipped[item.slot]);assert(g.equip(item.id));assert.equal(g.bag.length,0);const upgrade=g.gear(item.slot,2);g.bag.push(upgrade);assert(g.equip(upgrade.id));assert.equal(g.equipped[item.slot].id,upgrade.id);assert.equal(g.bag[0].id,item.id);assert(g.unequip(item.slot));assert.equal(g.bag.length,2);assert(!g.equip(-1));
});
test('four potion types require use, add scaled attributes and consume once',()=>{
 for(const key of Object.keys(ATTRS)){const g=game(),p=g.potion(key,4);g.bag.push(p);g.hero.hp=50;g.hero.stamina=0;assert.equal(g.hero.attributes[key],1);assert(g.drink(p.id));assert.equal(g.hero.attributes[key],5);assert(!g.drink(p.id));assert.equal(g.bag.length,0);if(key==='vitality')assert(g.hero.hp>74);if(key==='energy')assert.equal(g.hero.stamina,g.stats().maxEnergy);}
});
test('potion cap retains excess points',()=>{const g=game(),p=g.potion('strength',5);g.hero.attributes.strength=99;g.bag.push(p);g.drink(p.id);assert.equal(g.hero.attributes.strength,100);assert.equal(g.bag[0].power,4);assert(!g.drink(p.id));});
test('reduced damage and crowd immunity; waiting never restores health',()=>{
 const g=game();g.hero.inv=0;g.hurt();const hp=g.hero.hp;assert.equal(hp,89);g.hurt();assert.equal(g.hero.hp,hp);g.enemies=[];g.shots=[];g.hero.x=54;for(let i=0;i<500;i++)g.tick(.02);assert.equal(g.hero.hp,hp);
});
test('dash consumes energy and gives brief invulnerability',()=>{const g=game();assert(g.dash());assert.equal(g.hero.stamina,32);assert(!g.dash());g.hero.stamina=0;g.dashCooldown=0;assert(!g.dash());});
test('full run: four combat rooms, fifth shop, eighteen points, persistent inventory',()=>{
 const g=game(.99);g.bag.push(g.potion('energy',3));const saved=g.bag[0].id;
 for(let room=1;room<=4;room++){assert.equal(g.room,room);assert.equal(g.enemies.length,room+2);let n=0;while(g.enemies.length&&n++<30){g.hero.inv=100;for(const e of g.enemies){e.x=g.hero.x+20;e.y=g.hero.y;e.fire=100;}g.hero.face=0;g.strike();g.tick(.49);}assert.equal(g.enemies.length,0);assert(g.advance());assert(g.bag.some(i=>i.id===saved));}
 assert.equal(g.mode,'shop');assert.equal(g.room,5);assert.equal(g.kills,18);assert.equal(g.hero.points,18);assert.equal(g.hero.hp,g.stats().maxHp);
});
test('shop random unique stock, no rerolls, checked funds, manual equip',()=>{
 const g=game(.2);g.enterShop();assert.equal(g.stock.length,6);assert.equal(new Set(g.stock.map(i=>i.slot)).size,6);const ids=g.stock.map(i=>i.id);g.enterShop();assert.deepEqual(g.stock.map(i=>i.id),ids);const item=g.stock[0];assert(!g.buy(item.id));g.hero.gold=item.price;assert(g.buy(item.id));assert.equal(g.hero.gold,0);assert(g.bag.some(i=>i.id===item.id));assert(g.equipped.every(i=>!i));assert(!g.buy(item.id));for(let i=0;i<3;i++){assert(g.openChest(i));assert(!g.openChest(i));}
});
test('dragon telegraphs ground attack; death yields luxury chest and one reward',()=>{
 const g=game();g.enterShop();g.enterBoss();assert.equal(g.boss.hp,650);g.boss.timer=.01;g.tick(.02);assert.equal(g.hazards.length,1);assert(g.hazards[0].timer>0);g.hero.x=40;g.hero.y=40;g.hero.inv=0;g.tick(1.01);assert.equal(g.hazards[0].fired,true);assert.equal(g.hero.hp,100);g.hero.x=g.boss.x-50;g.hero.y=g.boss.y;g.hero.face=0;g.boss.hp=1;g.cooldown=0;g.strike();assert.equal(g.mode,'reward');assert(g.chests[0].luxury);const before=g.hero.gold;assert(open(g));assert.equal(g.mode,'won');assert.equal(g.hero.gold,before+200);assert.equal(g.bag.filter(i=>i.kind==='potion').length,4);assert(g.bag.some(i=>i.rank===3));assert(!open(g));
});
test('pause freezes movement; restart clears progression and shop',()=>{
 const g=game();g.paused=true;const x=g.hero.x;g.tick(1,{right:true,hit:true});assert.equal(g.hero.x,x);g.hero.points=12;g.hero.gold=100;g.reset();assert.equal(g.hero.points,0);assert.equal(g.hero.gold,0);assert.equal(g.boss,null);assert.equal(g.stock.length,0);
});
test('attributes control health, damage, speed and attack frequency independently',()=>{
 const g=game(),base=g.stats();g.hero.attributes.vitality=2;assert.equal(g.stats().maxHp,108);assert.equal(g.stats().damage,base.damage);
 g.hero.attributes.strength=2;assert.equal(g.stats().damage,13.5);g.hero.attributes.agility=2;assert(g.stats().speed>base.speed);assert(g.stats().delay<base.delay);
 g.hero.attributes.agility=100;assert(g.stats().delay>=.18);
});
test('healing requires a landed attack, occurs once per swing, and stops at max health',()=>{
 const g=game();g.hero.hp=50;g.strike();assert.equal(g.hero.hp,50);g.cooldown=0;
 for(const e of g.enemies){e.x=g.hero.x+20;e.y=g.hero.y;}g.hero.face=0;g.strike();assert(Math.abs(g.hero.hp-50.6)<1e-9);
 g.cooldown=0;g.paused=true;g.strike();assert(Math.abs(g.hero.hp-50.6)<1e-9);g.paused=false;
 g.hero.hp=99.9;g.strike();assert.equal(g.hero.hp,100);
});
test('healing grows with attributes and level, but is capped by actual damage',()=>{
 const g=game();assert.equal(g.stats().level,1);assert.equal(g.stats().lifeOnHit,.6);g.kills=5;assert.equal(g.stats().level,2);assert.equal(g.stats().lifeOnHit,.7);
 g.hero.attributes.vitality=10;g.hero.attributes.strength=10;g.hero.attributes.agility=10;assert(g.stats().lifeOnHit>.7);
 g.hero.hp=50;g.enemies[0].hp=1;g.enemies[0].x=g.hero.x+20;g.enemies[0].y=g.hero.y;g.hero.face=0;g.strike();assert(Math.abs(g.hero.hp-50.08)<1e-9);
});
test('successful attacks also restore health against the dragon',()=>{
 const g=game();g.enterShop();g.enterBoss();g.hero.hp=50;g.hero.x=g.boss.x-50;g.hero.y=g.boss.y;g.hero.face=0;g.strike();assert(Math.abs(g.hero.hp-50.6)<1e-9);
});
console.log(checks+' rule and progression tests passed.');
