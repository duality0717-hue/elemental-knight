(function(scope){
  'use strict';
  const INK='#141319';
  class Painter{
    constructor(canvas){this.canvas=canvas;canvas.width=1440;canvas.height=816;this.c=canvas.getContext('2d');this.c.setTransform(3,0,0,3,0,0);this.memory=new Map();this.sparks=[];this.clock=0;this.background=null;this.bgKey='';}
    ellipse(x,y,rx,ry,fill,line=INK,width=1.25){const c=this.c;c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(line){c.strokeStyle=line;c.lineWidth=width;c.stroke();}}
    path(points,fill,line=INK,width=1.3){const c=this.c;c.beginPath();for(const p of points){if(p[0]==='M')c.moveTo(p[1],p[2]);else if(p[0]==='L')c.lineTo(p[1],p[2]);else if(p[0]==='Q')c.quadraticCurveTo(...p.slice(1));else if(p[0]==='C')c.bezierCurveTo(...p.slice(1));else c.closePath();}if(fill){c.fillStyle=fill;c.fill();}if(line){c.strokeStyle=line;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}}
    line(x,y,xx,yy,color=INK,width=1.2){this.path([['M',x,y],['L',xx,yy]],null,color,width);}
    text(text,x,y,size=10,color='#fff0d3'){const c=this.c;c.fillStyle=color;c.textAlign='center';c.font='600 '+size+'px system-ui';c.fillText(text,x,y);}
    star(x,y,r,color='#ffdd8d'){const p=[];for(let i=0;i<10;i++){let a=i*Math.PI/5-Math.PI/2,d=i%2?r*.38:r;p.push([i?'L':'M',x+Math.cos(a)*d,y+Math.sin(a)*d]);}p.push(['Z']);this.path(p,color,null);}
    icon(canvas,item){
      const prior=this.c;canvas.width=canvas.height=80;this.c=canvas.getContext('2d');this.c.scale(4,4);const c=this.c;c.clearRect(0,0,20,20);
      const empty=item.kind==='empty',metal=empty?'#6a6178':scope.ElementalEngine.QUALITIES[item.quality]?.color||'#a6b8ce',ice=empty?'#776980':scope.ElementalEngine.ELEMENTS[item.element]?.color||'#a4e9ed';c.globalAlpha=empty?.5:1;
      if(item.kind==='potion'){
        const color=scope.ElementalEngine.ATTRS[item.attribute].color;
        this.path([['M',7,3],['L',13,3],['L',12,8],['C',19,13,16,19,10,19],['C',4,19,1,13,8,8],['Z']],'#dbe1e2',INK,.7);
        this.path([['M',6,11],['Q',10,13,14,11],['Q',18,17,10,18],['Q',3,17,6,11],['Z']],color,null);
        this.path([['M',7,1],['L',13,1],['L',13,4],['L',7,4],['Z']],'#bb8457',INK,.7);this.ellipse(7,12,1,2,'#ffffffaa',null);
      }else if(item.weapon){this.weaponIcon(item.weapon,metal,ice);}
      else switch(item.slot){
        case 0:this.path([['M',6,3],['Q',10,6,14,3],['L',18,7],['L',15,10],['L',15,18],['Q',10,20,5,18],['L',5,10],['L',2,7],['Z']],metal);this.line(10,7,10,17,'#eff3f2');break;
        case 1:for(const x of [2,11])this.path([['M',x,3],['L',x+6,3],['L',x+5,12],['Q',x+10,15,x+6,18],['L',x,18],['Z']],metal);break;
        case 2:this.path([['M',3,15],['L',3,9],['C',3,0,17,0,17,9],['L',17,15],['L',13,17],['L',13,10],['L',7,10],['L',7,17],['Z']],metal);this.line(10,3,10,9,ice,2);break;
        case 3:for(const x of [2,11]){this.ellipse(x+3,11,3,5,metal);this.line(x,5,x+6,5,ice,3);}break;
        case 4:this.path([['M',10,1],['L',13,5],['L',11,14],['L',8,14],['L',8,5],['Z']],ice);this.line(5,14,15,14,metal,2.5);this.line(10,15,10,19,'#b77f55',3);break;
        case 5:this.ellipse(10,12,6,6,metal);this.ellipse(10,12,3.5,3.5,'#302c3d',null);this.path([['M',10,2],['L',14,6],['L',10,10],['L',6,6],['Z']],ice);break;
        case 6:this.ellipse(10,11,7,5.5,metal);this.ellipse(10,10,4.5,3,'#302c3d');this.ellipse(14,13,2,2,ice);break;
        case 7:this.path([['M',3,3],['Q',2,13,10,14],['Q',18,13,17,3]],null,metal,2);this.path([['M',10,11],['L',14,15],['L',10,19],['L',6,15],['Z']],ice);break;
        case 8:this.weaponIcon('shield',metal,ice);break;
        case 9:if(item.style==='wings'){this.path([['M',10,17],['Q',0,10,2,2],['L',10,9],['L',18,2],['Q',20,10,10,17]],ice);}
          else this.path([['M',7,2],['L',13,2],['L',18,18],['Q',10,15,2,18],['Z']],ice,metal);break;
      }
      this.c=prior;
    }
    weaponIcon(type,metal,color){
      if(type==='shield'){this.path([['M',3,3],['Q',10,0,17,3],['L',16,12],['L',10,19],['L',4,12],['Z']],metal);this.line(10,4,10,14,color,3);}
      else if(type==='staff'){this.line(7,19,12,3,metal,3);this.star(12,4,4,color);}
      else if(type==='bow'){this.path([['M',5,2],['Q',20,10,5,18]],null,metal,3);this.line(5,2,5,18,color,1);this.line(2,10,18,10,color,1);}
      else{const w=type==='greatsword'?4:2;this.path([['M',10,1],['L',10+w,5],['L',10+w,14],['L',10-w,14],['L',10-w,5],['Z']],color);this.line(4,14,16,14,metal,2);this.line(10,15,10,19,metal,3);}
    }
    skull(x,y,size=1,color='#a39b81'){
      const c=this.c;c.save();c.translate(x,y);c.scale(size,size);
      this.path([['M',-6,1],['C',-10,-11,10,-11,6,1],['L',4,5],['L',-4,5],['Z']],color,'#080c0e',1);
      for(const x of [-3,3])this.ellipse(x,-2,2,2.4,'#101517',null);
      this.path([['M',0,0],['L',-1.5,2],['L',1.5,2],['Z']],'#121819',null);
      for(let x=-3;x<=3;x+=2)this.line(x,3,x,5,'#303637',.5);c.restore();
    }
    scene(g){
      const key=[g.chapter,g.room,g.zoneId,g.boss?.kind,!!g.boss].join('-');if(this.bgKey===key&&this.background)return;
      this.bgKey=key;const prior=this.c,layer=document.createElement('canvas');layer.width=1440;layer.height=816;this.c=layer.getContext('2d');const c=this.c;c.scale(3,3);
      if(g.chapter===3){this.cavern(g);this.background=layer;this.c=prior;return;}
      const green=g.chapter===2,base=green?'#152022':'#1c1c23';
      c.fillStyle='#070b10';c.fillRect(0,0,480,272);
      const floor=c.createRadialGradient(245,160,20,240,145,285);floor.addColorStop(0,green?'#35423d':'#39373d');floor.addColorStop(1,'#0b1117');c.fillStyle=floor;c.fillRect(15,52,450,200);
      // Perspective flagstones, worn edges and broken mortar.
      for(let row=0;row<9;row++){const y=58+row*23,w=38+row*4;for(let col=-1;col<13;col++){const x=col*w-(row%2)*w/2,n=(row*13+col*7+g.room)%5;
        this.path([['M',x+1,y],['L',x+w-3,y-1],['L',x+w+3,y+20],['L',x-2,y+21],['Z']],['#ffffff02','#00000012','#8c957807','#00000020','#ffffff04'][(n+5)%5],'#070d1366',.8);
        this.line(x+3,y+1,x+w-5,y,'#8f94811c',.55);
        if(n===1)this.path([['M',x+12,y+2],['L',x+18,y+8],['L',x+14,y+12],['L',x+23,y+19]],null,'#070d1599',.7);
      }}
      this.ellipse(240,157,88,45,'#00000008','#8d95721c',1);this.ellipse(240,157,80,41,'#00000000','#8d95721c',.5);
      for(let i=0;i<12;i++){const a=i*Math.PI/6;this.line(240+Math.cos(a)*73,157+Math.sin(a)*37,240+Math.cos(a)*80,157+Math.sin(a)*41,'#9e95702c',1);}
      // Tall gothic recesses, ribs and the moon beyond cracked glass.
      c.fillStyle=base;c.fillRect(0,0,480,57);
      for(const x of [70,160,320,410]){
        this.path([['M',x-26,57],['L',x-25,23],['Q',x-21,9,x,0],['Q',x+21,9,x+25,23],['L',x+26,57],['Z']],'#060b12','#596060',2);
        this.path([['M',x-20,55],['L',x-19,24],['Q',x,1,x+19,24],['L',x+20,55],['Z']],green?'#233637':'#293343','#10191f',1);
        this.ellipse(x+3,21,8,8,'#97a9a24f',null);
        for(const offset of [-10,0,10])this.line(x+offset,15+Math.abs(offset),x+offset,55,'#0b131a',2);
        this.line(x-19,36,x+19,36,'#0b131a',2);this.path([['M',x-10,12],['L',x+4,32],['L',x-3,40],['L',x+7,54]],null,'#b7c7c14a',.65);
        this.path([['M',x-14,56],['L',x+16,56],['L',x+69,211],['L',x-33,211],['Z']],'#9eb8b209',null);
      }
      for(const x of [18,115,205,275,365,462]){
        this.path([['M',x-8,0],['L',x+8,0],['L',x+6,52],['L',x+12,64],['L',x-12,64],['L',x-6,52],['Z']],'#20282c','#080d13',1.8);
        this.line(x-3,4,x-3,53,'#7a807446',1);this.line(x+3,5,x+3,54,'#060c1288',2);this.skull(x,49,.75,'#6d7567');
      }
      for(const x of [5,475]){c.fillStyle='#10171d';c.fillRect(x-5,60,10,196);this.line(x,65,x,250,'#596052',1);}
      // Funerary statues, chains, roots and scattered bones sit at the margins.
      for(const [x,y] of [[31,90],[449,218]]){
        this.ellipse(x,y+13,20,7,'#00000055',null);
        this.path([['M',x-12,y+10],['L',x-6,y-11],['Q',x-11,y-28,x,y-30],['Q',x+11,y-28,x+6,y-11],['L',x+12,y+10],['Z']],'#3e4846','#0d161b',1.4);
        this.path([['M',x-5,y-17],['Q',x,y-25,x+5,y-17],['L',x+3,y-10],['L',x-3,y-10],['Z']],'#0c1319',null);
        this.line(x-3,y-7,x-6,y+8,'#87907c40',1);this.line(x+2,y-6,x+5,y+8,'#87907c40',1);
      }
      for(const x of [40,440])for(let y=0;y<52;y+=5)this.ellipse(x+Math.sin(y*.06)*2,y,1.5,3,'#00000000','#74766555',.7);
      for(let i=0;i<14;i++){const x=28+(i*127)%426,y=229+(i*13)%22;this.line(x-4,y-2,x+5,y+1,'#8e917765',1.4);if(i%4===0)this.skull(x,y-3,.55,'#6f7767');}
      for(const x of [0,480]){for(let i=1;i<6;i++)this.line(x,0,x+(x? -1:1)*i*11,66,'#b7bdad1c',.6);for(let j=1;j<5;j++)this.path([['M',x,12*j],['Q',x+(x?-1:1)*18*j,15*j,x+(x?-1:1)*12*j,0]],null,'#b7bdad1c',.6);}
      for(let i=0;i<2600;i++){c.fillStyle=i%2?'#d4d2ae09':'#00000018';c.fillRect((i*117.37)%480,(i*67.91)%272,.6,.6);}
      const shade=c.createRadialGradient(240,148,75,240,136,260);shade.addColorStop(0,'#03081100');shade.addColorStop(.7,'#03081122');shade.addColorStop(1,'#030811d0');c.fillStyle=shade;c.fillRect(0,0,480,272);
      this.background=layer;this.c=prior;
    }
    cavern(g){
      const c=this.c;c.fillStyle='#080c11';c.fillRect(0,0,480,272);
      const glow=c.createRadialGradient(265,150,5,240,140,260);glow.addColorStop(0,'#35403d');glow.addColorStop(1,'#0b1018');c.fillStyle=glow;c.fillRect(12,40,456,214);
      for(let i=0;i<75;i++){const x=25+(i*71+g.room*13)%430,y=64+(i*43)%179;this.path([['M',x-8,y],['L',x-4,y-4],['L',x+9,y-3],['L',x+13,y+4],['L',x+2,y+7],['Z']],i%3?'#27312f':'#465047','#111c2299',.7);}
      this.path([['M',0,0],['L',480,0],['L',480,58],['L',440,43],['L',404,65],['L',365,41],['L',324,57],['L',274,36],['L',240,48],['L',190,35],['L',144,59],['L',90,40],['L',35,62],['L',0,48],['Z']],'#222a2a','#070c12',3);
      for(let i=0;i<16;i++){const x=12+i*31;this.path([['M',x-9,29],['L',x+9,26],['L',x+3,48+(i*17)%27],['Z']],'#3b4640','#10191b');this.line(x,31,x+3,48+(i*17)%27,'#81908055',.7);}
      for(const [x,y] of [[25,215],[455,92],[448,228],[36,87]]){
        for(let i=0;i<3;i++)this.path([['M',x-9+i*7,y+11],['L',x-5+i*7,y-18-i*5],['L',x+2+i*7,y+10],['Z']],i%2?'#727780':'#43565c','#121c23',1);
      }
      for(const [x,y,sign] of [[12,50,1],[468,50,-1],[12,244,1],[468,244,-1]]){
        for(let i=0;i<7;i++){const a=i*Math.PI/12;this.line(x,y,x+Math.cos(a)*75*sign,y+Math.sin(a)*55*(y>200?-1:1),'#d2e1d04f',.7);}
        for(const r of [20,38,56,74]){const pts=[];for(let i=0;i<7;i++){const a=i*Math.PI/12;pts.push([i?'L':'M',x+Math.cos(a)*r*sign,y+Math.sin(a)*r*.73*(y>200?-1:1)]);}this.path(pts,null,'#c4d8cd45',.6);}
      }
      for(let i=0;i<9;i++){const x=55+i*45,y=244+Math.sin(i*7)*4;this.ellipse(x,y,5,8,'#87937d','#28372e');this.line(x-2,y-3,x+2,y+4,'#d6dfba',.6);}
      const shade=c.createRadialGradient(240,148,75,240,136,275);shade.addColorStop(0,'#00000000');shade.addColorStop(1,'#030812b0');c.fillStyle=shade;c.fillRect(0,0,480,272);
    }
    spider(e,g,queen=false){
      const c=this.c,scale=queen?3:e.kind==='elite'?1.65:.8,color=e.kind==='area'?'#a793cf':e.kind==='caster'?'#8dbe84':'#bb957b';
      this.memory.set(e,{x:e.x,y:e.y,hp:e.hp});c.save();c.translate(e.x,e.y);c.scale(scale,scale);this.ellipse(0,7,22,7,'#00000070',null);
      for(const side of [-1,1])for(let i=0;i<4;i++){
        const sway=e.dormant?0:Math.sin(g.time*9+i*1.7)*3,kx=side*(16+i%2*4),ky=-15+i*9+sway,tx=side*(25+i%2*3),ty=-10+i*8-sway;
        this.path([['M',side*5,-2+i*3],['L',kx,ky-1.5],['L',tx+side*2,ty+3],['L',kx-side*1.5,ky+1.5],['Z']],queen?'#5c6866':color,'#11171e',.6);
        this.line(side*6,-2+i*3,kx,ky,queen?'#b0b4a0':color,.7);
        if(queen)this.path([['M',kx,ky],['L',kx+side*4,ky-4],['L',kx+side*2,ky+1],['Z']],'#a3a38d','#171920',.6);
      }
      this.ellipse(0,1,11,14,queen?'#252330':e.kind==='elite'?'#534b62':'#4b474b','#11131c',1.5);
      if(queen){
        this.path([['M',0,-9],['L',7,-3],['L',3,0],['L',7,4],['L',2,8],['L',0,13],['L',-2,8],['L',-7,4],['L',-3,0],['L',-7,-3],['Z']],'#843545','#b66c69',.5);
        for(const side of [-1,1])for(let i=0;i<3;i++)this.path([['M',side*8,-2+i*5],['L',side*13,1+i*5],['L',side*8,3+i*5],['Z']],'#65685d','#13141c',.5);
      }else this.ellipse(0,4,5,8,color,null);
      this.ellipse(0,-12,9,7,queen?'#35323b':'#424750','#121721',1);
      for(const side of [-1,1])for(let i=0;i<3;i++){
        if(queen)this.ellipse(side*(2+i*2.4),-15+i,2,2,'#cf314c33',null);
        this.ellipse(side*(2+i*2.4),-15+i,queen?1:1.2,queen?1:1.5,queen?'#ff354f':'#e6eea0',null);
      }
      if(queen){this.ellipse(0,-7,4,3,'#090a10','#98616a',.5);for(const x of [-2,-1,1,2])this.path([['M',x,-9],['L',x+.3,-6],['L',x+.8,-9]],'#c3b799',null);}
      for(const side of [-1,1])this.path([['M',side*5,-10],['L',side*7,-5],['L',side*2,1],['L',side*3,-5],['Z']],queen?'#b5b699':'#eee0bd','#171923',.6);
      c.restore();
      if(queen){c.fillStyle='#15151f';c.fillRect(125,13,230,6);c.fillStyle='#d776a2';c.fillRect(126,14,228*e.hp/e.max,4);this.text('ARACNIA · MADRE DE LAS PROFUNDIDADES',240,30,8,'#ecd0e4');}
      else{c.fillStyle='#392d3e';c.fillRect(e.x-12,e.y-30*scale,24,3);c.fillStyle=color;c.fillRect(e.x-12,e.y-30*scale,24*e.hp/e.max,3);this.text(e.keyFragment?'PORTADORA · FRAGMENTO':e.dormant?'DORMIDA':e.kind==='elite'?'ÉLITE':{melee:'MORDEDORA',area:'TEJEDORA',caster:'ESCUPIDORA'}[e.kind],e.x,e.y-34*scale,5,e.keyFragment?'#f7d98a':color);}
      if(e.warning||queen&&e.phase==='warning')this.text('!',e.x,e.y-(queen?84:40*scale),12,'#ffc2bc');
    }
    ghost(e,g){
      const c=this.c,x=e.x,y=e.y+Math.sin(g.time*5)*4;c.save();c.globalAlpha=.8;
      this.path([['M',x-12,y+10],['Q',x-14,y-26,x,y-28],['Q',x+14,y-26,x+12,y+10],['L',x+5,y+4],['L',x,y+12],['L',x-6,y+5],['Z']],'#aadbe7','#e1ffff',1.3);
      for(const offset of [-4,4])this.ellipse(x+offset,y-17,2,3,'#273657',null);this.ellipse(x,y-8,3,4,'#273657',null);c.restore();
      this.memory.set(e,{x:e.x,y:e.y,hp:e.hp});this.text('FANTASMA',x,y-35,6,'#c8f4ff');c.fillStyle='#91d8e2';c.fillRect(x-12,y-32,24*e.hp/e.max,2);
    }
    doorway(dir,target,g){
      const c=this.c,positions={up:[240,39,0],right:[463,136,Math.PI/2],down:[240,251,Math.PI],left:[17,136,-Math.PI/2]},[x,y,a]=positions[dir];
      const unlocked=!g.combatants().length,final=target==='next',color=final?'#d6b371':'#87a49b';c.save();c.translate(x,y);c.rotate(a);
      this.path([['M',-20,13],['L',-20,-14],['Q',0,-40,20,-14],['L',20,13],['Z']],'#060c12','#777e6e',3);
      this.path([['M',-14,13],['L',-14,-13],['Q',0,-30,14,-13],['L',14,13],['Z']],unlocked?color+'35':'#10171e','#151f25',1);
      if(unlocked){this.line(-13,9,13,9,color,1);this.path([['M',0,4],['L',0,-13],['M',-5,-8],['L',0,-14],['L',5,-8]],null,color,1.5);}
      else for(const xx of [-10,-5,0,5,10])this.line(xx,-16,xx,12,'#767767',1.5);
      this.skull(0,-26,.55,final?'#c5a56d':'#737d70');c.restore();
      if(final&&unlocked)this.text('SALA '+(g.room+1),dir==='left'?43:dir==='right'?435:x,dir==='up'?67:dir==='down'?230:y+30,7,'#e2c68c');
    }
    flame(x,y,t,size=1){const c=this.c;c.save();c.translate(x,y);c.scale(size,size);const sway=Math.sin(t*9+x)*2;
      this.path([['M',-6,3],['Q',-12,-6,-4,-15],['Q',-4,-7,0,-11],['Q',4,-19,2,-24],['Q',14,-8,7,2],['Q',0,8,-6,3],['Z']],'#ee7648','#924b47',.7);
      this.path([['M',-3,3],['Q',-6,-4,sway,-11],['Q',5,-3,3,4],['Z']],'#ffde8b',null);c.restore();}
    chest(b,g){const c=this.c;c.save();c.translate(b.x,b.y);this.ellipse(0,8,15,5,'#201c363f',null);const wood=b.luxury?'#809bb8':b.special?'#7146a6':'#ad734d',gold=b.luxury?'#ffe2a0':b.special?'#d7b2ff':'#dab47a';
      this.path([['M',-12,-4],['L',12,-4],['L',11,9],['Q',0,13,-11,9],['Z']],wood);
      this.path([['M',-12,-4],['Q',-13,-15,0,-14],['Q',13,-14,12,-4],['Z']],b.open?'#5d4551':wood);
      if(b.open)this.path([['M',-12,-9],['L',-10,-18],['Q',0,-22,12,-16],['L',12,-9],['Z']],wood);
      this.line(-7,-12,-7,9,gold,2.5);this.line(7,-12,7,9,gold,2.5);this.ellipse(0,-1,2.5,3.5,gold);this.line(0,-1,0,1,INK,1);
      if(b.luxury){this.star(-17,-14,3,'#ffe7a0');this.star(17,-5,2,'#fff2cb');}
      if(!b.open&&Math.hypot(g.hero.x-b.x,g.hero.y-b.y)<32)this.text(g.guarded(b)?'COFRE SELLADO':b.luxury?'E · LUJOSO':'E · ABRIR',0,-23,7,'#ebd9b3');c.restore();}
    actor(x,y,enemy,g,id){
      if(enemy?.species==='spider'){this.spider(enemy,g,false);return;}
      if(enemy?.kind==='ghost'){this.ghost(enemy,g);return;}
      const c=this.c,t=g.time,prev=this.memory.get(id),hp=enemy?enemy.hp:g.hero.hp;
      let hurt=prev?.hurt||0;if(prev&&hp<prev.hp){hurt=.22;this.sparks.push({x,y:y-18,time:t,text:enemy?'✦':'−',color:enemy?'#ffedb4':'#ffb5a2'});}
      const moving=prev&&Math.hypot(x-prev.x,y-prev.y)>.05,walk=moving?Math.sin(t*15):Math.sin(t*3)*.12,bob=moving?Math.abs(walk)*1.5:Math.sin(t*3)*.5;
      const facing=enemy?(g.hero.x<x?-1:1):(Math.cos(g.hero.face)<0?-1:1),punch=enemy?0:Math.sin(Math.PI*Math.min(1,(.18-g.attack)/.18))*(g.attack>0?1:0);
      this.memory.set(id,{x,y,hp,hurt:Math.max(0,hurt-this.dt)});this.ellipse(x,y+9,15,5,'#00050ab0',null);
      c.save();c.translate(x,y-bob);c.scale(facing*(enemy?.kind==='elite'?1.45:1),enemy?.kind==='elite'?1.45:1);c.rotate(hurt>0?Math.sin(hurt*50)*.12:0);
      const skin=g.shadow?'#111924':enemy?'#a6aa8e':'#b9b7a5',metal=g.shadow?'#373443':scope.ElementalEngine.QUALITIES[g.equipped?.[0]?.quality]?.color||'#77848a',outline=INK;
      if(!enemy&&g.equipped?.[9]){const color=scope.ElementalEngine.ELEMENTS[g.equipped[9].element].color;this.path([['M',-6,-15],['L',-17,10],['L',10,9],['L',6,-15]],color+'99');}
      // Jointed limbs: each foot and hand swings independently from the torso.
      for(const side of [-1,1]){const foot=side*5+walk*side*2;this.line(side*4,1,foot,9,outline,5);this.line(side*4,1,foot,9,enemy?'#929e87':skin,3);this.ellipse(foot+1,10,enemy?3.5:4,2.5,!enemy&&g.rank(1)?metal:skin);}
      if(enemy){
        this.path([['M',-8,-18],['Q',-15,-4,-13,10],['L',-7,7],['L',-3,11],['L',3,7],['L',11,11],['Q',14,-7,8,-18],['Z']],'#222b2c','#080e15',1.7);this.flame(0,-24,t,.55);this.path([['M',-7,-10],['Q',0,-14,7,-10],['L',5,1],['Q',0,6,-5,1],['Z']],'#788577');
        this.line(0,-10,0,2,'#b7bba0',2.5);for(let n=0;n<3;n++)this.path([['M',-6,-8+n*3],['Q',0,-5+n*3,6,-8+n*3]],null,'#a7ad95',1.5);
      }else{
        this.path([['M',-8,-11],['Q',0,-17,8,-11],['L',7,3],['Q',0,7,-7,3],['Z']],g.rank(0)?metal:skin);
        if(g.rank(0)){this.path([['M',-6,-9],['Q',0,-5,6,-9]],null,'#d2e2ed',2);this.line(0,-10,0,1,'#c8dce9',2);}else this.path([['M',-7,0],['Q',0,3,7,0],['L',5,6],['L',0,4],['L',-5,6],['Z']],'#eee2c7');
      }
      this.line(-7,-9,-11,-2+walk*2,outline,4.5);this.line(-7,-9,-11,-2+walk*2,skin,2.5);this.ellipse(-11,-1+walk*2,3,3,!enemy&&g.rank(3)?metal:skin);
      const handX=11+punch*13,handY=-4-punch*3;this.line(6,-9,handX,handY,outline,5);this.line(6,-9,handX,handY,skin,3);this.ellipse(handX,handY,enemy?3:4,3.5,!enemy&&g.rank(3)?metal:skin);
      c.save();c.translate(punch*2,-1);c.rotate(walk*.045);
      this.ellipse(0,-21,enemy?8:9,enemy?11:10,skin,outline,1.8);this.ellipse(9,-19,3,3,skin);
      if(enemy){this.ellipse(-3,-22,2.8,3.5,'#594258',null);this.ellipse(5,-22,2.8,3.5,'#594258',null);this.ellipse(5.5,-21.5,1.1,1.4,'#ffb65e',null);this.path([['M',0,-17],['L',2,-14],['L',-1,-14],['Z']],'#80666b',null);this.path([['M',-5,-13],['Q',1,-10,7,-13]],null,INK,.9);for(let n=0;n<4;n++)this.line(-3+n*2.5,-13,-3+n*2.5,-10,INK,.7);}
      else{
        this.path([['M',-10,-21],['Q',-15,-32,-4,-32],['L',-6,-37],['Q',1,-36,4,-31],['L',8,-34],['Q',14,-27,8,-25],['Q',3,-28,-4,-25],['L',-7,-18],['Z']],g.shadow?'#0b121d':'#28272d');
        this.ellipse(1,-21,2.8,3.6,'#161d24',null);this.ellipse(7,-21,2.6,3.4,'#161d24',null);this.ellipse(2,-20.5,1,1.6,INK,null);this.ellipse(8,-20.5,1,1.5,INK,null);
        this.line(-1,-25,3,-24,INK,1.2);this.line(6,-24,9,-25,INK,1.2);this.path([['M',1,-14],['Q',5,-16,8,-14]],null,INK,1);
        if(g.rank(2)){this.path([['M',-11,-19],['L',-12,-27],['Q',-8,-37,2,-35],['Q',12,-32,12,-25],['L',10,-19],['L',7,-27],['L',-5,-26],['L',-7,-18],['Z']],metal);this.line(0,-34,1,-28,'#d3e8ee',2);}
      }c.restore();
      if(g.shadow){this.path([['M',-9,-12],['Q',-18,2,-14,12],['L',-6,6],['L',0,13],['L',5,6],['L',12,11],['L',8,-12],['Z']],'#131d2baa',null);this.ellipse(2,-22,2,1.8,'#d4f9ff',null);this.ellipse(8,-22,2,1.8,'#d4f9ff',null);}
      if(enemy?.kind==='elite'){this.path([['M',-9,-11],['L',-6,-17],['L',8,-14],['L',9,-7],['Z']],'#65616a');c.save();c.translate(13,-3);c.rotate(enemy.swing>0?1.3:-.4);this.path([['M',-3,0],['L',-3,-27],['L',1,-34],['L',4,-27],['L',3,0],['Z']],'#bfb7a2');this.line(-7,0,7,0,'#b38454',3);c.restore();}
      if(!enemy){if(g.rank(7))this.ellipse(1,-8,2,2.5,'#b3f0e9');if(g.rank(6))this.line(-13,-3,-9,-2,'#bd8feb',2);if(g.rank(5))this.ellipse(handX+1,handY-1,1.2,1.2,'#f2d488',null);
        for(const slot of [4,8])if(g.rank(slot)){const gear=g.equipped?.[slot];c.save();c.translate(slot===4?handX-10:-21,-19);this.weaponIcon(gear?.weapon||'sword',scope.ElementalEngine.QUALITIES[gear?.quality]?.color||'#aaa',scope.ElementalEngine.ELEMENTS[gear?.element]?.color||'#b9eef1');c.restore();}}
      c.restore();
      if(enemy){if(enemy.dormant)this.text('DORMIDO',x,y-53,6,'#caa7ed');else if(enemy.kind==='melee'){this.line(x+14,y-5,x+14,y-28,'#e5b487',2);this.line(x+9,y-7,x+19,y-7,'#d79c65',2);}else if(enemy.kind==='area'){this.ellipse(x-15,y-15,5,5,'#ad70c6','#f1caff');}else if(enemy.kind==='caster'){this.path([['M',x+12,y-25],['Q',x+28,y-15,x+12,y-5]],null,'#b8dce6',2);this.line(x+12,y-25,x+12,y-5,'#b8dce6');}c.fillStyle='#594b56';c.fillRect(x-10,y-39,20,2);c.fillStyle='#ea9165';c.fillRect(x-10,y-39,20*enemy.hp/enemy.max,2);if(enemy.warning)this.text('!',x,y-44,10,'#ffe1a0');}
    }
    shadowBoss(g){
      const b=g.boss,c=this.c,color={mage:'#a0e3ec',rogue:'#bba1df',warrior:'#e0a078'}[b.style];
      for(let i=3;i>0;i--)this.ellipse(b.x,b.y+7,15+i*6,5+i*3,color+'16',null);
      const echo={...g,hero:{...b},shadow:true,attack:b.swing,rank:i=>(i===4&&b.style==='warrior'?1:0)||b.equipment[i]?.rank||0};
      this.actor(b.x,b.y,null,echo,'shadow');
      if(b.phase==='warning'){this.ellipse(b.x,b.y-48,9+Math.sin(g.time*12)*2,9,color+'55',color);this.text({mage:'❄',rogue:'↟',warrior:'†'}[b.style],b.x,b.y-44,13,color);}
      c.fillStyle='#101018';c.fillRect(130,40,220,6);c.fillStyle=color;c.fillRect(131,41,218*b.hp/b.max,4);
      this.text('EL ECO · TU PROPIA SOMBRA',240,34,8,'#e3d5bc');
    }
    plagueBoss(g){
      const b=g.boss,c=this.c;c.save();c.translate(b.x,b.y);c.scale(Math.cos(b.face)<0?-1:1,1);const breath=Math.sin(g.time*2)*1.2;
      this.ellipse(0,19,38,10,'#00060bb0',null);
      this.path([['M',-22,-34],['Q',-39,-13,-37,23],['L',-26,18],['L',-20,25],['L',-8,15],['L',15,24],['L',22,-29],['Z']],'#1b2928','#060b0f',2);
      for(const x of [-14,14]){this.path([['M',x-7,0],['L',x+8,0],['L',x+6,16],['L',x+13,22],['L',x-8,22],['Z']],'#3f4c47','#090e13',2);this.line(x-4,4,x+4,4,'#899078',1);}
      c.save();c.translate(0,breath);
      this.path([['M',-24,-36],['L',-12,-46],['L',15,-44],['L',27,-33],['L',19,2],['Q',0,11,-19,1],['Z']],b.hit?'#809879':'#46564b','#090f13',2.5);
      this.path([['M',-15,-32],['L',0,-21],['L',17,-33],['L',12,-5],['L',0,2],['L',-12,-5],['Z']],'#263c34','#73806a',1);
      this.skull(0,-18,1.2,'#9d9e78');
      for(const side of [-1,1]){this.ellipse(side*24,-33,12,10,'#596350','#0b1216',2);for(let i=0;i<3;i++)this.path([['M',side*(18+i*7),-39],['L',side*(21+i*8),-54+i*3],['L',side*(25+i*6),-36],['Z']],'#a7a37d','#10171a',1.3);this.line(side*27,-24,side*30,-6,'#101b1c',12);this.line(side*27,-24,side*30,-6,'#68705a',8);this.ellipse(side*30,-3,7,8,'#394c41','#0a1215',2);}
      this.path([['M',-12,-43],['L',-14,-59],['L',-9,-69],['L',5,-72],['L',15,-61],['L',13,-42],['L',0,-35],['Z']],'#515e50','#080f14',2);
      this.path([['M',-12,-56],['L',12,-56],['L',9,-48],['L',-8,-48],['Z']],'#080f14',null);this.line(-8,-52,-2,-51,'#d4ed83',2);this.line(4,-51,10,-53,'#d4ed83',2);
      this.line(0,-46,0,-39,'#a4ab81',1);
      c.save();c.translate(32,-3);c.rotate(b.swing>0?1.1:b.phase==='warning'?-1:.25);
      this.path([['M',-5,0],['L',-7,-54],['L',0,-68],['L',8,-55],['L',5,0],['Z']],'#71846a','#080f14',2);
      this.line(0,-56,0,-5,'#bfe080',2);this.line(-13,0,13,0,'#958962',4);this.line(0,2,0,14,'#292c2c',6);
      for(let i=0;i<4;i++)this.ellipse(5+Math.sin(g.time*2+i)*2,-40+i*11+Math.sin(g.time*3+i)*3,1.4,3,'#b6db7c',null);c.restore();c.restore();c.restore();
      c.fillStyle='#0a1018';c.fillRect(125,12,230,6);c.fillStyle='#a2bb75';c.fillRect(126,13,228*b.hp/b.max,4);this.text('MÓRTIGO · EL GUERRERO DE LA PESTE',240,29,8,'#d9dfba');
    }
    allyActor(g){const a=g.ally;this.actor(a.x,a.y,null,{...g,hero:a,shadow:true,attack:a.swing,rank:i=>a.equipment[i]?.rank||0},'ally');this.ellipse(a.x,a.y+11,15,4,'#9cdbed10','#9cdbed88',.7);this.text('EL ECO · ALIADO',a.x,a.y-44,6,'#abd9e2');}
    portrait(canvas,g){
      const prior=this.c,memory=this.memory,sparks=this.sparks;canvas.width=600;canvas.height=420;this.c=canvas.getContext('2d');this.c.scale(2,2);this.memory=new Map();this.sparks=[];
      const c=this.c,glow=c.createRadialGradient(150,100,8,150,100,130);glow.addColorStop(0,'#514448');glow.addColorStop(1,'#101115');c.fillStyle=glow;c.fillRect(0,0,300,210);
      for(const r of [63,69,86])this.ellipse(150,100,r,r,'#00000000','#9a7d4d55',.6);
      for(let i=0;i<16;i++){const a=i*Math.PI/8;this.star(150+Math.cos(a)*78,100+Math.sin(a)*78,2,'#a58a59');}
      c.save();c.translate(150,145);c.scale(3.1,3.1);this.actor(0,0,null,{...g,attack:0,rank:i=>g.rank(i)},'portrait');c.restore();
      this.text('✦  '+(g.hero.name||'EL SIN NOMBRE').toUpperCase()+'  ✦',150,193,9,'#d4bc90');
      this.c=prior;this.memory=memory;this.sparks=sparks;
    }
    draw(g){
      const c=this.c,t=g.time;this.dt=Math.max(0,Math.min(.05,t-this.clock));if(t<this.clock||this.lastHero!==g.hero){this.memory.clear();this.sparks=[];}this.lastHero=g.hero;this.clock=t;this.scene(g);c.drawImage(this.background,0,0,480,272);
      for(const x of (g.chapter===3?[]:[115,365])){this.path([['M',x-3,23],['L',x+3,23],['L',x+2,36],['L',x-2,36],['Z']],'#815962');this.flame(x,23,t,.65);}
      for(const [dir,target] of Object.entries(g.doors()))this.doorway(dir,target,g);
      for(const h of [...g.hazards,...g.enemies.filter(e=>['elite','melee','ghost'].includes(e.kind)&&e.warning).map(e=>({x:e.x,y:e.y,type:'sword',angle:e.face,radius:48}))]){
        c.save();c.translate(h.x,h.y);c.globalAlpha=h.fired?.9:.6+Math.sin(t*14)*.15;
        if(h.type==='web'){this.ellipse(0,0,h.radius,h.radius,'#d7e9e92a','#e2eef0',1);for(let i=0;i<8;i++){const a=i*Math.PI/4;this.line(0,0,Math.cos(a)*h.radius,Math.sin(a)*h.radius,'#dae9ee80',.7);}this.ellipse(0,0,h.radius*.5,h.radius*.5,'#00000000','#e2eef0',.7);}
        else if(h.type==='blast'){this.ellipse(0,0,h.radius,h.radius,h.fired?'#dd7ba580':'#dd7ba522','#ef9ecd',1.5);}
        else if(h.type==='poison'){this.ellipse(0,0,h.radius,h.radius*.75,h.fired?'#8aaf4a55':'#a6bc5022','#c3d888',1);for(let i=0;i<8;i++)this.ellipse(Math.sin(i*13)*h.radius*.7,Math.cos(i*7)*h.radius*.5-(h.fired?Math.sin(t*3+i)*6:0),2+i%3,2+i%3,'#d4e78935',null);}
        else if(h.type==='sword'){c.rotate(h.angle);c.beginPath();c.moveTo(0,0);c.arc(0,0,h.radius,-1.21,1.21);c.closePath();c.fillStyle=h.fired?'#edbc8580':'#d2865830';c.fill();c.strokeStyle='#d9a577';c.lineWidth=1;c.stroke();}
        else {this.ellipse(0,0,h.radius,h.radius,'#a187c32a','#bba1df',1);for(let i=0;i<9;i++){const x=Math.sin(i*7)*30,y=Math.cos(i*5)*29;if(h.fired){this.line(x-4,y-20,x,y,'#dbcfeb',1);this.path([['M',x-3,y-4],['L',x,y],['L',x+1,y-5]],null,'#dbcfeb');}else this.line(x-2,y,x+2,y,'#bba1df',1);}}
        c.restore();
      }
      for(const b of g.chests)this.chest(b,g);
      const living=new Set(['hero','shadow','ally']);const actors=g.enemies.map((e,i)=>({e,y:e.y,id:e}));actors.push({e:null,y:g.hero.y,id:'hero'});actors.sort((a,b)=>a.y-b.y);
      if(g.boss&&g.boss.hp>0){if(g.chapter===3)this.spider(g.boss,g,true);else if(g.chapter===2)this.plagueBoss(g);else this.shadowBoss(g);}
      if(g.ally)this.allyActor(g);
      for(const a of actors){living.add(a.id);if(a.e)this.actor(a.e.x,a.e.y,a.e,g,a.id);else this.actor(g.hero.x,g.hero.y,null,g,'hero');}
      for(const [id,old] of this.memory)if(!living.has(id)){this.sparks.push({x:old.x,y:old.y-13,time:t,text:'✧',color:'#fbe7c7'});this.memory.delete(id);}
      for(const p of [...g.shots,...g.friendlyShots]){const a=Math.atan2(p.vy,p.vx);c.save();c.translate(p.x,p.y);c.rotate(a);this.path([['M',-13,-4],['Q',-3,0,-13,4],['L',1,3],['L',1,-3],['Z']],p.earth?'#c9c29270':'#f3ae7370',null);if(p.type==='poison'){this.ellipse(0,0,6,5,'#a9cc76','#304b34',1);this.ellipse(-1,-1,2,2,'#e6f4b5',null);}else if(p.type==='arrow'){this.line(-10,0,6,0,'#d1bee8',1.5);this.path([['M',3,-3],['L',8,0],['L',3,3]],null,'#e9d9fa',1.5);}else if(p.type==='echo'){this.star(0,0,6,'#a1e3ed');}else if(p.type==='ice'){this.star(0,0,7,'#b6edf5');this.ellipse(0,0,3,3,'#f0ffff',null);}else if(p.earth)this.path([['M',-4,-3],['L',2,-5],['L',6,0],['L',2,5],['L',-4,3],['Z']],'#b9ae84');else this.ellipse(0,0,5,4,'#ffc96f','#b66750');c.restore();}
      if(g.skillEffect){const f=g.skillEffect,color=scope.ElementalEngine.ELEMENTS[f.element].color;this.ellipse(f.x,f.y,Math.min(170,f.radius)*(1-f.life*.5),Math.min(100,f.radius*.6),'#ffffff08',color,2);this.text(scope.ElementalEngine.ELEMENTS[f.element].skill,f.x,f.y-50,10,color);}
      if(g.attack>0){const h=g.hero,angle=h.face;c.save();c.translate(h.x,h.y-5);c.rotate(angle);c.globalAlpha=g.attack/.18;this.path([['M',20,-18],['Q',55,0,20,18],['Q',37,0,20,-18],['Z']],g.rank(4)?'#d6fcff':'#fff0c3',null);c.restore();}
      this.sparks=this.sparks.filter(s=>t-s.time<.45);for(const s of this.sparks){const age=(t-s.time)/.45;c.save();c.globalAlpha=1-age;this.star(s.x-12,s.y-4-age*12,4,s.color);this.star(s.x+14,s.y+3-age*12,3,s.color);this.text(s.text,s.x,s.y-age*12,9,INK);c.restore();}
      const fog=c.createLinearGradient(0,210,0,272);fog.addColorStop(0,'#b4c2ba00');fog.addColorStop(1,'#b4c2ba18');c.fillStyle=fog;c.fillRect(0,210,480,62);
      for(const n of g.notices){this.text(n.text,n.x,n.y-16,7,'#fff0c6');}
      if(g.hero.poison>0){this.ellipse(g.hero.x,g.hero.y+10,14,5,'#91b75522','#b2ce6e',1);this.text('VENENO',g.hero.x,g.hero.y-43,6,'#c6df94');}
      for(const x of [115,365]){const glow=c.createRadialGradient(x,42,1,x,42,55);glow.addColorStop(0,'#ecbd7433');glow.addColorStop(1,'#ecbd7400');c.fillStyle=glow;c.fillRect(x-55,0,110,100);}
      for(let i=0;i<22;i++){const x=(i*71+t*(i%2?2:-2)+480)%480,y=70+(i*31)%170;this.ellipse(x,y+Math.sin(t+i)*5,.5,.5,'#d0cab338',null);}
      if(g.mode==='ready'||g.mode==='dead'||g.mode==='won'||g.mode==='chapter-complete'){
        c.fillStyle='#050a13d9';c.fillRect(76,78,328,104);this.line(96,85,384,85,'#9e875755',1);this.line(96,174,384,174,'#9e875755',1);
        const title=g.mode==='ready'?'ELEMENTAL KNIGHT':g.mode==='dead'?'TU LLAMA SE APAGÓ':g.mode==='won'?'LA MATRIARCA HA CAÍDO':'EL DESCENSO TE ESPERA';
        this.text(title,240,115,16,'#d1c3a5');this.text(g.mode==='ready'?'Una luz diminuta en una catedral sin dioses.':g.mode==='dead'?'La cripta recuerda tu nombre. Volvé a intentarlo.':g.mode==='won'?'Las cavernas vuelven a respirar.':'Conservás tu nombre, tu clase y todo tu equipo.',240,142,8,'#a4b2af');
      }else if(g.paused){this.path([['M',181,237],['L',299,237],['L',299,258],['L',181,258],['Z']],'#060c16db','#8a805e',.6);this.text('PAUSA · SEGUIR',240,251,8,'#cabd9c');}
    }
  }
  scope.ElementalPainter=Painter;
})(globalThis);
