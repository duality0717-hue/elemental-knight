(function(scope){
  'use strict';
  class CloudAccount {
    constructor(config,fetcher=globalThis.fetch){this.config=config;this.fetcher=fetcher;this.session=null;this.revision=0;this.saving=false;}
    get configured(){return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(this.config.url)&&!!this.config.key;}
    async request(path,body,token){
      if(!this.configured)throw new Error('Las cuentas online todavía no están habilitadas. Podés jugar como invitado.');
      const response=await this.fetcher(this.config.url+path,{method:body===undefined?'GET':'POST',headers:{apikey:this.config.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
      const data=await response.json().catch(()=>null);
      if(!response.ok){if(response.status===409||data?.code==='40001')throw new Error('La partida cambió en otro dispositivo. Cargá la nube antes de volver a guardar.');throw new Error(data?.msg||data?.message||data?.error_description||'No se pudo conectar con tu cuenta.');}
      return data;
    }
    async signup(email,password){return this.request('/auth/v1/signup',{email,password});}
    async login(email,password){const data=await this.request('/auth/v1/token?grant_type=password',{email,password});if(!data?.access_token||!data?.user?.id)throw new Error('No se pudo iniciar sesión.');this.session={...data,expires_at:Date.now()+data.expires_in*1000};this.revision=0;return data.user;}
    async token(){if(!this.session)throw new Error('Iniciá sesión primero.');if(Date.now()>this.session.expires_at-60000){const d=await this.request('/auth/v1/token?grant_type=refresh_token',{refresh_token:this.session.refresh_token});this.session={...d,expires_at:Date.now()+d.expires_in*1000};}return this.session.access_token;}
    async load(){const token=await this.token();const rows=await this.request('/rest/v1/knight_saves?select=revision,document',undefined,token);const row=rows?.[0];this.revision=row?.revision||0;return row?.document||null;}
    async save(document){if(this.saving)throw new Error('Ya hay un guardado en curso.');this.saving=true;try{const token=await this.token();const revision=await this.request('/rest/v1/rpc/save_knight',{p_document:document,p_revision:this.revision},token);this.revision=revision;return revision;}finally{this.saving=false;}}
    async logout(){let remote=true;try{if(this.session)await this.request('/auth/v1/logout',{},await this.token());}catch{remote=false;}finally{this.session=null;this.revision=0;}return remote;}
  }
  scope.KnightCloud={CloudAccount};
  if(typeof module!=='undefined'&&module.exports)module.exports={CloudAccount};
})(globalThis);
