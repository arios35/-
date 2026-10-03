  // ---- Mountain range (north edge of the northern map) ----
  const MTN_PEAKS = [];
  for(let k=0;k<16;k++) MTN_PEAKS.push({ x: k*2.6 - 0.5 + ((k*5)%3)*0.35, h: 1.55 + ((k*7)%4)*0.18 });
  function mtnProfile(x){
    let best = null;
    for(const p of MTN_PEAKS){
      const h = p.h - Math.abs(x - p.x)*0.95;
      if(h > 0 && (!best || h > best.h)) best = { h, p, left: x < p.x };
    }
    return best;
  }
  function drawMountainSlice(sx, sy, wx){
    const bottom = sy + TILE, STEP = 2;
    for(let i=0;i<TILE;i+=STEP){
      const r = mtnProfile(wx + (i + STEP/2)/TILE);
      if(!r) continue;
      const hp = r.h*TILE, top = bottom - hp;
      ctx.fillStyle = r.left ? '#9b9793' : '#77736f';
      ctx.fillRect(sx+i, top, STEP, hp);
      const snowH = r.h - r.p.h*0.7;
      if(snowH > 0){ ctx.fillStyle = r.left ? '#ffffff' : '#dfe4ea'; ctx.fillRect(sx+i, top, STEP, snowH*TILE); }
    }
  }

  function camera(){
    const camX = Math.max(0, Math.min(COLS-VIEW_COLS, state.px + 0.5 - VIEW_COLS/2));
    const camY = Math.max(0, Math.min(ROWS-VIEW_ROWS, state.py + 0.5 - VIEW_ROWS/2));
    return {camX, camY};
  }

  function speckle(px,py,wx,wy,count,color,sizeMin,sizeMax){
    ctx.fillStyle = color;
    for(let i=0;i<count;i++){
      const seed = (wx*928371 + wy*128371 + i*3701 + 17) >>> 0;
      const rx = (seed % 97)/97;
      const ry = ((seed>>3) % 89)/89;
      const s = sizeMin + (((seed>>7) % 100)/100)*(sizeMax-sizeMin);
      ctx.fillRect(px + rx*TILE, py + ry*TILE, s, s);
    }
  }
  function drawTile(wx, wy, sx, sy){
    const t = tileAt(wx,wy);
    const px = sx*TILE, py = sy*TILE;
    if(t==='0'){
      ctx.fillStyle = GROUND;
      ctx.fillRect(px,py,TILE,TILE);
      if(state.map==='river'){                       // little wild flowers
        const h = ((wx*73856093) ^ (wy*19349663)) >>> 0;
        if(h%7===0){
          const cols = ['#ffffff','#ffd84a','#ff9ec4'], fx = px + 4 + (h>>4)%(TILE-9), fy = py + 4 + (h>>9)%(TILE-9);
          ctx.fillStyle = cols[(h>>3)%3]; ctx.fillRect(fx, fy, 3, 3); ctx.fillRect(fx-1, fy+1, 5, 1);
          ctx.fillStyle = '#e0a020'; ctx.fillRect(fx+1, fy+1, 1, 1);
        }
      }
    } else if(t==='B'||t==='C'){
      ctx.fillStyle = '#6ea8d8'; ctx.fillRect(px,py,TILE,TILE);
      const u = TILE/16;
      ctx.fillStyle = '#b98a4e';
      ctx.strokeStyle = 'rgba(90,58,32,0.55)';
      if(t==='B'){
        ctx.fillRect(px,py+2*u,TILE,12*u);
        for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(px+i*4*u+2*u,py+2*u); ctx.lineTo(px+i*4*u+2*u,py+14*u); ctx.stroke(); }
        ctx.fillStyle = '#7a5230'; ctx.fillRect(px,py+1*u,TILE,2*u); ctx.fillRect(px,py+13*u,TILE,2*u);
      } else {
        ctx.fillRect(px+2*u,py,12*u,TILE);
        for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(px+2*u,py+i*4*u+2*u); ctx.lineTo(px+14*u,py+i*4*u+2*u); ctx.stroke(); }
        ctx.fillStyle = '#7a5230'; ctx.fillRect(px+1*u,py,2*u,TILE); ctx.fillRect(px+13*u,py,2*u,TILE);
      }
    } else if(t==='F'){
      ctx.fillStyle = '#6ea8d8'; ctx.fillRect(px,py,TILE,TILE);
      const u = TILE/16;
      ctx.fillStyle = '#c39a5c'; ctx.fillRect(px+3*u,py,10*u,TILE);
      ctx.strokeStyle = 'rgba(90,58,32,0.55)';
      for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(px+3*u,py+i*4*u+2*u); ctx.lineTo(px+13*u,py+i*4*u+2*u); ctx.stroke(); }
      ctx.fillStyle = '#6b4a2a'; ctx.fillRect(px+2*u,py,2*u,TILE); ctx.fillRect(px+12*u,py,2*u,TILE);
    } else if(t==='l'||t==='m'||t==='n'){
      drawSprite(px, py, t==='m' ? ROOF_MID_TEX : ROOF_TEX, HOUSE2_PALETTE, TILE/16, false);
    } else if(t==='o'||t==='p'||t==='q'){
      drawSprite(px, py, t==='p' ? WALL_DOOR : WALL_WINDOW, HOUSE2_PALETTE, TILE/16, false);
    } else if(t==='r'||t==='R'||t==='x'||t==='s'||t==='S'||t==='y'){
      ctx.fillStyle = GROUND; ctx.fillRect(px,py,TILE,TILE);
      const u = TILE/16, top = (t==='r'||t==='R'||t==='x');
      const le = (t==='r'||t==='s'), re = (t==='x'||t==='y');
      if(!top){
        ctx.fillStyle = '#b9b3a5'; ctx.fillRect(px, py+9*u, TILE, 7*u);
        ctx.fillStyle = '#9c9689'; ctx.fillRect(px, py+9*u, TILE, 2*u);
      }
      ctx.fillStyle = '#8a5a34';
      if(le) ctx.fillRect(px+1*u, py, 2.5*u, TILE);
      if(re) ctx.fillRect(px+TILE-3.5*u, py, 2.5*u, TILE);
      if(top){ ctx.fillRect(px, py+1*u, TILE, 2*u); ctx.fillRect(px, py+TILE-2*u, TILE, 2*u); }
      if(t==='R'){ ctx.font = Math.round(TILE*0.6)+'px sans-serif'; ctx.fillText('🚧', px+TILE*0.18, py+TILE*0.72); }
    } else if(t==='j'){
      ctx.fillStyle = GROUND; ctx.fillRect(px,py,TILE,TILE);
      const u = TILE/16;
      ctx.fillStyle = '#c97b5f';
      ctx.fillRect(px+1*u, py+3*u, 3*u, 11*u); ctx.fillRect(px+12*u, py+3*u, 3*u, 11*u);
      ctx.fillStyle = '#8a4a32';
      ctx.fillRect(px+4*u, py+5*u, 2*u, 8*u);
      ctx.fillRect(px+4*u, py+6*u, 4*u, 2*u); ctx.fillRect(px+4*u, py+10*u, 4*u, 2*u);
    } else if(t==='G'||t==='Z'||t==='T'||t==='J'){
      ctx.fillStyle = '#e8dcae'; ctx.fillRect(px,py,TILE,TILE);
    } else if(t==='t'){                                  // sand beach, with foam where it meets the sea
      ctx.fillStyle = '#efdca0'; ctx.fillRect(px,py,TILE,TILE);
      speckle(px,py,wx,wy,6,'rgba(160,120,60,0.18)',1,2);
      speckle(px,py,wx,wy+50,3,'rgba(255,255,255,0.35)',1,2);
      const wv = (Math.sin(performance.now()/500 + wx*0.8 + wy*0.6)+1)/2;
      ctx.fillStyle = `rgba(255,255,255,${0.35+0.35*wv})`;
      if(tileAt(wx-1,wy)==='7') ctx.fillRect(px, py, 3, TILE);
      if(tileAt(wx+1,wy)==='7') ctx.fillRect(px+TILE-3, py, 3, TILE);
      if(tileAt(wx,wy-1)==='7') ctx.fillRect(px, py, TILE, 3);
      if(tileAt(wx,wy+1)==='7') ctx.fillRect(px, py+TILE-3, TILE, 3);
    } else if(t==='3'||t==='u'||t==='v'||t==='U'||t==='V'||t==='X'||t==='Q'||t==='I'||t==='z'){
      ctx.fillStyle = '#e8dcae';
      ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      ctx.fillRect(px+3,py+3,TILE-6,TILE-6);
      speckle(px,py,wx,wy,4,'rgba(0,0,0,0.08)',1,2);
    } else if(t==='8'){
      ctx.fillStyle = GROUND;
      ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle = '#8a4a32';
      ctx.fillRect(px+3,py+TILE/2-7,TILE-6,6);
      ctx.fillStyle = '#c97b5f';
      ctx.fillRect(px+TILE/2-3,py+4,6,TILE-8);
    } else if(t==='g'||t==='A'){
      ctx.fillStyle = GROUND;
      ctx.fillRect(px,py,TILE,TILE);
      let shake = 0;
      for(const e of effects){
        if(e.type==='rockchip' && e.wx===wx && e.wy===wy){
          const a = (performance.now()-e.start)/600;
          if(a<0.5) shake = -Math.abs(Math.sin(a*60))*(1-a*2)*2.5;
        }
      }
      if(t==='A'){
        drawSprite(px+shake, py, GOLD_SPRITE, GOLD_PALETTE, TILE/16, false);
        const tw = (Math.sin(performance.now()/300 + wx*1.7 + wy)+1)/2;
        ctx.fillStyle = `rgba(255,248,190,${0.25+0.55*tw})`; ctx.fillRect(px+TILE*0.62, py+TILE*0.3, 3, 3);
      } else drawSprite(px+shake, py, ROCK_SPRITE, ROCK_PALETTE, TILE/16, false);
    } else if(t==='h'||t==='i'){
      ctx.fillStyle = GROUND;
      ctx.fillRect(px,py,TILE,TILE);
      const u = TILE/16, L = t==='h', x0 = L ? px+1*u : px, w = L ? 15*u : 15*u;
      ctx.fillStyle = '#c58a52'; ctx.fillRect(x0, py+6*u, w, 3*u);
      ctx.fillStyle = '#8a5a34'; ctx.fillRect(x0, py+9*u, w, 2*u);
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(L ? px+2*u : px+12*u, py+11*u, 2*u, 4*u);
      if(L){
        ctx.fillRect(px+7*u, py+11*u, 2*u, 4*u);
        ctx.fillStyle = '#6b4a2a'; ctx.fillRect(px+6*u, py+3*u, 2*u, 4*u);
        ctx.fillStyle = '#9a9a9a'; ctx.fillRect(px+4*u, py+2*u, 6*u, 2.5*u);
      } else {
        ctx.fillStyle = '#5a5f68'; ctx.fillRect(px+4*u, py+4*u, 7*u, 2*u);
        ctx.fillRect(px+6*u, py+3*u, 3*u, 1*u);
        ctx.fillStyle = '#b8bcc4'; ctx.fillRect(px+3*u, py+4*u, 2*u, 1*u);
      }
    } else if(t==='P'){
      ctx.fillStyle = GROUND; ctx.fillRect(px,py,TILE,TILE);
      const u = TILE/16;
      ctx.fillStyle = '#f1e6d0'; ctx.fillRect(px+7*u, py+9*u, 2*u, 4*u);
      ctx.fillStyle = '#d9433a'; ctx.beginPath(); ctx.ellipse(px+8*u, py+9.5*u, 4.5*u, 3.5*u, 0, Math.PI, Math.PI*2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(px+5.5*u, py+8*u, 1.5*u, 1.5*u); ctx.fillRect(px+9*u, py+7.3*u, 1.5*u, 1.5*u);
    } else if(t==='Y'||t==='W'){
      ctx.fillStyle = GROUND; ctx.fillRect(px,py,TILE,TILE);
      const u = TILE/16;
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(px+2*u, py+13.5*u, 12*u, 2*u);
      ctx.fillStyle = '#8a5a34'; ctx.fillRect(px+2*u, py+7*u, 12*u, 7*u);
      if(t==='Y'){
        ctx.fillStyle = '#a56b3a'; ctx.fillRect(px+2*u, py+4.5*u, 12*u, 3.5*u);
        ctx.fillStyle = '#e0b030'; ctx.fillRect(px+7*u, py+4.5*u, 2*u, 9.5*u);
        ctx.fillStyle = '#fff2a0'; ctx.fillRect(px+7*u, py+8*u, 2*u, 2*u);
      } else {
        ctx.fillStyle = '#2a1810'; ctx.fillRect(px+3*u, py+7*u, 10*u, 2*u);
        ctx.fillStyle = '#a56b3a'; ctx.fillRect(px+2*u, py+2*u, 12*u, 3*u);
        ctx.fillStyle = '#e0b030'; ctx.fillRect(px+7*u, py+2*u, 2*u, 3*u);
      }
    } else if(t==='k'){
      ctx.fillStyle = GROUND; ctx.fillRect(px,py,TILE,TILE);
      const u = TILE/16;
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(px+8*u, py+14.2*u, 7.5*u, 2*u, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#8f8b84'; ctx.fillRect(px+1.5*u, py+7*u, 13*u, 7*u);                       // front wall
      ctx.fillStyle = '#716d66'; ctx.fillRect(px+1.5*u, py+10*u, 13*u, 0.8*u); ctx.fillRect(px+1.5*u, py+12.6*u, 13*u, 0.8*u);
      ctx.fillRect(px+5*u, py+7.8*u, 0.8*u, 2.2*u); ctx.fillRect(px+10*u, py+10.8*u, 0.8*u, 1.8*u);
      ctx.fillStyle = '#b9b4aa'; ctx.beginPath(); ctx.ellipse(px+8*u, py+7*u, 6.8*u, 3.4*u, 0, 0, Math.PI*2); ctx.fill();   // rim
      ctx.fillStyle = '#2f6fa8'; ctx.beginPath(); ctx.ellipse(px+8*u, py+7*u, 5*u, 2.4*u, 0, 0, Math.PI*2); ctx.fill();       // water
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(px+6*u, py+6.2*u, 2.5*u, 0.8*u);
      ctx.fillStyle = '#8a5a34'; ctx.fillRect(px+11.5*u, py+3.5*u, 2.2*u, 2.6*u);                                              // bucket on the rim
      ctx.fillStyle = '#5b3a1f'; ctx.fillRect(px+11.5*u, py+3.5*u, 2.2*u, 0.7*u);
    } else if(t==='O'){
      ctx.fillStyle = GROUND; ctx.fillRect(px,py,TILE,TILE);
      const u = TILE/16, g = (Math.sin(performance.now()/400 + wx)+1)/2;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(px+2*u, py+13.5*u, 12*u, 2*u);
      ctx.fillStyle = '#4a4650'; ctx.fillRect(px+3*u, py+8*u, 10*u, 6*u);
      ctx.fillStyle = '#5f5a68'; ctx.fillRect(px+2*u, py+6.5*u, 12*u, 2.5*u);
      ctx.fillStyle = `rgba(160,120,255,${0.5+0.4*g})`;
      ctx.beginPath(); ctx.moveTo(px+8*u, py+0.5*u); ctx.lineTo(px+11*u, py+4.5*u); ctx.lineTo(px+8*u, py+6.5*u); ctx.lineTo(px+5*u, py+4.5*u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(px+7*u, py+2*u, 1.5*u, 2*u);
      ctx.fillStyle = `rgba(190,160,255,${0.4+0.4*g})`; ctx.fillRect(px+5*u, py+10*u, 2*u, 1.5*u); ctx.fillRect(px+9*u, py+10*u, 2*u, 1.5*u);
    } else if(t==='E'){
      ctx.fillStyle = '#4a2f3d'; ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle = ((wx+wy)%2===0) ? '#573648' : '#432a37'; ctx.fillRect(px+1,py+1,TILE-2,TILE-2);
    } else if(t==='D'||t==='H'||t==='L'||t==='K'){
      ctx.fillStyle = GROUND; ctx.fillRect(px,py,TILE,TILE);
      const u = TILE/16;
      ctx.fillStyle = '#4a4650'; ctx.fillRect(px+1*u, py+1*u, 14*u, 14*u);           // stone frame
      ctx.fillStyle = '#15131a'; ctx.fillRect(px+3*u, py+3*u, 10*u, 10*u);           // dark hole
      const steps = ['#6a6570','#58535f','#46424d','#34313b'];
      for(let i=0;i<4;i++){ ctx.fillStyle = steps[i]; ctx.fillRect(px+3*u, py+(3+i*2.5)*u, 10*u, 2*u); }
      if(t==='D'){                                                                   // barricaded until paid
        ctx.fillStyle = '#8a5a34'; ctx.fillRect(px+1*u, py+5*u, 14*u, 2*u); ctx.fillRect(px+1*u, py+10*u, 14*u, 2*u);
        ctx.fillStyle = '#e0b030'; ctx.fillRect(px+7*u, py+7*u, 2*u, 3*u);
      } else {
        ctx.fillStyle = '#e0a030'; ctx.beginPath();
        if(t==='L'){ ctx.moveTo(px+TILE/2, py+5*u); ctx.lineTo(px+11*u, py+11*u); ctx.lineTo(px+5*u, py+11*u); }
        else { ctx.moveTo(px+TILE/2, py+11*u); ctx.lineTo(px+11*u, py+5*u); ctx.lineTo(px+5*u, py+5*u); }
        ctx.fill();
      }
    } else if(t==='M'){
      ctx.fillStyle = '#7d7975'; ctx.fillRect(px,py,TILE,TILE);
    } else if(t==='N'){
      ctx.fillStyle = '#3b3742'; ctx.fillRect(px,py,TILE,TILE);
      speckle(px,py,wx,wy,7,'rgba(255,255,255,0.08)',1,3);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(px,py+TILE-4,TILE,4);
    } else if(t==='6'||t==='9'){
      ctx.fillStyle = GROUND;
      ctx.fillRect(px,py,TILE,TILE);
    } else if(t==='7'){
      ctx.fillStyle = state.map==='coast' ? '#4f93cf' : '#6ea8d8';
      ctx.fillRect(px,py,TILE,TILE);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      const wt = performance.now()/900;
      const oy = ((Math.sin(wt+wx*0.9+wy*0.7)+1)/2)*(TILE-8)+4;
      ctx.beginPath(); ctx.moveTo(px+4,py+oy); ctx.lineTo(px+TILE-4,py+oy); ctx.stroke();
      if(state.map==='river' && (wx*7+wy*3)%13===0){   // lily pads
        ctx.fillStyle = '#4f9a55'; ctx.beginPath(); ctx.ellipse(px+TILE/2, py+TILE/2, 8, 5, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#6ea8d8'; ctx.fillRect(px+TILE/2, py+TILE/2-1, 9, 2);
        if((wx+wy)%2===0){ ctx.fillStyle = '#ff9ec4'; ctx.fillRect(px+TILE/2-4, py+TILE/2-4, 4, 4); }
      }
    } else if(t==='a'||t==='b'||t==='c'){
      drawSprite(px, py, t==='b' ? ROOF_MID_TEX : ROOF_TEX, BUILDING_PALETTE, TILE/16, false);
    } else if(t==='d'||t==='e'||t==='f'){
      drawSprite(px, py, t==='e' ? WALL_DOOR : WALL_WINDOW, BUILDING_PALETTE, TILE/16, false);
    } else if(t==='2'){
      ctx.fillStyle = GROUND;
      ctx.fillRect(px,py,TILE,TILE);
      drawSprite(px, py, HOUSE_SPRITE, HOUSE_PALETTE, TILE/16, false);
    } else if(t==='4'){
      ctx.fillStyle = GROUND;
      ctx.fillRect(px,py,TILE,TILE);
      drawSprite(px, py, PERSON_SPRITE, NPC_PALETTE, TILE/16, false);
    } else if(t==='5'){
      ctx.fillStyle = GROUND;
      ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle = '#c9955f';
      ctx.fillRect(px+4,py+8,TILE-8,TILE-14);
      ctx.fillStyle = '#7a5a35';
      ctx.beginPath(); ctx.moveTo(px+2,py+8); ctx.lineTo(px+TILE/2,py-2); ctx.lineTo(px+TILE-2,py+8); ctx.fill();
      ctx.fillStyle = '#fff8ec';
      ctx.font = '9px monospace';
      ctx.fillText('鶏', px+TILE/2-5, py+TILE/2+5);
    } else if(t==='1'){
      const ft = farmTile(wx,wy);
      ctx.fillStyle = ft.tilled ? '#6b3f26' : '#8b5a3c';
      ctx.fillRect(px,py,TILE,TILE);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      for(let i=6;i<TILE;i+=8){ ctx.beginPath(); ctx.moveTo(px+i,py); ctx.lineTo(px+i,py+TILE); ctx.stroke(); }
      speckle(px,py,wx,wy,6,'rgba(0,0,0,0.13)',1,3);
      speckle(px,py,wx,wy+90,3,'rgba(255,255,255,0.05)',1,2);
      if(ft.planted){
        if(ft.growth===0){
          drawSprite(px, py, SEED_SPRITE, SEED_PALETTE, TILE/16, false);
        } else if(ft.growth===1){
          drawSprite(px, py, SPROUT_SPRITE, WHEAT_PALETTE, TILE/16, false);
        } else if(ft.growth===2){
          drawSprite(px, py, GROWING_SPRITE, WHEAT_PALETTE, TILE/16, false);
        } else {
          const cropDef = CROPS[ft.crop||'wheat'];
          drawSprite(px, py, cropDef.sprite, cropDef.palette, TILE/16, false);
        }
      }
      if(ft.watered){
        ctx.fillStyle = 'rgba(110,168,216,0.35)';
        ctx.fillRect(px,py,TILE,TILE);
      }
    }
  }

  let actionAnim = null;
  function triggerActionAnim(tool){ actionAnim = { start: performance.now(), tool: tool||'hoe' }; }

  function drawPlayer(camX, camY){
    if(wellAnim){ drawPlayerWell(camX, camY); return; }
    const px = (state.px-camX)*TILE, py = (state.py-camY)*TILE;
    const tool = actionAnim ? actionAnim.tool : null;
    const overhead = !!tool && tool!=='hoe';        // axe / pickaxe / sword: swing down from overhead
    const DUR = tool==='sword' ? 300 : overhead ? 420 : 320;
    let bob = 0;
    if(overhead){
      const p = (performance.now() - actionAnim.start)/DUR;
      bob = p<0.4 ? -2*(p/0.4) : (p<0.65 ? 1.5 : 0);   // rise on wind-up, drop on the strike
    }
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(px+TILE/2, py+TILE-3, TILE*0.28, 4, 0, 0, Math.PI*2); ctx.fill();
    const scale = TILE/16;
    let sprite = BOY_FRONT, flip = false;
    if(state.dir==='up') sprite = BOY_BACK;
    else if(state.dir==='left'){ sprite = BOY_SIDE; flip = true; }
    else if(state.dir==='right'){ sprite = BOY_SIDE; flip = false; }
    if(invuln>0 && Math.floor(performance.now()/90)%2===0) ctx.globalAlpha = 0.35;
    drawSprite(px, py+bob, sprite, PLAYER_PALETTE, scale, flip);
    ctx.globalAlpha = 1;

    if(actionAnim){
      const age = performance.now() - actionAnim.start;
      if(age > DUR){ actionAnim = null; }
      else{
        const p = age/DUR;
        let swing, hx, hy, sign = 1;
        if(!overhead){
          swing = Math.sin(p*Math.PI)*80 - 25; // degrees
          hx = px+TILE/2; hy = py+TILE*0.62;
          if(state.dir==='left'){ hx -= 8; sign = -1; }
          else if(state.dir==='right'){ hx += 8; sign = 1; }
          else if(state.dir==='up'){ hy -= 6; }
          else{ hy += 6; }
        } else {
          // overhead: raise the tool up and back, then bring it down hard over the top
          if(p<0.4) swing = 100 + (p/0.4)*65;                              // raise
          else if(p<0.65){ const q = (p-0.4)/0.25; swing = 165 + q*q*170; } // fast downswing
          else swing = 335 + ((p-0.65)/0.35)*15;                           // follow-through
          hy = py + TILE*0.58 + bob;
          if(state.dir==='left'){ hx = px+TILE/2 - 6; sign = -1; }
          else if(state.dir==='right'){ hx = px+TILE/2 + 6; }
          else { hx = px+TILE/2 + 8; }
        }
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(swing*Math.PI/180*sign);
        if(tool==='sword'){
          ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-2, -3, 4, 7);            // grip
          ctx.fillStyle = '#d9b34a'; ctx.fillRect(-6, 3, 12, 3);            // guard
          ctx.fillStyle = SWORD_COLORS[(state.swordLevel||1)-1]; ctx.fillRect(-2.5, 6, 5, 17);          // blade
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0.5, 6, 1.5, 17);
          const en = state.enchant || {};                                    // enchantment glow
          if(en.fire){ ctx.fillStyle = 'rgba(255,120,30,0.85)'; ctx.fillRect(-2.5, 6, 1.5, 17); }
          if(en.wave){ ctx.fillStyle = 'rgba(110,220,255,0.85)'; ctx.fillRect(1.5, 6, 1.2, 17); }
          if(en.knock){ ctx.fillStyle = '#fff27a'; ctx.fillRect(-1, 3.5, 2, 2); }
          ctx.fillStyle = SWORD_COLORS[(state.swordLevel||1)-1];
          ctx.beginPath(); ctx.moveTo(-2.5, 23); ctx.lineTo(0, 27); ctx.lineTo(2.5, 23); ctx.closePath(); ctx.fill();
        } else {
          ctx.fillStyle = '#6b4a2a';
          ctx.fillRect(-2, -3, 4, 20);
          if(tool==='axe'){
            ctx.fillStyle = '#b8bcc4'; ctx.fillRect(-1, 11, 9, 8);
            ctx.fillStyle = '#e6e9ee'; ctx.fillRect(6, 11, 3, 8);
          } else if(tool==='pick'){
            ctx.fillStyle = '#9a9a9a'; ctx.fillRect(-9, 11, 18, 3);
            ctx.fillRect(-9, 11, 3, 7); ctx.fillRect(6, 11, 3, 7);
          } else {
            ctx.fillStyle = '#9a9a9a'; ctx.fillRect(-7, 15, 14, 6);
          }
        }
        ctx.restore();
      }
    }
  }

  let effects = [];
  let fadeStart = 0;
  let GROUND = '#a9c96e';
  function addEffect(wx,wy,type,color){ effects.push({wx,wy,type,color,start:performance.now()}); }

  function draw(){
    GROUND = state.map==='coast' ? '#b3d98c' : state.map==='dungeon' ? DUNGEON_GROUND[floorTier(state.floor||1)] : state.map==='cave' ? '#6f6b76' : state.map==='north' ? '#8fbf86' : state.map==='river' ? '#9fcf97' : '#a9c96e';
    const {camX, camY} = camera();
    ctx.fillStyle = GROUND;                                   // never leave old frames showing
    ctx.fillRect(0, 0, VIEW_COLS*TILE + TILE, VIEW_ROWS*TILE + TILE);
    const startX = Math.floor(camX), startY = Math.floor(camY);
    const trees = [];
    const mts = [];
    const overlays = [];
    for(let wy=startY; wy<=startY+Math.ceil(VIEW_ROWS); wy++){
      for(let wx=startX; wx<=startX+Math.ceil(VIEW_COLS); wx++){
        const sx = (wx-camX)*TILE, sy = (wy-camY)*TILE;
        const tt = tileAt(wx,wy);
        if(tt==='6'||tt==='9') trees.push([sx,sy,wx,wy,tt]);
        if(tt==='M' && tileAt(wx,wy+1)!=='M') mts.push([sx,sy,wx]);
        if(tt==='G'||tt==='Z'||tt==='T'||tt==='u'||tt==='v'||tt==='U'||tt==='V'||tt==='X'||tt==='Q'||tt==='J'||tt==='I'||tt==='z') overlays.push([sx,sy,wx,tt]);
        drawTile(wx, wy, sx/TILE, sy/TILE);
      }
    }
    if(state.map==='home'){
      for(const c of state.sheep) drawSheep((c.x-camX)*TILE, (c.y-camY)*TILE, c.face||1, !c.fed && !c.woolReady, !!c.woolReady);
      for(const c of state.cows) drawCow((c.x-camX)*TILE, (c.y-camY)*TILE, c.face||1, !c.fed && !c.milkReady, !!c.milkReady);
    }
    for(const [msx,msy,mwx] of mts) drawMountainSlice(msx,msy,mwx);
    // Trees drawn bigger than their tile, overflowing into neighbors, on top of the base grid
    const tScale = (TILE/16)*2.6;
    const tSize = 16*tScale;
    const nowT = performance.now();
    for(const [sx,sy,wx,wy,tt] of trees){
      let shake = 0;
      for(const e of effects){
        if(e.type==='chop' && e.wx===wx && e.wy===wy){
          const a = (nowT-e.start)/600;
          if(a<0.5) shake = Math.sin(a*60)*(1-a*2)*3;
        }
      }
      const spr = (tt==='6' && state.fruit[K(wx,wy)]) ? TREE_SPRITE : TREE_NOFRUIT;
      drawSprite(sx + TILE/2 - tSize/2 + shake, sy + TILE - tSize, spr, TREE_PALETTE, tScale, false);
    }
    // Gate and exit arrows on top of the border trees
    for(const [ox,oy,owx,ot] of overlays){
      const u = TILE/16;
      if(ot==='G'||ot==='Z'||ot==='T'||ot==='J'){
        const left = (owx%2===0);
        ctx.fillStyle = '#8a5a34';
        ctx.fillRect(ox,oy+3*u,TILE,2*u); ctx.fillRect(ox,oy+9*u,TILE,2*u);
        for(let i=1;i<6;i++) ctx.fillRect(ox+i*TILE/6-u,oy+2*u,2*u,11*u);
        ctx.fillStyle = '#5a3a20'; ctx.fillRect(left?ox:ox+TILE-3*u, oy+1*u, 3*u, 14*u);
        ctx.fillStyle = '#e0b030'; ctx.fillRect(left?ox+TILE-3*u:ox, oy+6*u, 3*u, 4*u);
      } else {
        ctx.fillStyle = '#e0a030';
        ctx.beginPath();
        if(ot==='u'||ot==='V'||ot==='X'||ot==='z'){ ctx.moveTo(ox+TILE/2,oy+6); ctx.lineTo(ox+TILE-7,oy+TILE-7); ctx.lineTo(ox+7,oy+TILE-7); }
        else { ctx.moveTo(ox+TILE/2,oy+TILE-6); ctx.lineTo(ox+TILE-7,oy+7); ctx.lineTo(ox+7,oy+7); }
        ctx.fill();
      }
    }
    // Tilling dust effects
    const now = performance.now();
    effects = effects.filter(e => now - e.start < 600);
    for(const e of effects){
      const age = (now - e.start)/600;
      const ex = (e.wx - camX + 0.5)*TILE, ey = (e.wy - camY + 0.5)*TILE;
      if(e.type==='wood'||e.type==='drop'){
        const tx = (state.px+0.5-camX)*TILE, ty = (state.py+0.5-camY)*TILE;
        const p = Math.min(1, age*1.2);
        for(let i=0;i<3;i++){
          const x = ex + (tx-ex)*p + (i-1)*8*(1-p);
          const y = ey - 8 + (ty-ey+8)*p - Math.sin(p*Math.PI)*22;
          if(e.type==='drop'){
            ctx.fillStyle = e.color; ctx.fillRect(x-4, y-4, 8, 8);
            ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x-4, y-4, 8, 3);
          } else {
            ctx.fillStyle = '#8a5a34'; ctx.fillRect(x-6, y-2.5, 12, 5);
            ctx.fillStyle = '#c9955f'; ctx.fillRect(x-6, y-2.5, 3, 5);
          }
        }
        continue;
      }
      ctx.globalAlpha = Math.max(0, 1 - age*1.1);
      ctx.fillStyle = e.type==='water' ? '#6ea8d8' : e.type==='plant' ? '#5fa85f' : e.type==='chop' ? '#c9955f' : e.type==='rockchip' ? '#9aa0a8' : e.type==='pick' ? '#e08030' : '#6b3f26';
      for(let i=0;i<6;i++){
        const ang = (i/6)*Math.PI*2 + age*2.5;
        const dist = age*16;
        ctx.beginPath();
        ctx.arc(ex+Math.cos(ang)*dist, ey+Math.sin(ang)*dist - age*10, 2.5+age*2.5, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if(state.map==='dungeon'){ drawBossGround(camX, camY); drawEnemies(camX, camY); drawWaves(camX, camY); drawBossShots(camX, camY); }
    drawFishingSpot(camX, camY);
    drawPlayer(camX, camY);
    drawFishing(camX, camY);
    if(state.map==='cave' || state.map==='dungeon'){   // dark: light only around the player
      const cx = (state.px+0.5-camX)*TILE, cy = (state.py+0.5-camY)*TILE;
      const R = Math.max(VIEW_COLS, VIEW_ROWS)*TILE*0.55;
      const g = ctx.createRadialGradient(cx, cy, TILE*2.2, cx, cy, R);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, state.map==='dungeon' ? 'rgba(0,0,0,0.82)' : 'rgba(0,0,0,0.7)');
      ctx.fillStyle = g; ctx.fillRect(0,0,VIEW_COLS*TILE,VIEW_ROWS*TILE);
    }
    if(state.map==='dungeon' && invuln>0.55){
      ctx.fillStyle = `rgba(210,30,40,${(invuln-0.55)*0.45})`; ctx.fillRect(0,0,VIEW_COLS*TILE,VIEW_ROWS*TILE);
    }
    const wfa = wellFadeAlpha();
    if(wfa>0){ ctx.fillStyle = `rgba(0,0,0,${wfa})`; ctx.fillRect(0, 0, VIEW_COLS*TILE + TILE, VIEW_ROWS*TILE + TILE); }
    drawHearts();
    drawFloorLabel();
    drawBossBar();
    if(fadeStart){
      const a = 1 - (performance.now()-fadeStart)/600;
      if(a<=0) fadeStart = 0;
      else { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fillRect(0,0,VIEW_COLS*TILE,VIEW_ROWS*TILE); }
    }
    drawDragGuide();
  }
