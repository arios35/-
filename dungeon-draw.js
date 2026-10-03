  // ---- enemy drawing ----
  function drawSlime(cx,by,s,flash,t,ex){
    const sq = Math.sin(t*6 + ex*2)*0.1, w = TILE*0.78*(1+sq)*s, h = TILE*0.6*(1-sq)*s;
    ctx.fillStyle = flash ? '#ffffff' : '#55c46a';
    ctx.beginPath(); ctx.moveTo(cx-w/2, by);
    ctx.quadraticCurveTo(cx-w/2, by-h*1.3, cx, by-h*1.3);
    ctx.quadraticCurveTo(cx+w/2, by-h*1.3, cx+w/2, by);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = flash ? '#dddddd' : '#3aa552'; ctx.fillRect(cx-w/2, by-3*s, w, 3*s);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(cx-w*0.28, by-h*0.95, 3*s, 2*s);
    ctx.fillStyle = '#1e2a20'; ctx.fillRect(cx-w*0.22, by-h*0.6, 2.5*s, 3.5*s); ctx.fillRect(cx+w*0.1, by-h*0.6, 2.5*s, 3.5*s);
    return by - h*1.3;
  }
  function drawBat(cx,by,s,flash,t,ex,ey){
    const cy = by - 12*s + Math.sin(t*9 + ex*3)*2*s, flap = Math.sin(t*22 + ey*5);
    ctx.fillStyle = flash ? '#ffffff' : '#5a4a86';
    ctx.beginPath(); ctx.moveTo(cx-3*s,cy); ctx.lineTo(cx-13*s, cy-(5+flap*5)*s); ctx.lineTo(cx-10*s, cy+3*s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx+3*s,cy); ctx.lineTo(cx+13*s, cy-(5+flap*5)*s); ctx.lineTo(cx+10*s, cy+3*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = flash ? '#ffffff' : '#3b2f5c';
    ctx.beginPath(); ctx.ellipse(cx, cy, 5*s, 6*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(cx-4*s, cy-8*s, 2*s, 3*s); ctx.fillRect(cx+2*s, cy-8*s, 2*s, 3*s);
    ctx.fillStyle = '#ff5a5a'; ctx.fillRect(cx-3*s, cy-2*s, 2*s, 2*s); ctx.fillRect(cx+1*s, cy-2*s, 2*s, 2*s);
    return cy - 8*s;
  }
  function drawGhost(cx,by,s,flash,t,ex){
    const cy = by - 13*s + Math.sin(t*3 + ex)*2*s, wob = Math.sin(t*6 + ex)*1.5*s;
    ctx.save(); ctx.globalAlpha = 0.85;
    ctx.fillStyle = flash ? '#ffffff' : '#dfe8ff';
    ctx.beginPath(); ctx.arc(cx, cy, 8*s, Math.PI, 0);
    ctx.lineTo(cx+8*s, cy+9*s+wob); ctx.lineTo(cx+4*s, cy+6*s); ctx.lineTo(cx, cy+9*s-wob);
    ctx.lineTo(cx-4*s, cy+6*s); ctx.lineTo(cx-8*s, cy+9*s+wob);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1b1b2e';
    ctx.beginPath(); ctx.ellipse(cx-3*s, cy-1*s, 1.6*s, 2.4*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+3*s, cy-1*s, 1.6*s, 2.4*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy+4*s, 1.8*s, 2.2*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    return cy - 8*s;
  }
  function drawSkeleton(cx,by,s,flash,t,ex){
    const bone = flash ? '#ffffff' : '#e8e4d4', sw = Math.sin(t*8 + ex)*1.5*s;
    ctx.fillStyle = bone;
    ctx.fillRect(cx-4*s, by-25*s, 8*s, 7*s);                 // skull
    ctx.fillRect(cx-3*s, by-18*s, 6*s, 2*s);                 // jaw
    ctx.fillRect(cx-1*s, by-16*s, 2*s, 9*s);                 // spine
    ctx.fillRect(cx-5*s, by-15*s, 10*s, 1.5*s); ctx.fillRect(cx-4.5*s, by-12*s, 9*s, 1.5*s); ctx.fillRect(cx-4*s, by-9*s, 8*s, 1.5*s);   // ribs
    ctx.fillRect(cx-3*s, by-7*s+sw, 2*s, 7*s-sw); ctx.fillRect(cx+1*s, by-7*s-sw, 2*s, 7*s+sw);   // legs
    ctx.fillRect(cx-7*s, by-15*s, 2*s, 8*s); ctx.fillRect(cx+5*s, by-15*s, 2*s, 8*s);              // arms
    ctx.fillStyle = '#1a1a22'; ctx.fillRect(cx-3*s, by-23*s, 2*s, 2.5*s); ctx.fillRect(cx+1*s, by-23*s, 2*s, 2.5*s);
    ctx.fillStyle = flash ? '#ffffff' : '#b8bcc4'; ctx.fillRect(cx+6*s, by-24*s, 1.5*s, 10*s);   // sword
    ctx.fillStyle = '#6b4a2a'; ctx.fillRect(cx+4.5*s, by-14.5*s, 4.5*s, 1.5*s);
    return by - 25*s;
  }
  function drawGoblin(cx,by,s,flash,t,ex){
    const skin = flash ? '#ffffff' : '#6fb04f', sw = Math.sin(t*10 + ex)*1.5*s;
    ctx.fillStyle = skin;
    ctx.fillRect(cx-5*s, by-22*s, 10*s, 8*s);                // head
    ctx.beginPath(); ctx.moveTo(cx-5*s, by-20*s); ctx.lineTo(cx-10*s, by-23*s); ctx.lineTo(cx-5*s, by-16*s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx+5*s, by-20*s); ctx.lineTo(cx+10*s, by-23*s); ctx.lineTo(cx+5*s, by-16*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = flash ? '#eeeeee' : '#7a5a34'; ctx.fillRect(cx-5*s, by-14*s, 10*s, 8*s);
    ctx.fillStyle = flash ? '#dddddd' : '#5a4028'; ctx.fillRect(cx-4*s, by-6*s+sw, 3*s, 6*s-sw); ctx.fillRect(cx+1*s, by-6*s-sw, 3*s, 6*s+sw);
    ctx.fillStyle = skin; ctx.fillRect(cx-8*s, by-13*s, 3*s, 6*s); ctx.fillRect(cx+5*s, by-13*s, 3*s, 6*s);
    ctx.fillStyle = '#ffe14a'; ctx.fillRect(cx-3.5*s, by-20*s, 2*s, 2*s); ctx.fillRect(cx+1.5*s, by-20*s, 2*s, 2*s);
    ctx.fillStyle = '#1a1a22'; ctx.fillRect(cx-3*s, by-19.5*s, 1*s, 1*s); ctx.fillRect(cx+2*s, by-19.5*s, 1*s, 1*s);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(cx-2*s, by-16*s, 1*s, 1.5*s); ctx.fillRect(cx+1*s, by-16*s, 1*s, 1.5*s);
    ctx.fillStyle = flash ? '#ffffff' : '#c8ccd4'; ctx.fillRect(cx+8*s, by-17*s, 1.5*s, 7*s);    // dagger
    return by - 23*s;
  }
  function drawOrc(cx,by,s,flash,t,ex){
    const skin = flash ? '#ffffff' : '#4f8f4a', sw = Math.sin(t*7 + ex)*1.5*s;
    ctx.fillStyle = skin; ctx.fillRect(cx-6*s, by-27*s, 12*s, 9*s);                                   // head
    ctx.fillStyle = flash ? '#eeeeee' : '#5a5a66'; ctx.fillRect(cx-8*s, by-18*s, 16*s, 12*s);          // armor
    ctx.fillStyle = flash ? '#dddddd' : '#3f3f4a'; ctx.fillRect(cx-8*s, by-18*s, 16*s, 3*s);
    ctx.fillStyle = flash ? '#cccccc' : '#3a2f28'; ctx.fillRect(cx-5*s, by-6*s+sw, 4*s, 6*s-sw); ctx.fillRect(cx+1*s, by-6*s-sw, 4*s, 6*s+sw);
    ctx.fillStyle = skin; ctx.fillRect(cx-11*s, by-17*s, 3*s, 9*s); ctx.fillRect(cx+8*s, by-17*s, 3*s, 9*s);
    ctx.fillStyle = '#ff5a3a'; ctx.fillRect(cx-4*s, by-24*s, 2*s, 2*s); ctx.fillRect(cx+2*s, by-24*s, 2*s, 2*s);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(cx-4*s, by-20*s, 1.5*s, 3*s); ctx.fillRect(cx+2.5*s, by-20*s, 1.5*s, 3*s);   // tusks
    ctx.fillStyle = '#6b4a2a'; ctx.fillRect(cx+10*s, by-26*s, 2*s, 16*s);                              // axe
    ctx.fillStyle = flash ? '#ffffff' : '#a4a8b0'; ctx.fillRect(cx+10*s, by-27*s, 6*s, 6*s);
    return by - 27*s;
  }
  function drawCrown(cx, top, s){
    const k = s*0.8;
    ctx.fillStyle = '#f2c230';
    ctx.fillRect(cx-5*k, top-3*k, 10*k, 3*k);
    ctx.beginPath(); ctx.moveTo(cx-5*k, top-3*k); ctx.lineTo(cx-3.5*k, top-7*k); ctx.lineTo(cx-2*k, top-3*k);
    ctx.lineTo(cx, top-8*k); ctx.lineTo(cx+2*k, top-3*k); ctx.lineTo(cx+3.5*k, top-7*k); ctx.lineTo(cx+5*k, top-3*k);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e63b4f'; ctx.fillRect(cx-0.8*k, top-2.5*k, 1.6*k, 1.6*k);
  }
  function drawEnemies(camX, camY){
    const t = performance.now()/1000;
    for(const e of enemies){
      const s = e.scale||1;
      const sx = (e.x-camX)*TILE, sy = (e.y-camY)*TILE;
      if(sx<-TILE*3 || sy<-TILE*3 || sx>VIEW_COLS*TILE+TILE*2 || sy>VIEW_ROWS*TILE+TILE*2) continue;
      const flash = e.hurt>0 || (e.boss && e.st==='wind' && Math.floor(t*12)%2===0);
      const cx = sx+TILE/2, by = sy+TILE-3, bb = by - (e.z||0)*TILE;   // bb = body line (lifted while leaping)
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath(); ctx.ellipse(cx, by, TILE*0.3*s, 3*Math.min(s,1.6), 0, 0, Math.PI*2); ctx.fill();
      if(e.boss){
        ctx.strokeStyle = `rgba(255,70,60,${0.35+0.25*Math.sin(t*4)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, by, TILE*0.5*s, 5*s, 0, 0, Math.PI*2); ctx.stroke();
      }
      ctx.save();
      if(e.face<0 && (e.kind==='skeleton' || e.kind==='goblin' || e.kind==='orc')){   // mirror the ones holding a weapon
        ctx.translate(cx, 0); ctx.scale(-1, 1); ctx.translate(-cx, 0);
      }
      let top = by;
      if(e.kind==='slime') top = drawSlime(cx,bb,s,flash,t,e.x);
      else if(e.kind==='bat') top = drawBat(cx,bb,s,flash,t,e.x,e.y);
      else if(e.kind==='ghost') top = drawGhost(cx,bb,s,flash,t,e.x);
      else if(e.kind==='skeleton') top = drawSkeleton(cx,bb,s,flash,t,e.x);
      else if(e.kind==='goblin') top = drawGoblin(cx,bb,s,flash,t,e.x);
      else top = drawOrc(cx,bb,s,flash,t,e.x);
      ctx.restore();
      if(e.burnT>0){                                              // flames on burning enemies
        const fl = Math.sin(t*20 + e.x*5)*2*s;
        ctx.fillStyle = 'rgba(255,120,30,0.9)';
        ctx.beginPath(); ctx.moveTo(cx-6*s, by-6*s); ctx.lineTo(cx-3*s+fl, by-17*s); ctx.lineTo(cx, by-6*s); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx, by-6*s); ctx.lineTo(cx+3*s-fl, by-19*s); ctx.lineTo(cx+6*s, by-6*s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,225,80,0.9)';
        ctx.beginPath(); ctx.moveTo(cx-3*s, by-6*s); ctx.lineTo(cx+fl*0.5, by-13*s); ctx.lineTo(cx+3*s, by-6*s); ctx.closePath(); ctx.fill();
      }
      if(e.boss){
        drawCrown(cx, top, s);
        if(e.st==='recover'){                                     // dizzy stars = the opening
          ctx.fillStyle = '#ffe14a';
          for(let i=0;i<3;i++){ const a = t*4 + i*2.1; ctx.fillRect(cx + Math.cos(a)*11*s*0.7 - 2, top - 9*s + Math.sin(a)*3 - 2, 4, 4); }
        }
        if(e.st==='wind' && e.atk){                               // announce the attack
          ctx.save(); ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
          ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.lineWidth = 3; ctx.strokeText(e.atk.label, cx, top - 16*s);
          ctx.fillStyle = '#ffd0c8'; ctx.fillText(e.atk.label, cx, top - 16*s);
          ctx.restore();
        }
      }
    }
  }
  function drawWaves(camX, camY){
    for(const w of waves){
      const sx = (w.x+0.5-camX)*TILE, sy = (w.y+0.5-camY)*TILE, a = Math.atan2(w.dy, w.dx);
      const fade = 0.35 + 0.65*Math.max(0, w.left/w.range);
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(a); ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(120,220,255,${0.35*fade})`; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.arc(-6, 0, 13, -1.0, 1.0); ctx.stroke();
      ctx.strokeStyle = `rgba(200,245,255,${0.95*fade})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(-6, 0, 13, -1.0, 1.0); ctx.stroke();
      ctx.restore();
    }
  }
  function drawBossBar(){
    if(state.map!=='dungeon') return;
    const b = enemies.find(e=>e.boss && e.active);
    if(!b) return;
    const W = Math.min(240, VIEW_COLS*TILE*0.7), x = (VIEW_COLS*TILE - W)/2, y = VIEW_ROWS*TILE - 24;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x-6, y-19, W+12, 32);
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff'; ctx.fillText(b.name, x+W/2, y-6);
    ctx.fillStyle = '#3b1a1f'; ctx.fillRect(x, y, W, 8);
    ctx.fillStyle = '#e63b4f'; ctx.fillRect(x, y, W*Math.max(0, b.hp/b.maxhp), 8);
    ctx.strokeStyle = '#1b0f12'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, W, 8);
    ctx.restore();
  }
  function drawFloorLabel(){
    if(state.map!=='dungeon') return;
    const text = `地下${state.floor||1}階`;
    ctx.save();
    ctx.font = 'bold 12px sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const w = ctx.measureText(text).width + 16, x = VIEW_COLS*TILE - w - 8, y = 8, h = 26;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    if(ctx.roundRect){ ctx.beginPath(); ctx.roundRect(x, y, w, h, 9); ctx.fill(); } else ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffffff'; ctx.fillText(text, x+8, y+h/2+1);
    ctx.restore();
  }
  // Life gauge: 5 hand-drawn hearts (each heart = 2 life points = 2 hits' worth of half hearts)
  function heartPath(x,y,s){
    ctx.beginPath();
    ctx.moveTo(x+s*0.5, y+s*0.92);
    ctx.bezierCurveTo(x-s*0.12, y+s*0.55, x+s*0.05, y-s*0.05, x+s*0.5, y+s*0.28);
    ctx.bezierCurveTo(x+s*0.95, y-s*0.05, x+s*1.12, y+s*0.55, x+s*0.5, y+s*0.92);
    ctx.closePath();
  }
  function drawHearts(){
    if(state.map!=='dungeon') return;
    const s = 17, gap = 4, pad = 6, x0 = 8, y0 = 8;
    const w = pad*2 + 5*s + 4*gap, h = pad*2 + s;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    if(ctx.roundRect){ ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 9); ctx.fill(); }
    else ctx.fillRect(x0, y0, w, h);
    for(let i=0;i<5;i++){
      const x = x0 + pad + i*(s+gap), y = y0 + pad, v = state.hp - i*2;   // v>=2 full, v==1 half
      heartPath(x,y,s); ctx.fillStyle = '#3b2a30'; ctx.fill();
      if(v>=1){
        ctx.save(); heartPath(x,y,s); ctx.clip();
        ctx.fillStyle = '#e63b4f';
        ctx.fillRect(x-2, y-2, v>=2 ? s+4 : s/2+2, s+4);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(x-2, y+s*0.62, v>=2 ? s+4 : s/2+2, s*0.4);
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath(); ctx.ellipse(x+s*0.27, y+s*0.3, s*0.09, s*0.05, -0.6, 0, Math.PI*2); ctx.fill();
      }
      heartPath(x,y,s); ctx.lineWidth = 1.6; ctx.strokeStyle = '#1b0f12'; ctx.stroke();
    }
    ctx.restore();
  }
