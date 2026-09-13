// Derive expectations from the unchanged Electron engine, never hand-copy results.
const {Game}=require('../src/engine.js');
const fs=require('node:fs');
const cases=[];
for(let n=0;n<128;n++){
 const g=new Game(()=>.5);g.mode='play';g.kills=n;
 const attributes=Object.fromEntries(['strength','energy','vitality','agility'].map((k,i)=>[k,n===0?1:1+(n*(i+3))%100]));
 g.hero.attributes=attributes;
 g.equipped=Array.from({length:10},(_,slot)=>n===0||n%7===slot%7?null:{id:slot+1,kind:'gear',slot,element:n%3===0?'ice':['ice','electric','magma','poison'][(slot+n)%4],quality:[5,6,7].includes(slot)?null:['bronze','silver','gold'][(n+slot)%3],level:n%26,weapon:slot===4?['sword','staff','bow','greatsword'][n%4]:slot===8?['sword','staff','shield'][n%3]:undefined});
 const expected=g.stats();g.hero.hp=expected.maxHp;g.hero.inv=0;g.hurt(35);
 cases.push({attributes,kills:n,equipment:g.equipped,expected,damage35:expected.maxHp-g.hero.hp});
}
const boundaries=[0,.049999999,.05,.149999999,.15,.999999999].map(roll=>{const g=new Game(()=>.5);g.random=()=>roll;const item=g.rollLoot();return {roll,kind:item.kind,amount:item.amount??0};});
const g=new Game(()=>.5);g.mode='play';g.hero.inv=0;g.dash();
const result={cases,boundaries,dash:{cost:52-g.hero.stamina,duration:g.dashTime,cooldown:g.dashCooldown,invulnerability:g.hero.inv},enemy:g.makeEnemy('melee',0,0)};
fs.writeFileSync('godot/tests/reference.json',JSON.stringify(result,null,2)+'\n');
console.log(`Generated ${cases.length} stat fixtures from src/engine.js`);
