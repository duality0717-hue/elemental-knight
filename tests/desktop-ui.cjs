const {app,BrowserWindow}=require('electron');
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'elemental-knight-ui-')));
app.whenReady().then(async()=>{
  const window=new BrowserWindow({width:1440,height:1100,show:false,webPreferences:{contextIsolation:true,nodeIntegration:false}});
  const timer=setTimeout(()=>{console.error('UI test timeout');app.exit(1);},30000);
  try{
    await window.loadFile(path.join(__dirname,'../index.html'));
    const result=await window.webContents.executeJavaScript(`(async()=>{
      const assert=(condition,message)=>{if(!condition)throw new Error(message);};
      const S=globalThis.ElementalSession;assert(S,'game boot');
      document.querySelector('#ek-start').click();
      const g=S.get();g.paused=true;
      for(const slot of ElementalEngine.ARTIFACT_SLOTS){const item=g.gear(slot,1,{element:'ice',weapon:slot===8?'shield':'sword'});g.bag.push(item);g.equip(item.id);}
      S.refresh();document.querySelector('#ek-panel').click();
      assert(document.querySelectorAll('.ek-slot').length===10,'ten slots');
      assert(document.querySelector('#ek-bonuses').textContent.includes('Invierno eterno'),'set skill');
      document.querySelector('#ek-close').click();
      const button=[...document.querySelectorAll('button')].find(b=>b.textContent==='Lobby · Cuenta y baúl');button.click();
      assert(document.querySelector('#ek-lobby').open,'lobby opens');
      const item=g.acquireGear();S.refresh();document.querySelector('#ek-lobby-close').click();button.click();
      const deposit=document.querySelector('#ek-vault-bag button');assert(deposit,'deposit button');deposit.click();
      assert(g.vault.some(i=>i.id===item.id),'vault deposit');
      document.querySelector('#ek-vault-items button').click();assert(!g.vault.length,'vault withdrawal');
      assert(document.querySelector('#ek-account-form button').disabled,'unconfigured online login disabled');
      return 'PASS: game boot, ten slots, elemental skill, lobby, vault transfers, account gate';
    })()`);
    console.log(result);clearTimeout(timer);app.exit(0);
  }catch(error){console.error(error);clearTimeout(timer);app.exit(1);}
});
