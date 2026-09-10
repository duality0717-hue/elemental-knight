const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'knight-encounters-ui-')));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({width:1440,height:1100,show:false,webPreferences:{contextIsolation:true,nodeIntegration:false,backgroundThrottling:false}});
 const timer=setTimeout(()=>{console.error('Encounter UI timeout');app.exit(1);},30000);
 try{
  await win.loadFile(path.join(__dirname,'../index.html'));
  await win.webContents.executeJavaScript(`window.qaErrors=[];window.addEventListener('error',e=>qaErrors.push(e.message));`);
  for(const state of ['ghost','guardians','cave','queen','transition']){
   await win.webContents.executeJavaScript(`(()=>{
    const S=ElementalSession,g=S.get(),assert=(v,m)=>{if(!v)throw Error(m);};g.reset();
    if('${state}'==='ghost'){g.enemies=[g.makeEnemy('ghost',300,140)];}
    else{g.hero.name='Vesper';g.hero.specialization='warrior';g.chapter='${state}'==='guardians'?2:3;g.spawnRoom();
     if('${state}'==='guardians'){g.enterZone('east');assert(g.chests[0].special,'violet chest');assert(g.enemies.filter(e=>e.dormant).length===2,'two dormant guardians');}
     if('${state}'==='queen'){g.keyFragments=['fang','silk'];g.enterShop();g.enterBoss();g.boss.cycle=1;g.boss.timer=0;g.spiderBossTick(.01);assert(g.boss.kind==='spider-queen','queen loaded');}
     if('${state}'==='transition'){g.chapter=2;g.mode='chapter-complete';g.rewardClaimed=true;S.refresh();const button=document.querySelector('#ek-next-chapter');assert(!button.hidden&&button.textContent.includes('III'),'act III button');button.click();assert(g.chapter===3,'transition button works');}
    }
    g.paused=true;S.refresh();
    if(g.chapter===3)assert(document.querySelector('#ek-title').textContent==='Las cavernas de seda','cave title');
   })()`);
   await win.webContents.executeJavaScript('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
   const errors=await win.webContents.executeJavaScript('qaErrors');if(errors.length)throw Error(errors.join('; '));
   if(process.env.EK_QA_DIR){fs.mkdirSync(process.env.EK_QA_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.EK_QA_DIR,state+'.png'),(await win.webContents.capturePage()).toPNG());}
  }
  console.log('PASS: ghost, dormant guardians, cavern, Aracnia render and chapter III button');clearTimeout(timer);app.exit(0);
 }catch(e){console.error(e);clearTimeout(timer);app.exit(1);}
});
