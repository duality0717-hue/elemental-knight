(function (scope) {
  'use strict';
  class Painter {
    constructor(canvas) { this.c = canvas.getContext('2d'); this.c.imageSmoothingEnabled = false; }
    rect(x, y, w, h, color) { this.c.fillStyle = color; this.c.fillRect(Math.round(x), Math.round(y), w, h); }
    icon(canvas, item) {
      const c = canvas.getContext('2d'), r = (x,y,w,h,color) => { c.fillStyle = color; c.fillRect(x,y,w,h); };
      c.imageSmoothingEnabled = false; r(0,0,20,20,'#282435');
      if (item.kind === 'potion') { const color = scope.ElementalEngine.ATTRS[item.attribute].color; r(8,2,5,3,'#e8c695');r(7,5,7,4,'#b5c5cf');r(5,8,11,10,'#b5c5cf');r(6,10,9,7,color);r(7,10,2,4,'#eef4ee'); return; }
      const muted = item.kind === 'empty', metal = muted ? '#554d64' : item.rank > 1 ? '#ead398' : '#b2cedd', ice = muted ? '#615971' : '#8adce9';
      switch(item.slot) {
        case 0: r(3,4,14,4,metal);r(5,8,10,10,metal);r(9,5,2,11,ice);break;
        case 1: r(4,5,4,11,metal);r(11,5,4,11,metal);r(3,14,6,4,ice);r(10,14,6,4,ice);break;
        case 2: r(4,4,12,11,metal);r(6,10,8,3,'#252438');r(9,3,2,13,ice);break;
        case 3: r(3,6,6,10,metal);r(11,6,6,10,metal);r(4,4,3,5,ice);r(12,4,3,5,ice);break;
        case 4: r(9,2,3,12,ice);r(5,12,11,2,metal);r(9,14,3,5,'#b78659');break;
        case 5: r(5,7,11,3,metal);r(4,10,3,6,metal);r(14,10,3,6,metal);r(6,15,9,3,metal);r(8,5,5,5,ice);break;
        case 6: r(4,6,13,3,metal);r(3,9,3,7,ice);r(15,9,3,7,ice);r(5,15,11,3,metal);break;
        case 7: r(4,3,2,7,metal);r(15,3,2,7,metal);r(6,10,9,2,metal);r(8,12,5,6,ice);break;
      }
    }
    sprite(x,y,enemy,g) {
      const r = this.rect.bind(this), t = g.time, on = i => g.rank(i), step = g.active() ? Math.round(Math.sin(t*10+x)*2) : 0;
      r(x-9,y+10,19,3,'#14121c');
      if(enemy) {
        const flame=Math.floor(Math.sin(t*15+x)*3);r(x-8,y-17,16,18,'#b33232');r(x-5,y-22+flame,4,12,'#ff7b32');r(x+3,y-24-flame,4,14,'#ffb84a');
        r(x-4,y-16,10,9,enemy.slow?'#a5e8ee':'#eee0c2');r(x-3,y-13,3,3,'#562f37');r(x+2,y-13,3,3,'#562f37');r(x-1,y-7,3,13,'#cabb9b');
        for(let i=0;i<3;i++)r(x-5,y-5+i*3,11,1,'#eee0c2');r(x-9,y-5,2,11,'#eee0c2');r(x+8,y-5,2,11,'#eee0c2');r(x-5,y+6,3,6+step,'#cabb9b');r(x+3,y+6,3,6-step,'#cabb9b');
        if(enemy.warning) {r(x-1,y-36,2,5,'#ffcf7d');r(x-1,y-29,2,2,'#ffcf7d');}return;
      }
      r(x-6,y+5,5,8+step,on(1)?'#929fb2':'#dbb49c');r(x+2,y+5,5,8-step,on(1)?'#929fb2':'#dbb49c');r(x-8,y-6,16,13,on(0)?'#7888a2':'#dbb49c');
      if(on(0)){r(x-5,y-6,10,3,'#bacbda');r(x-1,y-3,3,9,'#acc0d4');}else r(x-6,y+3,13,5,'#9b8a7d');
      r(x-5,y-16,11,10,'#dbb49c');if(!on(2))r(x-6,y-18,13,4,'#62464c');else{r(x-7,y-19,15,11,'#9cacc0');r(x-5,y-13,11,3,'#202737');r(x-1,y-20,3,13,'#d4e8ef');}
      r(x-11,y-4,4,7,on(3)?'#b6c8d8':'#dbb49c');r(x+9,y-4,4,7,on(3)?'#b6c8d8':'#dbb49c');if(on(7))r(x,y-5,2,3,'#7fecff');if(on(6))r(x-11,y+1,4,2,'#65c9e6');if(on(5))r(x+11,y+1,2,2,'#faf2a5');
    }
    dragon(g) {
      const b=g.boss,c=this.c,r=this.rect.bind(this),x=b.x,y=b.y,flap=Math.round(Math.sin(g.time*3)*4),base=b.hit?'#d3c6a1':'#777d4a';
      r(x-48,y+25,107,10,'#191d1c');
      // Stepped stone wings, horns and a plated tail keep the silhouette readable at low resolution.
      r(x-2,y-45-flap,38,7,'#414d39');r(x+8,y-38-flap,40,8,'#596442');r(x+16,y-30-flap,35,12,'#777d4a');
      r(x+29,y-18,23,16,'#596442');r(x+22,y-47-flap,5,27,'#b1ae79');r(x-13,y-25,37,44,base);
      r(x+24,y+3,21,13,'#687341');r(x+44,y+9,17,8,'#7f8750');r(x+60,y+7,9,6,'#b4ab77');
      r(x-23,y-21,18,30,base);r(x-44,y-18,31,19,base);r(x-51,y-8,22,11,'#939565');r(x-44,y-22,10,6,'#a2a16c');
      r(x-39,y-28,5,10,'#d3c493');r(x-21,y-30,5,13,'#d3c493');r(x-38,y-13,5,4,'#ffd57f');r(x-37,y-13,2,4,'#402d22');
      r(x-48,y+1,28,3,'#343d2b');for(let i=0;i<3;i++)r(x-44+i*7,y+2,3,4,'#ede0ba');
      r(x-16,y+15,13,14,base);r(x+13,y+14,14,16,base);r(x-20,y+27,18,5,'#c7c194');r(x+11,y+27,20,5,'#c7c194');
      for(let i=0;i<4;i++){r(x-7,y-28+i*11,6,6,'#b0ae78');r(x+4,y-24+i*10,10,2,'#989d68');}
      c.font='10px monospace';c.textAlign='center';c.fillStyle='#eee2ba';c.fillText('TERRAGRÁN · DRAGÓN DE TIERRA',240,39);
      r(135,45,210,5,'#292b25');r(135,45,210*b.hp/b.max,5,'#b4bd73');
    }
    draw(g) {
      const c=this.c,r=this.rect.bind(this),h=g.hero,t=g.time,earth=Boolean(g.boss);
      r(0,0,480,272,'#15131f');
      for(let y=24;y<256;y+=16)for(let x=16;x<464;x+=16){const n=(x*7+y*13)%23;r(x,y,15,15,earth?(n<8?'#293129':'#33382c'):g.room===4?(n<8?'#282936':'#303340'):(n<8?'#262331':n<15?'#2c2837':'#302b3b'));if(n<3)r(x+3,y+8,5,1,earth?'#4d523a':'#3a3447');}
      for(let x=0;x<480;x+=24){r(x,0,23,12,'#484052');r(x-12,13,23,12,'#383244');r(x,255,23,16,'#484052');}for(let y=25;y<255;y+=20){r(0,y,15,19,'#484052');r(464,y,16,19,'#484052');}
      for(const x of [52,210,390]){r(x-3,14,6,9,'#76503c');r(x-4,8,8,7,'#f17f3f');r(x-1,5+(Math.floor(t*8)%3),3,9,'#ffd27a');}
      const opened=!g.enemies.length&&g.mode==='play';r(459,112,21,49,opened?'#367879':'#181622');for(let i=0;i<3;i++)r(463+i*5,114,2,44,opened?'#8ce8e4':'#716070');
      for(const hazard of g.hazards){c.strokeStyle=hazard.fired?'#e8c37c':'#d3a853';c.lineWidth=2;c.beginPath();c.arc(hazard.x,hazard.y,hazard.radius,0,Math.PI*2);c.stroke();if(hazard.fired){for(let i=-2;i<=2;i++)r(hazard.x+i*8,hazard.y-Math.abs(i)*3,4,12,'#c2af70');}}
      for(const b of g.chests){const gold=b.luxury?'#f4d782':'#d4a44d';r(b.x-12,b.y+7,25,4,'#14121c');r(b.x-11,b.y-5,22,14,b.luxury?'#67788c':'#754930');r(b.x-9,b.y-3,18,9,b.luxury?'#8a98aa':'#a56d36');r(b.x-11,b.y-7,22,3,gold);r(b.x-7,b.y-5,2,14,gold);r(b.x+6,b.y-5,2,14,gold);if(b.open){r(b.x-9,b.y-8,18,7,'#231f28');r(b.x-11,b.y-13,22,4,gold);}else{r(b.x-2,b.y-2,4,5,b.luxury?'#a0ebee':'#f7d88e');if(Math.hypot(b.x-h.x,b.y-h.y)<32){c.font='10px monospace';c.textAlign='center';c.fillStyle='#ffe2a5';c.fillText(b.luxury?'E · LUJOSO':'E · ABRIR',b.x,b.y-16);}}}
      for(const e of g.enemies){this.sprite(e.x,e.y,e,g);r(e.x-10,e.y-29,20,2,'#181622');r(e.x-10,e.y-29,Math.ceil(20*e.hp/e.max),2,'#ef8655');}
      if(g.boss&&g.boss.hp>0)this.dragon(g);
      for(const p of g.shots){r(p.x-4,p.y-4,8,8,p.earth?'#9c915c':'#cf4c36');r(p.x-2,p.y-2,4,4,p.earth?'#d2c18a':'#ffcd69');}
      c.globalAlpha=h.inv>0&&Math.floor(t*14)%2?.5:1;this.sprite(h.x,h.y,null,g);c.globalAlpha=1;
      if(g.rank(4)){c.save();c.translate(Math.round(h.x),Math.round(h.y));c.rotate(h.face+(g.attack>0?(.18-g.attack)*12-1.1:.55));r(11,-2,20,3,'#acedef');r(29,-1,5,1,'#ecffff');r(11,-5,3,9,'#5a9fae');r(6,-1,6,2,'#705d6e');c.restore();}
      if(g.attack>0){c.strokeStyle=g.rank(4)?'#bcfaff':'#e1bea0';c.lineWidth=3;c.beginPath();c.arc(h.x,h.y,g.rank(4)?37:24,h.face-1.1,h.face+1.1);c.stroke();}
      for(const n of g.notices){c.font='9px monospace';c.textAlign='center';c.fillStyle='#ffe2a5';c.fillText(n.text,n.x,n.y);}
      if(g.paused||['ready','dead','won'].includes(g.mode)){r(70,88,340,85,'#14131f');r(70,88,340,2,'#809cae');c.textAlign='center';c.fillStyle='#ece5d4';c.font='bold 17px monospace';c.fillText(g.mode==='ready'?'ELEMENTAL KNIGHT':g.mode==='dead'?'HAS CAÍDO':g.mode==='won'?'DRAGÓN DERROTADO':'EN PAUSA',240,119);c.font='10px monospace';c.fillStyle='#a9c8ce';c.fillText(g.mode==='ready'?'Sin equipo. Cada victoria te hace más fuerte.':g.mode==='dead'?'Reiniciá y probá otra build.':g.mode==='won'?'Cofre lujoso obtenido · Enter: revisar botín':'Enter: atributos, set y mochila.',240,145);}
    }
  }
  scope.ElementalPainter = Painter;
})(globalThis);
