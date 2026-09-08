// Developer-only browser fixtures. Never loaded by the playable build.
const fs=require('node:fs'),path=require('node:path');
const base=path.join(__dirname,'..');fs.mkdirSync(path.join(base,'.qa'),{recursive:true});
const source=fs.readFileSync(path.join(base,'game.html'),'utf8');
const states={
 character:"game.reset(); game.hero.points=12; game.hero.gold=180; for(let i=0;i<8;i++)game.bag.push(game.gear(i)); for(const key of Object.keys(ATTRS))game.bag.push(game.potion(key,3)); game.equip(game.bag[0].id); game.equip(game.bag.find(i=>i.kind==='gear'&&i.slot===4).id);",
 shop:"game.reset(); game.hero.gold=310; game.enterShop();",
 boss:"game.reset(); game.enterShop(); game.enterBoss(); game.paused=true;",
 awakening:"game.reset(); game.enterShop(); game.enterBoss(); game.boss.hp=0; game.mode='awakening';",
 elite:"game.reset(); game.room=3; game.spawnRoom(); game.paused=true;",
 chapter2:"game.reset(); game.hero.name='Vesper'; game.hero.specialization='mage'; game.mode='chapter-complete'; game.equipped[4]=game.gear(4,2); game.beginChapter2(); game.paused=true;",
 plague:"game.reset(); game.hero.name='Vesper'; game.hero.specialization='warrior'; game.mode='chapter-complete'; game.equipped[0]=game.gear(0,2); game.equipped[4]=game.gear(4,2); game.beginChapter2(); game.enterShop(); game.enterBoss(); game.boss.cycle=1; game.boss.timer=0; game.plagueTick(.01); game.paused=true;",
 descent:"game.reset(); game.hero.name='Vesper'; game.hero.specialization='rogue'; game.mode='chapter-complete';",
 mobile:"game.reset(); game.hero.name='Vesper'; game.hero.specialization='rogue'; game.mode='chapter-complete'; game.beginChapter2(); game.paused=true;"
};
for(const [name,setup] of Object.entries(states)){
 let html=source.replace('const canvas =',setup+'\n  const canvas =');
 if(name==='character')html=html.replace('  refresh();\n  function frame','  togglePanel();\n  function frame');
 fs.writeFileSync(path.join(base,'.qa',name+'.html'),'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QA '+name+'</title><style>body{margin:0;background:#090f16;'+(name==='mobile'?'max-width:360px;':'')+'}</style></head><body>'+html+'</body></html>');
}
console.log('Character, shop and boss browser fixtures generated.');
