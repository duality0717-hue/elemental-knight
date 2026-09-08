const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../game.html'),'utf8');
const nodes=new Map();const context=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
function element(){return {textContent:'',hidden:true,dataset:{},children:[],append(...e){this.children.push(...e);},replaceChildren(){this.children=[];},setAttribute(){},addEventListener(){},focus(){},getContext(){return context;}};}
const root=element();root.querySelector=s=>{if(!nodes.has(s))nodes.set(s,element());return nodes.get(s);};root.querySelectorAll=()=>[];
let script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
script=script.replace('equipment();hero=',`globalThis.test={restart,tick,strike,stats,slots,render,togglePause,openChest,lootChance,hurt,get:()=>({state,room,kills,hero,enemies,shots,chests}),place:()=>{for(const e of enemies){e.x=hero.x+20;e.y=hero.y;e.fire=100;}hero.face=0;},door:()=>{hero.x=459;hero.y=136;}};equipment();hero=`);
const math=Object.create(Math);math.random=()=>.9;
const box={document:{getElementById:()=>root,createElement:element,addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},Math:math};
vm.createContext(box);vm.runInContext(script,box);const a=box.test;
function reset(){math.random=()=>.9;a.restart();}
function chest(n,roll){const s=a.get();s.hero.x=s.chests[n].x;s.hero.y=s.chests[n].y;math.random=()=>roll;a.openChest();}
reset();assert.equal(a.get().hero.gold,0);assert.equal(a.stats().damage,16);assert.equal(a.stats().armor,0);assert(a.slots.every(s=>!s.owned&&!s.on));
assert.equal(nodes.get('#ed-armor').children[0].children[0].disabled,true);
a.openChest();assert(a.get().chests.every(c=>!c.open),'Out of range cannot open chests');
chest(0,.05);assert(a.get().chests[0].open);assert(a.slots.every(s=>!s.owned),'5% boundary fails');
chest(0,0);assert(a.slots.every(s=>!s.owned),'Opened chest cannot reroll');
chest(1,.049999);assert.equal(a.slots.filter(s=>s.owned).length,1,'Below 5% gets one item');assert(a.slots[0].on,'Loot auto equips');
chest(2,0);assert.equal(a.slots.filter(s=>s.owned).length,2,'No duplicate equipment');
const owned=a.slots.filter(s=>s.owned).length;a.togglePause();const x=a.get().hero.x;a.tick(1);a.strike();a.openChest();assert.equal(a.get().hero.x,x);a.togglePause();
reset();let gold=0;
for(let r=1;r<=5;r++){
 assert.equal(a.get().room,r);assert.equal(a.get().enemies.length,r+2);assert.equal(Math.round(a.lootChance()*100),r*5);
 assert.equal(a.get().chests.length,3);assert(a.get().chests.every(c=>!c.open));
 // Kill with bare hands; isolate collision to exercise combat and progression deterministically.
 let hits=0;while(a.get().enemies.length&&hits++<25){a.get().hero.inv=100;a.place();a.strike();a.tick(.44);a.render();}
 assert.equal(a.get().enemies.length,0);assert(a.get().hero.gold>gold);gold=a.get().hero.gold;
 const after=a.get().hero.gold;a.tick(.5);a.strike();assert.equal(a.get().hero.gold,after,'No repeat kill rewards');
 if(r===1){chest(0,0);assert(a.slots[0].owned);}
 if(r>1)assert(a.slots[0].owned,'Equipment persists across rooms');
 math.random=()=>.9;a.door();a.tick(.01);
}
assert.equal(a.get().state,'won');assert.equal(a.get().kills,25);assert.equal(a.get().hero.gold,370,'Expected per-room gold payouts');
reset();assert.equal(a.get().hero.gold,0);assert.equal(a.get().kills,0);assert(a.slots.every(s=>!s.owned));
a.get().hero.inv=0;a.get().hero.hp=1;a.hurt();assert.equal(a.get().state,'dead');const n=a.get().enemies.length;a.strike();a.openChest();assert.equal(a.get().enemies.length,n);
reset();a.slots.forEach(s=>s.owned=s.on=true);assert.equal(a.stats().damage,34);assert.equal(a.stats().armor,7);assert(a.stats().frost);a.render();
console.log('PASS: empty starting loadout; locked slots; chest range, 5% boundary, one roll, no duplicates; auto equip; 5 rooms/25 kills; gold; persistence; restart; death; set bonuses.');
