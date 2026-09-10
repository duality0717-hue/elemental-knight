const test=require('node:test'),assert=require('node:assert/strict');
const {Game,ARMOR_SLOTS,ARTIFACT_SLOTS,ELEMENTS}=require('../src/engine.js');
const {encode,decode}=require('../src/save.js');
const game=()=>{const g=new Game(()=>.1);g.reset();return g;};
function equip(g,slot,options={}){const item=g.gear(slot,1,{element:'ice',weapon:slot===8?'shield':'sword',...options});g.bag.push(item);assert(g.equip(item.id));return item;}
test('five slots per group; normal drops zero; all qualities and elements generated',()=>{
  assert.equal(ARMOR_SLOTS.length,5);assert.equal(ARTIFACT_SLOTS.length,5);const g=game(),elements=new Set(),qualities=new Set();
  let seed=47;g.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  for(let i=0;i<300;i++){const item=g.acquireGear();assert.equal(item.level,0);assert.notEqual(item.slot,9);elements.add(item.element);if(item.quality)qualities.add(item.quality);g.bag=[];}
  assert.equal(elements.size,4);assert.equal(qualities.size,3);
});
test('both one-handed orders work; shield quality/level; two-handed returns secondary intact',()=>{
  const g=game();const staff=equip(g,4,{weapon:'staff'}),sword=equip(g,8,{weapon:'sword'});
  assert.equal(g.weaponType(),'staff');g.unequip(4);g.unequip(8);assert(g.equip(sword.id,4));assert(g.equip(staff.id,8));
  const shield=equip(g,8,{weapon:'shield',quality:'gold',level:25});assert.equal(g.equipped[8].quality,'gold');
  const bow=equip(g,4,{weapon:'bow'});assert.equal(g.equipped[8],null);assert(g.bag.some(i=>i.id===shield.id));assert(!g.equip(shield.id));
  assert(!g.equip(staff.id,8));g.unequip(4);assert(g.equip(shield.id));assert(!g.equip(bow.id,8));
  equip(g,4,{weapon:'greatsword'});assert.equal(g.equipped[8],null);
});
test('sets require all five positions; two-handed covers two; mixed elements cannot unlock',()=>{
  const g=game();for(const slot of ARTIFACT_SLOTS)equip(g,slot);assert.equal(g.artifactSet(),'ice');
  g.equipped[8].element='poison';assert.equal(g.artifactSet(),null);equip(g,4,{weapon:'bow'});assert.equal(g.artifactSet(),'ice');
  g.unequip(6);assert.equal(g.artifactSet(),null);
});
test('all elemental skills damage targets, cost energy and respect pause/cooldown',()=>{
  for(const element of Object.keys(ELEMENTS)){const g=game();for(const slot of ARTIFACT_SLOTS)equip(g,slot,{element});const e=g.enemies[0];e.hp=e.max=1000;e.x=g.hero.x+25;e.y=g.hero.y;
    const energy=g.hero.stamina;g.paused=true;assert(!g.skill());g.paused=false;assert(g.skill());assert(e.hp<1000);assert.equal(g.hero.stamina,energy-25);assert(!g.skill());
    g.paused=true;g.tick(1);assert.equal(g.skillCooldown,18);if(element==='poison')assert(e.venom);if(element==='ice')assert.equal(e.slow,4);
  }
});
test('elite drops rewarded only once; boss rewards higher level; cape unlocks after second evolution',()=>{
  const g=game();g.random=()=>0;const e={kind:'elite',x:20,y:20};g.kill(e);g.kill(e);assert.equal(g.bag.length,1);assert(g.bag[0].level>0);
  assert(g.acquireGear(3,'boss').level>0);const cape=g.gear(9);g.bag.push(cape);assert(!g.equip(cape.id));
  g.chapter=2;g.enterShop();g.enterBoss();g.defeatBoss();assert.equal(g.evolution,2);assert(g.equip(cape.id));
});
test('vault transfers preserve unique identity and survive restart and save roundtrip',()=>{
  const g=game(),item=g.acquireGear();assert(!g.transferVault(item.id));g.paused=true;assert(g.transferVault(item.id));assert(!g.transferVault(item.id));
  assert.equal(g.bag.length,0);const restored=decode(encode(g));assert.deepEqual(restored.vault,g.vault);
  restored.reset();assert.equal(restored.vault[0].id,item.id);assert(restored.acquireGear().id>item.id);
  restored.paused=true;assert(restored.transferVault(item.id,true));assert.equal(restored.vault.length,0);
});
test('v1 saves migrate to ten slots, preserving old gear ids and levels',()=>{
  const g=game();g.equipped[4]=g.gear(4,2);let save=JSON.parse(encode(g));save.version=1;save.data.equipped=save.data.equipped.slice(0,8);
  save.data.equipped[4]={id:1,kind:'gear',slot:4,rank:2};delete save.data.vault;delete save.data.evolution;
  const r=decode(JSON.stringify(save));assert(r);assert.equal(r.equipped.length,10);assert.equal(r.equipped[4].id,1);assert.equal(r.equipped[4].level,1);assert.equal(r.equipped[4].quality,'silver');
});
test('invalid levels, illegal loadouts and duplicated vault IDs rejected on load',()=>{
  const g=game();equip(g,4);let s=JSON.parse(encode(g));s.data.equipped[4].level=26;assert.equal(decode(JSON.stringify(s)),null);
  s=JSON.parse(encode(g));s.data.vault=[s.data.equipped[4]];assert.equal(decode(JSON.stringify(s)),null);
  equip(g,8);s=JSON.parse(encode(g));s.data.equipped[4].weapon='bow';assert.equal(decode(JSON.stringify(s)),null);
});

test('all loot sources share exactly one 5/10/85 roll',()=>{
 for(const source of ['normal','elite','boss']){const g=game();const counts={gear:0,potion:0,gold:0};
 for(let n=0;n<10000;n++){g.random=()=>n/10000;const item=g.rollLoot(source);counts[item.kind]++;g.bag=[];}
 assert.deepEqual(counts,{gear:500,potion:1000,gold:8500});}
});
test('selling bag and equipped items credits gold once and survives save',()=>{
 const g=game(),item=g.acquireGear();const price=g.salePrice(item);assert(g.sell(item.id));assert.equal(g.hero.gold,price);assert(!g.sell(item.id));
 const sword=equip(g,4);const value=g.salePrice(sword);assert(g.sell(sword.id,'equipped'));assert.equal(g.equipped[4],null);assert.equal(g.hero.gold,price+value);assert(!g.sell(sword.id,'equipped'));
 const restored=decode(encode(g));assert.equal(restored.hero.gold,g.hero.gold);assert.equal(restored.bag.length,0);
});
