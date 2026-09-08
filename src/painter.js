(function(scope){
  'use strict';
  const INK='#302536';
  class Painter{
    constructor(canvas){this.canvas=canvas;canvas.width=1440;canvas.height=816;this.c=canvas.getContext('2d');this.c.setTransform(3,0,0,3,0,0);this.memory=new Map();this.sparks=[];this.clock=0;this.background=null;this.bgKey='';}
    ellipse(x,y,rx,ry,fill,line=INK,width=1.25){const c=this.c;c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(line){c.strokeStyle=line;c.lineWidth=width;c.stroke();}}
    path(points,fill,line=INK,width=1.3){const c=this.c;c.beginPath();for(const p of points){if(p[0]==='M')c.moveTo(p[1],p[2]);else if(p[0]==='L')c.lineTo(p[1],p[2]);else if(p[0]==='Q')c.quadraticCurveTo(...p.slice(1));else if(p[0]==='C')c.bezierCurveTo(...p.slice(1));else c.closePath();}if(fill){c.fillStyle=fill;c.fill();}if(line){c.strokeStyle=line;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}}
    line(x,y,xx,yy,color=INK,width=1.2){this.path([['M',x,y],['L',xx,yy]],null,color,width);}
    text(text,x,y,size=10,color='#fff0d3'){const c=this.c;c.fillStyle=color;c.textAlign='center';c.font='600 '+size+'px system-ui';c.fillText(text,x,y);}
    star(x,y,r,color='#ffdd8d'){const p=[];for(let i=0;i<10;i++){let a=i*Math.PI/5-Math.PI/2,d=i%2?r*.38:r;p.push([i?'L':'M',x+Math.cos(a)*d,y+Math.sin(a)*d]);}p.push(['Z']);this.path(p,color,null);}
    icon(canvas,item){
      const prior=this.c;canvas.width=canvas.height=80;this.c=canvas.getContext('2d');this.c.scale(4,4);const c=this.c;c.clearRect(0,0,20,20);
      const empty=item.kind==='empty',metal=empty?'#6a6178':item.rank>1?'#dfb766':'#a6b8ce',ice=empty?'#776980':'#a4e9ed';c.globalAlpha=empty?.5:1;
      if(item.kind==='potion'){
        const color=scope.ElementalEngine.ATTRS[item.attribute].color;
        this.path([['M',7,3],['L',13,3],['L',12,8],['C',19,13,16,19,10,19],['C',4,19,1,13,8,8],['Z']],'#dbe1e2',INK,.7);
        this.path([['M',6,11],['Q',10,13,14,11],['Q',18,17,10,18],['Q',3,17,6,11],['Z']],color,null);
        this.path([['M',7,1],['L',13,1],['L',13,4],['L',7,4],['Z']],'#bb8457',INK,.7);this.ellipse(7,12,1,2,'#ffffffaa',null);
      }else switch(item.slot){
        case 0:this.path([['M',6,3],['Q',10,6,14,3],['L',18,7],['L',15,10],['L',15,18],['Q',10,20,5,18],['L',5,10],['L',2,7],['Z']],metal);this.line(10,7,10,17,'#eff3f2');break;
        case 1:for(const x of [2,11])this.path([['M',x,3],['L',x+6,3],['L',x+5,12],['Q',x+10,15,x+6,18],['L',x,18],['Z']],metal);break;
        case 2:this.path([['M',3,15],['L',3,9],['C',3,0,17,0,17,9],['L',17,15],['L',13,17],['L',13,10],['L',7,10],['L',7,17],['Z']],metal);this.line(10,3,10,9,ice,2);break;
        case 3:for(const x of [2,11]){this.ellipse(x+3,11,3,5,metal);this.line(x,5,x+6,5,ice,3);}break;
        case 4:this.path([['M',10,1],['L',13,5],['L',11,14],['L',8,14],['L',8,5],['Z']],ice);this.line(5,14,15,14,metal,2.5);this.line(10,15,10,19,'#b77f55',3);break;
        case 5:this.ellipse(10,12,6,6,metal);this.ellipse(10,12,3.5,3.5,'#302c3d',null);this.path([['M',10,2],['L',14,6],['L',10,10],['L',6,6],['Z']],ice);break;
        case 6:this.ellipse(10,11,7,5.5,metal);this.ellipse(10,10,4.5,3,'#302c3d');this.ellipse(14,13,2,2,ice);break;
        case 7:this.path([['M',3,3],['Q',2,13,10,14],['Q',18,13,17,3]],null,metal,2);this.path([['M',10,11],['L',14,15],['L',10,19],['L',6,15],['Z']],ice);break;
      }
      this.c=prior;
    }
    scene(g){
      const key=g.room+'-'+Boolean(g.boss);if(this.bgKey===key&&this.background)return;
      this.bgKey=key;const prior=this.c,layer=document.createElement('canvas');layer.width=1440;layer.height=816;this.c=layer.getContext('2d');const c=this.c;c.scale(3,3);const earth=Boolean(g.boss);
      const floor=c.createLinearGradient(0,25,0,272);floor.addColorStop(0,earth?'#657263':'#716774');floor.addColorStop(1,earth?'#b1ac83':'#b1a18d');c.fillStyle=floor;c.fillRect(0,0,480,272);
      for(let row=0;row<8;row++)for(let col=0;col<11;col++){
        const x=col*49-(row%2)*24,y=37+row*30,n=(row*17+col*11)%7;
        this.path([['M',x+3,y+3],['L',x+44,y+1],['L',x+48,y+25],['L',x+4,y+27],['Z']],earth?['#a6a481','#939b7a','#9e9e7e'][n%3]:['#a69a8d','#958e87','#aca093'][n%3],'#615c6260',.7);
        if(n<2)this.path([['M',x+16,y+5],['L',x+20,y+13],['L',x+15,y+16]],null,'#625d6460',.7);
      }
      c.fillStyle=earth?'#3e4945':'#484152';c.fillRect(0,0,480,35);
      for(let i=0;i<13;i++){const x=i*40;this.path([['M',x,2],['L',x+38,0],['L',x+37,19],['L',x+2,20],['Z']],earth?'#596356':'#62586b');this.path([['M',x-18,21],['L',x+17,21],['L',x+18,35],['L',x-18,34],['Z']],earth?'#6c7460':'#7a6b7b');}
      for(const x of [8,472]){this.path([['M',x-10,29],['L',x+8,27],['L',x+10,261],['L',x-8,264],['Z']],'#514952');for(let y=43;y<250;y+=32)this.line(x-7,y,x+7,y-2,'#93838a');}
      this.path([['M',4,255],['Q',230,246,476,255],['L',480,272],['L',0,272],['Z']],earth?'#61694f':'#75646b');
      for(const [x,y] of [[28,72],[444,213]]){this.ellipse(x,y,12,5,'#41364b30',null);this.path([['M',x-7,y],['L',x-9,y-8],['L',x-2,y-13],['L',x+7,y-10],['L',x+10,y],['Z']],'#827981');}
      const shade=c.createRadialGradient(240,160,70,240,145,280);shade.addColorStop(0,'#15121b00');shade.addColorStop(1,'#21132966');c.fillStyle=shade;c.fillRect(0,0,480,272);
      this.background=layer;this.c=prior;
    }
    flame(x,y,t,size=1){const c=this.c;c.save();c.translate(x,y);c.scale(size,size);const sway=Math.sin(t*9+x)*2;
      this.path([['M',-6,3],['Q',-12,-6,-4,-15],['Q',-4,-7,0,-11],['Q',4,-19,2,-24],['Q',14,-8,7,2],['Q',0,8,-6,3],['Z']],'#ee7648','#924b47',.7);
      this.path([['M',-3,3],['Q',-6,-4,sway,-11],['Q',5,-3,3,4],['Z']],'#ffde8b',null);c.restore();}
    chest(b,g){const c=this.c;c.save();c.translate(b.x,b.y);this.ellipse(0,8,15,5,'#201c363f',null);const wood=b.luxury?'#809bb8':'#ad734d',gold=b.luxury?'#ffe2a0':'#dab47a';
      this.path([['M',-12,-4],['L',12,-4],['L',11,9],['Q',0,13,-11,9],['Z']],wood);
      this.path([['M',-12,-4],['Q',-13,-15,0,-14],['Q',13,-14,12,-4],['Z']],b.open?'#5d4551':wood);
      if(b.open)this.path([['M',-12,-9],['L',-10,-18],['Q',0,-22,12,-16],['L',12,-9],['Z']],wood);
      this.line(-7,-12,-7,9,gold,2.5);this.line(7,-12,7,9,gold,2.5);this.ellipse(0,-1,2.5,3.5,gold);this.line(0,-1,0,1,INK,1);
      if(b.luxury){this.star(-17,-14,3,'#ffe7a0');this.star(17,-5,2,'#fff2cb');}
      if(!b.open&&Math.hypot(g.hero.x-b.x,g.hero.y-b.y)<32)this.text(b.luxury?'E · LUJOSO':'E · ABRIR',0,-23,7,INK);c.restore();}
    actor(x,y,enemy,g,id){
      const c=this.c,t=g.time,prev=this.memory.get(id),hp=enemy?enemy.hp:g.hero.hp;
      let hurt=prev?.hurt||0;if(prev&&hp<prev.hp){hurt=.22;this.sparks.push({x,y:y-18,time:t,text:enemy?'¡PAM!':'¡AY!',color:enemy?'#ffedb4':'#ffb5a2'});}
      const moving=prev&&Math.hypot(x-prev.x,y-prev.y)>.05,walk=moving?Math.sin(t*15):Math.sin(t*3)*.12,bob=moving?Math.abs(walk)*1.5:Math.sin(t*3)*.5;
      const facing=enemy?(g.hero.x<x?-1:1):(Math.cos(g.hero.face)<0?-1:1),punch=enemy?0:Math.sin(Math.PI*Math.min(1,(.18-g.attack)/.18))*(g.attack>0?1:0);
      this.memory.set(id,{x,y,hp,hurt:Math.max(0,hurt-this.dt)});this.ellipse(x,y+9,12,4,'#21183240',null);
      c.save();c.translate(x,y-bob);c.scale(facing,1);c.rotate(hurt>0?Math.sin(hurt*50)*.12:0);
      const skin=enemy?'#f4e6c9':'#efb68d',metal='#829bb9',outline=INK;
      // Jointed limbs: each foot and hand swings independently from the torso.
      for(const side of [-1,1]){const foot=side*5+walk*side*2;this.line(side*4,1,foot,9,outline,5);this.line(side*4,1,foot,9,enemy?'#d5c4a6':skin,3);this.ellipse(foot+1,10,enemy?3.5:4,2.5,!enemy&&g.rank(1)?metal:skin);}
      if(enemy){
        this.flame(0,-23,t,.7);this.path([['M',-7,-10],['Q',0,-14,7,-10],['L',5,1],['Q',0,6,-5,1],['Z']],'#cbb998');
        this.line(0,-10,0,2,'#f8edd5',2.5);for(let n=0;n<3;n++)this.path([['M',-6,-8+n*3],['Q',0,-5+n*3,6,-8+n*3]],null,'#fff0d4',1.5);
      }else{
        this.path([['M',-8,-11],['Q',0,-17,8,-11],['L',7,3],['Q',0,7,-7,3],['Z']],g.rank(0)?metal:skin);
        if(g.rank(0)){this.path([['M',-6,-9],['Q',0,-5,6,-9]],null,'#d2e2ed',2);this.line(0,-10,0,1,'#c8dce9',2);}else this.path([['M',-7,0],['Q',0,3,7,0],['L',5,6],['L',0,4],['L',-5,6],['Z']],'#eee2c7');
      }
      this.line(-7,-9,-11,-2+walk*2,outline,4.5);this.line(-7,-9,-11,-2+walk*2,skin,2.5);this.ellipse(-11,-1+walk*2,3,3,!enemy&&g.rank(3)?metal:skin);
      const handX=11+punch*13,handY=-4-punch*3;this.line(6,-9,handX,handY,outline,5);this.line(6,-9,handX,handY,skin,3);this.ellipse(handX,handY,enemy?3:4,3.5,!enemy&&g.rank(3)?metal:skin);
      c.save();c.translate(punch*2,-1);c.rotate(walk*.045);
      this.ellipse(0,-21,enemy?10:11,enemy?10:11,skin,outline,1.5);this.ellipse(9,-19,3,3,skin);
      if(enemy){this.ellipse(-3,-22,2.8,3.5,'#594258',null);this.ellipse(5,-22,2.8,3.5,'#594258',null);this.ellipse(5.5,-21.5,1.1,1.4,'#ffb65e',null);this.path([['M',0,-17],['L',2,-14],['L',-1,-14],['Z']],'#80666b',null);this.path([['M',-5,-13],['Q',1,-10,7,-13]],null,INK,.9);for(let n=0;n<4;n++)this.line(-3+n*2.5,-13,-3+n*2.5,-10,INK,.7);}
      else{
        this.path([['M',-10,-21],['Q',-15,-32,-4,-32],['L',-6,-37],['Q',1,-36,4,-31],['L',8,-34],['Q',14,-27,8,-25],['Q',3,-28,-4,-25],['L',-7,-18],['Z']],'#654353');
        this.ellipse(1,-21,2.5,3,'#fff7eb',null);this.ellipse(7,-21,2.2,2.7,'#fff7eb',null);this.ellipse(2,-20.5,1,1.6,INK,null);this.ellipse(8,-20.5,1,1.5,INK,null);
        this.line(-1,-25,3,-24,INK,1.2);this.line(6,-24,9,-25,INK,1.2);this.path([['M',1,-14],['Q',5,-12,8,-15]],null,INK,1);
        if(g.rank(2)){this.path([['M',-11,-19],['L',-12,-27],['Q',-8,-37,2,-35],['Q',12,-32,12,-25],['L',10,-19],['L',7,-27],['L',-5,-26],['L',-7,-18],['Z']],metal);this.line(0,-34,1,-28,'#d3e8ee',2);}
      }c.restore();
      if(!enemy){if(g.rank(7))this.ellipse(1,-8,2,2.5,'#b3f0e9');if(g.rank(6))this.line(-13,-3,-9,-2,'#bd8feb',2);if(g.rank(5))this.ellipse(handX+1,handY-1,1.2,1.2,'#f2d488',null);
        if(g.rank(4)){c.save();c.translate(handX+1,handY);c.rotate(-.4+punch*1.9);this.path([['M',-2,-3],['L',-3,-22],['L',0,-28],['L',3,-22],['L',2,-3],['Z']],'#b9eef1');this.line(0,-23,0,-5,'#f6ffff',1);this.line(-6,-3,6,-3,'#ab8957',2.5);this.line(0,-2,0,4,'#815961',3);c.restore();}}
      c.restore();
      if(enemy){c.fillStyle='#594b56';c.fillRect(x-10,y-39,20,2);c.fillStyle='#ea9165';c.fillRect(x-10,y-39,20*enemy.hp/enemy.max,2);if(enemy.warning)this.text('!',x,y-44,10,'#ffe1a0');}
    }
    dragon(g){const b=g.boss,c=this.c,t=g.time;c.save();c.translate(b.x,b.y);const breathe=Math.sin(t*2.5);this.ellipse(3,18,49,9,'#27342245',null);
      this.path([['M',20,-14],['Q',44,-17,55,5],['Q',69,16,75,2],['Q',69,30,46,16],['L',21,10],['Z']],'#829469');
      c.save();c.translate(6,-22);c.rotate(Math.sin(t*2)*.07);this.path([['M',0,4],['L',23,-37],['Q',35,-12,45,-2],['Q',30,-6,33,9],['Q',18,0,17,14],['Z']],'#c5b98c');this.line(0,4,23,-37,'#52634d',3);this.line(0,4,33,9,'#687757',1.5);c.restore();
      this.ellipse(1,-2,30,27+breathe,b.hit?'#c9d6a5':'#849b70');this.ellipse(-11,5,15,19,'#c6bd91',null);for(let n=0;n<3;n++)this.path([['M',-23,-2+n*7],['Q',-12,2+n*7,-2,-1+n*7]],null,'#998f70',1);
      for(const x of [-18,18]){this.ellipse(x,19,9,9,'#7d9368');for(let i=0;i<3;i++)this.path([['M',x-6+i*5,23],['Q',x-9+i*5,30,x-1+i*5,26],['Z']],'#ece0ba');}
      this.ellipse(-22,-23,22,20,'#90a77a');this.ellipse(-38,-14,17,10,'#afbc8a');this.ellipse(-48,-15,2,1.5,'#59634e',null);
      for(const x of [-31,-8])this.path([['M',x,-37],['Q',x-9,-48,x-1,-55],['Q',x-1,-44,x+6,-38],['Z']],'#e9d7a6');
      this.ellipse(-29,-26,7,6,'#f7e7b8');this.ellipse(-31,-25,2,4,'#504039',null);this.line(-37,-31,-24,-29,'#4e634e',2.5);
      this.path([['M',-52,-9],['Q',-36,0,-21,-7]],null,INK,1.5);for(const x of [-45,-35,-25])this.path([['M',x,-6],['L',x+3,0],['L',x+5,-5],['Z']],'#fff0c9');
      for(let n=0;n<4;n++)this.path([['M',12+n*6,-20+n*3],['L',19+n*6,-30+n*3],['L',21+n*6,-15+n*3],['Z']],'#677d5b');c.restore();
      this.path([['M',131,39],['L',349,39],['Q',354,39,354,43],['Q',354,47,349,47],['L',131,47],['Q',126,43,131,39],['Z']],'#394837');c.fillStyle='#c4d690';c.fillRect(131,41,218*b.hp/b.max,4);this.text('TERRAGRÁN · DRAGÓN DE TIERRA',240,34,8,'#fff2cf');}
    draw(g){
      const c=this.c,t=g.time;this.dt=Math.max(0,Math.min(.05,t-this.clock));if(t<this.clock||this.lastHero!==g.hero){this.memory.clear();this.sparks=[];}this.lastHero=g.hero;this.clock=t;this.scene(g);c.drawImage(this.background,0,0,480,272);
      for(const x of [52,210,390]){this.path([['M',x-3,23],['L',x+3,23],['L',x+2,36],['L',x-2,36],['Z']],'#815962');this.flame(x,23,t,.65);}
      const opened=!g.enemies.length&&g.mode==='play';this.path([['M',458,158],['L',458,119],['Q',467,102,479,114],['L',480,158],['Z']],opened?'#405c55':'#332c3e');if(opened){this.text('→',470,142,19,'#c9f5cf');}else for(let x=462;x<480;x+=6)this.line(x,118,x,156,'#a2999d',2);
      for(const h of g.hazards){c.save();c.globalAlpha=h.fired?.75:.5+Math.sin(t*18)*.2;this.ellipse(h.x,h.y,h.radius,h.radius*.6,h.fired?'#edd1a3':'#f4c48b55','#f4d398',2);c.restore();if(h.fired)for(let i=-2;i<=2;i++)this.path([['M',h.x+i*11-4,h.y+5],['L',h.x+i*11,h.y-12],['L',h.x+i*11+6,h.y+6],['Z']],'#a9a481');}
      for(const b of g.chests)this.chest(b,g);
      const living=new Set(['hero']);const actors=g.enemies.map((e,i)=>({e,y:e.y,id:e}));actors.push({e:null,y:g.hero.y,id:'hero'});actors.sort((a,b)=>a.y-b.y);
      if(g.boss&&g.boss.hp>0)this.dragon(g);
      for(const a of actors){living.add(a.id);if(a.e)this.actor(a.e.x,a.e.y,a.e,g,a.id);else this.actor(g.hero.x,g.hero.y,null,g,'hero');}
      for(const [id,old] of this.memory)if(!living.has(id)){this.sparks.push({x:old.x,y:old.y-13,time:t,text:'¡POF!',color:'#fbe7c7'});this.memory.delete(id);}
      for(const p of g.shots){const a=Math.atan2(p.vy,p.vx);c.save();c.translate(p.x,p.y);c.rotate(a);this.path([['M',-13,-4],['Q',-3,0,-13,4],['L',1,3],['L',1,-3],['Z']],p.earth?'#c9c29270':'#f3ae7370',null);if(p.earth)this.path([['M',-4,-3],['L',2,-5],['L',6,0],['L',2,5],['L',-4,3],['Z']],'#b9ae84');else this.ellipse(0,0,5,4,'#ffc96f','#b66750');c.restore();}
      if(g.attack>0){const h=g.hero,angle=h.face;c.save();c.translate(h.x,h.y-5);c.rotate(angle);c.globalAlpha=g.attack/.18;this.path([['M',20,-18],['Q',55,0,20,18],['Q',37,0,20,-18],['Z']],g.rank(4)?'#d6fcff':'#fff0c3',null);c.restore();}
      this.sparks=this.sparks.filter(s=>t-s.time<.45);for(const s of this.sparks){const age=(t-s.time)/.45;c.save();c.globalAlpha=1-age;this.star(s.x-12,s.y-4-age*12,4,s.color);this.star(s.x+14,s.y+3-age*12,3,s.color);this.text(s.text,s.x,s.y-age*12,9,INK);c.restore();}
      for(const n of g.notices){this.text(n.text,n.x,n.y-16,7,'#fff0c6');}
      if(g.paused||['ready','dead','won'].includes(g.mode)){this.path([['M',83,87],['Q',240,80,397,87],['L',392,166],['Q',240,173,88,166],['Z']],'#f3dfbceF','#554253',2);this.text(g.mode==='ready'?'ELEMENTAL KNIGHT':g.mode==='dead'?'¡A LA LONA!':g.mode==='won'?'¡DRAGÓN DERROTADO!':'UN RESPIRO',240,117,17,'#4d3544');this.text(g.mode==='ready'?'Una mazmorra. Mucha actitud. Cero armadura.':g.mode==='dead'?'Sacudite el polvo y probá otra build.':g.mode==='won'?'Enter: revisá tu botín lujoso.':'Enter: atributos, set y mochila.',240,142,9,'#685264');}
    }
  }
  scope.ElementalPainter=Painter;
})(globalThis);
