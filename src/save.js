(function(scope){
  'use strict';
  const {Game,ATTRS,CLASSES,ELEMENTS,QUALITIES,WEAPONS,twoHanded}=scope.ElementalEngine;
  const finite=(o,keys)=>o&&keys.every(k=>Number.isFinite(o[k]));
  const list=(items,check)=>Array.isArray(items)&&items.length<=2048&&items.every(check);
  const gear=i=>i&&Number.isInteger(i.id)&&i.kind==='gear'&&Number.isInteger(i.slot)&&i.slot>=0&&i.slot<10&&Number.isInteger(i.rank)&&i.rank>=1&&i.rank<=100&&Object.hasOwn(ELEMENTS,i.element)&&Number.isInteger(i.level)&&i.level>=0&&i.level<=25&&([5,6,7].includes(i.slot)?i.quality===null:Object.hasOwn(QUALITIES,i.quality))&&(![4,8].includes(i.slot)||Object.hasOwn(WEAPONS,i.weapon))&&(i.slot!==4||i.weapon!=='shield')&&(i.slot!==8||!twoHanded(i))&&(i.slot!==9||['cape','wings'].includes(i.style));
  const item=i=>gear(i)||(i&&Number.isInteger(i.id)&&i.kind==='potion'&&Object.hasOwn(ATTRS,i.attribute)&&Number.isFinite(i.power)&&i.power>0);
  const equipment=a=>Array.isArray(a)&&a.length===10&&a.every((i,slot)=>i===null||(gear(i)&&i.slot===slot))&&!(twoHanded(a[4])&&a[8]);
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
    if(!equipment(d.equipped)||!list(d.bag,item)||!list(d.vault,item)||d.vault.length>200||!list(d.stock,i=>gear(i)&&Number.isFinite(i.price)))return false;
    if(![0,1,2].includes(d.evolution)||(!Number.isFinite(d.skillCooldown))||d.skillCooldown<0||d.skillCooldown>18||(d.equipped[9]&&d.evolution<2))return false;
    if(d.skillEffect!==null&&(!finite(d.skillEffect,['x','y','radius','life'])||!Object.hasOwn(ELEMENTS,d.skillEffect.element)))return false;
    if(!Number.isInteger(d.nextId)||d.nextId<1)return false;
    const ids=[...d.equipped.filter(Boolean),...d.bag,...d.vault].map(i=>i.id);if(new Set(ids).size!==ids.length||ids.some(id=>id<1||id>=d.nextId))return false;
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
    return JSON.stringify({version:2,savedAt:new Date().toISOString(),data});
  }
  function decode(text){
    try{if(typeof text!=='string'||text.length>1000000)return null;const save=JSON.parse(text);if(![1,2].includes(save.version))return null;
      if(save.version===1){const d=save.data;const migrate=i=>{if(!i||i.kind!=='gear')return; i.element='ice';i.level=Math.min(25,Math.max(0,(i.rank||1)-1));i.quality=[5,6,7].includes(i.slot)?null:['bronze','silver','gold'][Math.min(2,(i.rank||1)-1)];if(i.slot===4)i.weapon='sword';};
        for(const a of [d.equipped,d.bag,d.stock,d.boss?.equipment,d.ally?.equipment])if(Array.isArray(a))a.forEach(migrate);
        for(const a of [d.equipped,d.boss?.equipment,d.ally?.equipment])if(Array.isArray(a)&&a.length===8)a.push(null,null);
        d.evolution=d.chapter===2&&['reward','won'].includes(d.mode)?2:d.hero?.specialization?1:0;d.skillCooldown=0;d.skillEffect=null;d.vault=[];
      }
      if(!valid(save.data))return null;
      const g=new Game();for(const key of Object.keys(g))if(key!=='random'&&Object.hasOwn(save.data,key))g[key]=save.data[key];
      if(g.zones){g.zones[g.zoneId].enemies=g.enemies;g.zones[g.zoneId].chests=g.chests;}
      g.paused=['play','boss','reward'].includes(g.mode);g.dashTime=0;g.revision++;return g;
    }catch{return null;}
  }
  scope.ElementalSave={encode,decode};
  if(typeof module!=='undefined'&&module.exports)module.exports=scope.ElementalSave;
})(globalThis);
