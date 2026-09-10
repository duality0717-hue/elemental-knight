const test=require('node:test'),assert=require('node:assert/strict');
const {CloudAccount}=require('../src/cloud.js');
test('unconfigured account never makes a network request',async()=>{let calls=0;const c=new CloudAccount({url:'',key:''},()=>calls++);await assert.rejects(c.login('a','b'));assert.equal(calls,0);});
test('save uses bearer session, optimistic revision; conflict does not advance revision',async()=>{
  const calls=[];let fail=false;const c=new CloudAccount({url:'https://test.supabase.co',key:'public'},async(url,options)=>{calls.push({url,options});return {ok:!fail,status:fail?409:200,json:async()=>fail?{code:'40001'}:url.includes('/token')?{access_token:'access',refresh_token:'refresh',expires_in:3600,user:{id:'a'}}:url.includes('knight_saves')?[{revision:4,document:{version:2}}]:5};});
  await c.login('mail','password');await c.load();assert.equal(c.revision,4);await c.save({version:2});assert.equal(c.revision,5);
  const save=calls.at(-1);assert.equal(save.options.headers.Authorization,'Bearer access');assert.equal(JSON.parse(save.options.body).p_revision,4);
  fail=true;await assert.rejects(c.save({version:2}),/otro dispositivo/);assert.equal(c.revision,5);assert.equal(c.saving,false);
  await c.logout();assert.equal(c.session,null);await assert.rejects(c.save({}),/Iniciá sesión/);
});

test('fetch receives its required global receiver',async()=>{
 const c=new CloudAccount({url:'https://test.supabase.co',key:'public'},function(){assert.equal(this,globalThis);return Promise.resolve({ok:true,json:async()=>({})});});
 await c.signup('test@example.invalid','not-a-real-password');
});
