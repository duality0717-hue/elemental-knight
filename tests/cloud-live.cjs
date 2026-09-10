// Read-only checks against the dedicated game project; no emails or users created.
const assert=require('node:assert/strict');
require('../src/cloud-config.js');
const {url,key}=globalThis.KnightCloudConfig;
async function request(path,body){return fetch(url+path,{method:body?'POST':'GET',headers:{apikey:key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});}
(async()=>{
  const settings=await request('/auth/v1/settings');assert.equal(settings.status,200,'Auth reachable');
  const config=await settings.json();assert.equal(config.external.email,true,'email login enabled');
  console.log('Auth ready; email confirmation required:',!config.mailer_autoconfirm);
  const read=await request('/rest/v1/knight_saves?select=revision');assert.ok([401,403].includes(read.status),'anonymous reads blocked');
  const write=await request('/rest/v1/rpc/save_knight',{p_document:{version:2,data:{vault:[]}},p_revision:0});assert.ok([401,403].includes(write.status),'anonymous writes blocked');
  console.log('PASS: live Auth availability and anonymous save isolation');
})().catch(error=>{console.error(error);process.exitCode=1;});
