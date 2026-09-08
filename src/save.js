(function(scope){
  'use strict';
  const {Game,ATTRS,CLASSES}=scope.ElementalEngine;
  const finite=(o,keys)=>o&&keys.every(k=>Number.isFinite(o[k]));
  const list=(items,check)=>Array.isArray(items)&&items.length<=2048&&items.every(check);
  const gear=i=>i&&Number.isInteger(i.id)&&i.kind==='gear'&&Number.isInteger(i.slot)&&i.slot>=0&&i.slot<8&&Number.isInteger(i.rank)&&i.rank>=1&&i.rank<=100;
  const item=i=>gear(i)||(i&&Number.isInteger(i.id)&&i.kind==='potion'&&Object.hasOwn(ATTRS,i.attribute)&&Number.isFinite(i.power)&&i.power>0);
  const equipment=a=>Array.isArray(a)&&a.length===8&&a.every(i=>i===null||gear(i));
  const enemy=e=>finite(e,['x','y','hp','max','slow','fire','timer','face','swing'])&&['elite','caster'].includes(e.kind)&&['chase','windup','recover'].includes(e.phase);
  const chest=b=>finite(b,['x','y'])&&typeof b.open==='boolean';
  const zone=z=>finite(z,['x','y'])&&typeof z.name==='string'&&z.doors&&list(z.enemies,enemy)&&list(z.chests,chest);
  function valid(d){
    if(!d||![1,2].includes(d.chapter)||!Number.isInteger(d.room)||d.room<1||d.room>5||!['play','boss','shop','awakening','reward','chapter-complete','won'].includes(d.mode))return false;
    if(!finite(d,['nextId','kills','chapterKills','time','attack','cooldown','dashTime','dashCooldown','doorCooldown','revision']))return false;
    if(!finite(d.hero,['x','y','hp','stamina','gold','points','inv','face','slow','poison','poisonTick'])||d.hero.hp<=0||typeof d.hero.name!=='string'||d.hero.name.length>40)return false;
    if(d.hero.specialization!==null&&!Object.hasOwn(CLASSES,d.hero.specialization))return false;
    if(d.chapter===2&&!d.hero.specialization)return false;
    if(!Object.keys(ATTRS).every(k=>Number.isInteger(d.hero.attributes?.[k])&&d.hero.attributes[k]>=1&&d.hero.attributes[k]<=100))return false;
    if(!equipment(d.equipped)||!list(d.bag,item)||!list(d.stock,i=>gear(i)&&Number.isFinite(i.price)))return false;
    if(!list(d.enemies,enemy)||!list(d.chests,chest)||!list(d.shots,p=>finite(p,['x','y','vx','vy','life']))||!list(d.friendlyShots,p=>finite(p,['x','y','vx','vy','life','damage'])))return false;
    if(!list(d.hazards,h=>finite(h,['x','y','radius','timer','life']))||!list(d.notices,n=>finite(n,['x','y','life'])&&typeof n.text==='string')||!Array.isArray(d.effects))return false;
    if(d.boss!==null&&(!finite(d.boss,['x','y','hp','max','timer','cycle','hit','face','swing'])||!['rest','warning'].includes(d.boss.phase)||(d.chapter===1&&!equipment(d.boss.equipment))))return false;
    if(d.mode==='boss'&&!d.boss)return false;
    if(d.ally!==null&&(!finite(d.ally,['x','y','hp','face','fire','swing'])||!equipment(d.ally.equipment)))return false;
    if(d.zones!==null){if(typeof d.zones!=='object'||Object.keys(d.zones).length!==7||!Object.hasOwn(d.zones,d.zoneId)||!Object.values(d.zones).every(zone))return false;
      for(const z of Object.values(d.zones))for(const [dir,target] of Object.entries(z.doors))if(!['up','right','down','left'].includes(dir)||(target!=='next'&&!Object.hasOwn(d.zones,target)))return false;
    }else if(d.chapter===2&&d.mode==='play')return false;
    return true;
  }
  function encode(game){
    if(['ready','dead'].includes(game.mode)||game.hero.hp<=0)return null;
    const data=JSON.parse(JSON.stringify(game));
    if(data.zones&&data.zoneId){data.zones[data.zoneId].enemies=data.enemies;data.zones[data.zoneId].chests=data.chests;}
    return JSON.stringify({version:1,savedAt:new Date().toISOString(),data});
  }
  function decode(text){
    try{if(typeof text!=='string'||text.length>1000000)return null;const save=JSON.parse(text);if(save.version!==1||!valid(save.data))return null;
      const g=new Game();for(const key of Object.keys(g))if(key!=='random'&&Object.hasOwn(save.data,key))g[key]=save.data[key];
      if(g.zones){g.zones[g.zoneId].enemies=g.enemies;g.zones[g.zoneId].chests=g.chests;}
      g.paused=['play','boss','reward'].includes(g.mode);g.dashTime=0;g.revision++;return g;
    }catch{return null;}
  }
  scope.ElementalSave={encode,decode};
  if(typeof module!=='undefined'&&module.exports)module.exports=scope.ElementalSave;
})(globalThis);
