const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../src/engine.js');const {encode,decode}=require('../src/save.js');
function game(chapter=1,roll=.9){const g=new Game(()=>roll);g.reset();if(chapter>1){g.hero.name='Vesper';g.hero.specialization='warrior';g.chapter=chapter;g.spawnRoom();}return g;}
function killAll(g){for(const e of g.enemies){e.hp=0;g.kill(e);}g.enemies=[];if(g.zones)g.zones[g.zoneId].enemies=g.enemies;}
function route(g,target){const q=[[g.zoneId,[]]],seen=new Set();while(q.length){const [id,path]=q.shift();if(id===target)return path;if(seen.has(id))continue;seen.add(id);for(const [dir,next] of Object.entries(g.zones[id].doors))if(next!=='next')q.push([next,[...path,dir]]);}throw Error('unreachable');}
test('chest positions vary, never overlap, stay inside the arena; ghost chance is exactly 30%',()=>{
 const layouts=new Set();let ghosts=0;for(let i=0;i<1000;i++){const g=game(1,i/1000);const bs=g.makeChests(3,'test');layouts.add(JSON.stringify(bs.map(b=>[b.x,b.y])));ghosts+=bs.filter(b=>b.guard==='ghost').length;assert.equal(new Set(bs.map(b=>`${b.x},${b.y}`)).size,3);assert(bs.every(b=>b.x>=80&&b.x<=400&&b.y>=70&&b.y<=220));}assert(layouts.size>10);assert.equal(ghosts,900);
});
test('ghost summons only on approach, attacks, locks chest, awards its loot only once',()=>{
 const g=game(1,0);g.enemies=[];g.chests=g.chests.slice(0,1);const b=g.chests[0];g.hero.x=460;g.hero.y=240;g.tick(.01);assert.equal(g.enemies.length,0);
 g.hero.x=b.x-20;g.hero.y=b.y;assert(!g.openChest());const e=g.enemies[0];assert.equal(e.kind,'ghost');g.triggerChests();assert.equal(g.enemies.length,1);
 e.phase='windup';e.face=Math.PI;e.timer=0;g.hero.inv=0;const hp=g.hero.hp;g.tick(.01);assert(g.hero.hp<hp);
 e.hp=0;g.kill(e);const kills=g.kills;g.kill(e);assert.equal(g.kills,kills);g.enemies=[];assert(g.openChest());const size=g.bag.length;assert(!g.openChest());assert.equal(g.bag.length,size);
});
test('violet chest has exactly two dormant elites, immune until proximity, then both attack',()=>{
 const g=game(2);g.enterZone('east');const b=g.chests[0],guards=g.enemies.filter(e=>e.guardian===b.id);assert(b.special);assert.equal(guards.length,2);assert(guards.every(e=>e.dormant));
 g.enemies=guards;g.hero.x=460;g.hero.y=240;const positions=guards.map(e=>[e.x,e.y]);g.tick(.2);assert.deepEqual(guards.map(e=>[e.x,e.y]),positions);
 g.friendlyShots=[{x:guards[0].x,y:guards[0].y,vx:0,vy:0,life:1,damage:999,type:'arrow',owner:'hero'}];g.friendlyTick(0);assert.equal(guards[0].hp,guards[0].max);
 g.hero.x=b.x;g.hero.y=b.y;g.triggerChests();assert(guards.every(e=>!e.dormant));assert(!g.openChest());guards[0].hp=0;g.kill(guards[0]);assert(!g.openChest());guards[1].hp=0;g.kill(guards[1]);assert(g.openChest());
});
test('melee closes distance, area marks delayed damage, ranged fires a projectile',()=>{
 const g=game(2);g.chests=[];g.hero.x=100;g.hero.y=140;g.hero.inv=0;const e=g.makeEnemy('melee',180,140);g.enemies=[e];g.tick(.1);assert(e.x<180);assert.equal(g.shots.length,0);
 g.enemies=[g.makeEnemy('area',250,140,{fire:0})];const hp=g.hero.hp;g.tick(.01);assert.equal(g.hero.hp,hp);assert.equal(g.hazards.length,1);assert(!g.hazards[0].fired);g.tick(1.01);assert(g.hero.hp<hp);
 g.hazards=[];g.enemies=[g.makeEnemy('caster',250,140,{fire:0})];g.tick(.01);assert.equal(g.shots.length,1);
});
test('guardian activation, chest opening and key progress survive save/load without respawning',()=>{
 const g=game(3);g.enterZone('east');const b=g.chests[0];g.hero.x=b.x;g.hero.y=b.y;g.triggerChests();g.keyFragments=['fang'];let r=decode(encode(g));assert(r);assert.deepEqual(r.keyFragments,['fang']);assert(r.chests[0].triggered);assert(r.enemies.filter(e=>e.guardian).every(e=>!e.dormant));r.paused=false;killAll(r);assert(r.openChest());r=decode(encode(r));assert(r.chests[0].open);r.paused=false;r.triggerChests();assert.equal(r.enemies.length,0);
});
test('legacy chapter II completion can continue into III preserving equipment and vault',()=>{
 const g=game(2);g.enterShop();g.enterBoss();g.defeatBoss();g.hero.x=330;g.hero.y=136;g.openChest();g.mode='won';g.vault.push(g.gear(5));const data=JSON.parse(encode(g));delete data.data.keyFragments;const r=decode(JSON.stringify(data));assert(r);const vault=JSON.stringify(r.vault);assert(r.beginChapter3());assert.equal(JSON.stringify(r.vault),vault);assert.equal(r.chapter,3);assert(!r.beginChapter3());
});
test('entire act III is connected and both distinct elite fragments unlock the final boss',()=>{
 const g=game(3);for(let room=1;room<=4;room++){
  for(const z of Object.values(g.zones)){assert(z.enemies.length>=3);assert(z.enemies.every(e=>e.species==='spider'));}
  for(const id of ['hub','north','east','south','west','cross','exit']){for(const dir of route(g,id)){killAll(g);g.doorCooldown=0;assert(g.travel(dir));}killAll(g);}
  const dir=Object.keys(g.doors()).find(d=>g.doors()[d]==='next');g.doorCooldown=0;assert(g.travel(dir));
 }
 assert.equal(g.mode,'shop');assert.deepEqual(g.keyFragments,['fang','silk']);const r=decode(encode(g));assert(r);r.paused=false;assert(r.enterBoss());assert.equal(r.boss.kind,'spider-queen');assert.equal(r.ally,null);
});
test('boss gate requires two fragments; duplicate elite kills cannot duplicate the key',()=>{
 const g=game(3);g.enterShop();assert(!g.enterBoss());const e=g.makeEnemy('elite',100,100,{keyFragment:'fang'});g.kill(e);g.kill(e);assert.deepEqual(g.keyFragments,['fang']);assert(!g.enterBoss());g.kill(g.makeEnemy('elite',100,100,{keyFragment:'silk'}));assert(g.enterBoss());
});
test('Aracnia telegraphs all four attacks; brood is capped, targetable and pause freezes attacks',()=>{
 for(let cycle=0;cycle<4;cycle++){
  const g=game(3);g.keyFragments=['fang','silk'];g.enterShop();g.enterBoss();g.boss.cycle=cycle;g.boss.timer=0;g.spiderBossTick(.01);assert.equal(g.boss.phase,'warning');assert.equal(g.shots.length,0);assert.equal(g.enemies.length,0);
  const state=JSON.stringify(g.boss);g.paused=true;g.tick(1);assert.equal(JSON.stringify(g.boss),state);g.paused=false;
  g.spiderBossTick(1.21);if(cycle===0)assert(g.boss.swing>0);if(cycle===1)assert(g.hazards.every(h=>h.type==='web'));if(cycle===2)assert.equal(g.shots.length,7);
  if(cycle===3){assert.equal(g.enemies.length,3);g.boss.cycle=3;g.boss.timer=0;g.spiderBossTick(.01);g.spiderBossTick(1.21);assert.equal(g.enemies.length,6);const e=g.enemies[0];g.friendlyShots=[{x:e.x,y:e.y,vx:0,vy:0,life:1,damage:999,owner:'hero',type:'arrow'}];g.friendlyTick(0);assert.equal(g.enemies.length,5);assert.equal(g.mode,'boss');}
  assert(decode(encode(g)));
 }
});
test('Aracnia defeat clears adds and hazards, grants one final chest and ends the third act',()=>{
 const g=game(3);g.keyFragments=['fang','silk'];g.enterShop();g.enterBoss();g.enemies.push(g.makeEnemy('melee',100,100,{species:'spider'}));g.defeatBoss();assert.equal(g.enemies.length,0);assert.equal(g.hazards.length,0);g.hero.x=330;g.hero.y=136;assert(g.openChest());assert.equal(g.mode,'won');assert(!g.openChest());assert(decode(encode(g)));g.reset();assert.deepEqual(g.keyFragments,[]);
});
test('last active enemy opens doors and clears the sector even with dormant guardians remaining',()=>{
 const g=game(2);g.enterZone('east');const b=g.chests[0];g.enemies=g.enemies.filter(e=>e.dormant);const e=g.makeEnemy('melee',220,140,{hp:1});g.enemies.push(e);g.hero.x=200;g.hero.y=140;g.hero.face=0;g.strike();assert.equal(g.combatants().length,0);assert(g.zones.east.cleared);assert.equal(g.zones.east.enemies,g.enemies);assert(g.enemies.every(e=>e.dormant));assert(!b.triggered);
});
