const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { EventEmitter } = require('node:events');
async function setup(saved = 'manual') {
  const handlers = {}, disk = {}, updater = new EventEmitter();
  let checks = 0, downloads = 0, installs = 0, quitHandlers = 0;
  updater.checkForUpdates = async () => { checks++; updater.emit('update-available', {version:'0.7.1'}); };
  updater.downloadUpdate = async () => { downloads++; updater.emit('update-downloaded'); };
  updater.quitAndInstall = () => installs++;
  updater.addQuitHandler = () => quitHandlers++;
  const contents = new EventEmitter(); contents.mainFrame = {}; contents.send = () => {}; contents.setWindowOpenHandler = () => {};
  class Window { constructor() { this.webContents = contents; } isDestroyed() { return false; } loadFile() {} }
  const app = { isPackaged:true, setPath(){}, getPath(){return '/test';}, getVersion(){return '0.7.0';}, whenReady:()=>Promise.resolve(), on(){}, quit(){} };
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../desktop/main.cjs'),'utf8'), {
    require(name) {
      if(name==='electron') return {app,BrowserWindow:Window,ipcMain:{handle:(n,cb)=>handlers[n]=cb}};
      if(name==='electron-updater') return {autoUpdater:updater};
      if(name==='node:fs') return {readFileSync:()=>JSON.stringify({mode:saved}),mkdirSync(){},writeFileSync:(p,v)=>disk[p]=v,renameSync:(a,b)=>disk[b]=disk[a]};
      return require(name);
    }, __dirname:'/test/desktop', setInterval:()=>({unref(){}})
  });
  await Promise.resolve();
  const event = {sender:contents,senderFrame:contents.mainFrame};
  return {updater,contents,handlers,disk,call:(name,value)=>handlers['updates:'+name](event,value),counts:()=>({checks,downloads,installs,quitHandlers})};
}
test('manual startup makes no request; download and install require actions',async()=>{
  const h=await setup();h.contents.emit('did-finish-load');
  assert.equal(h.counts().checks,0);assert.equal(h.updater.autoDownload,false);assert.equal(h.updater.autoInstallOnAppQuit,false);
  h.call('install');assert.equal(h.counts().installs,0);
  await h.call('check');assert.equal(h.counts().downloads,0);
  await h.call('download');h.call('install');assert.equal(h.counts().installs,1);
});
test('automatic preference survives startup; switching manual disables installation',async()=>{
  const h=await setup('automatic');h.contents.emit('did-finish-load');
  assert.equal(h.counts().checks,1);assert.equal(h.updater.autoDownload,true);
  h.call('mode','manual');assert.equal(h.updater.autoInstallOnAppQuit,false);
  assert.equal(JSON.parse(h.disk[require('node:path').join('/test','updates.json')]).mode,'manual');
});
test('enabling automatic after manual download registers install-on-close',async()=>{
  const h=await setup();await h.call('check');await h.call('download');h.call('mode','automatic');
  assert.equal(h.counts().quitHandlers,1);assert.equal(h.updater.autoInstallOnAppQuit,true);
});
test('invalid preference and untrusted frames are rejected',async()=>{
  const h=await setup();assert.throws(()=>h.call('mode','other'));
  assert.throws(()=>h.handlers['updates:install']({sender:{},senderFrame:{}}));
});
test('download failures are recoverable and never install',async()=>{
  const h=await setup();await h.call('check');h.updater.downloadUpdate=async()=>{throw new Error('offline');};
  await h.call('download');assert.equal(h.call('get').phase,'error');h.call('install');assert.equal(h.counts().installs,0);
  await h.call('check');assert.equal(h.call('get').phase,'available');
});
