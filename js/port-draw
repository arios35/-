  // ===== 港町の描画 =====
  // ---- 地面 ----
  function drawStoneGround(px,py,wx,wy){                          // 石畳(広場は少し明るい)
    const u = TILE/16, plaza = (wx>=22 && wx<=33 && wy>=10 && wy<=24), odd = (wx+wy)%2===1;
    ctx.fillStyle = plaza ? (odd ? '#d8d0bf' : '#d0c7b4') : (odd ? '#cbc3b1' : '#c2baa7');
    ctx.fillRect(px,py,TILE,TILE);
    ctx.fillStyle = 'rgba(70,60,45,0.30)';
    ctx.fillRect(px, py+TILE-1, TILE, 1);
    ctx.fillRect(px, py+7.5*u, TILE, 1);
    const o = (wy%2===0) ? 4*u : 11*u;                            // 段ごとに目地をずらす
    ctx.fillRect(px+o, py, 1, 7.5*u);
    ctx.fillRect(px+((o+8*u)%TILE), py+7.5*u, 1, 8.5*u);
  }
  function drawDeckGround(px,py,wx,wy){                           // 板張りの岸と桟橋
    const u = TILE/16, ns = tileAt(wx,wy-1)==='w' || tileAt(wx,wy+1)==='w';
    ctx.fillStyle = (wx+wy)%2 ? '#b98a4e' : '#b2824a'; ctx.fillRect(px,py,TILE,TILE);
    ctx.fillStyle = 'rgba(60,35,15,0.38)';
    if(ns){ for(let i=0;i<4;i++) ctx.fillRect(px, py+i*4*u+3.5*u, TILE, 1); }
    else { for(let i=0;i<4;i++) ctx.fillRect(px+i*4*u+3.5*u, py, 1, TILE); }
    ctx.fillStyle = 'rgba(40,25,10,0.45)'; ctx.fillRect(px+2*u, py+2*u, 1.5, 1.5); ctx.fillRect(px+TILE-3.5*u, py+TILE-3.5*u, 1.5, 1.5);
    ctx.fillStyle = '#6b4a2a';                                    // 海に面した縁
    if(tileAt(wx,wy+1)==='7') ctx.fillRect(px, py+TILE-3*u, TILE, 3*u);
    if(tileAt(wx,wy-1)==='7') ctx.fillRect(px, py, TILE, 3*u);
    if(tileAt(wx-1,wy)==='7') ctx.fillRect(px, py, 3*u, TILE);
    if(tileAt(wx+1,wy)==='7') ctx.fillRect(px+TILE-3*u, py, 3*u, TILE);
  }
  function drawDecorGround(d, px, py){
    for(let j=0;j<d.h;j++) for(let i=0;i<d.w;i++){
      const gx = px+i*TILE, gy = py+j*TILE;
      if(d.ground==='=') drawStoneGround(gx,gy,d.x+i,d.y+j);
      else if(d.ground==='w') drawDeckGround(gx,gy,d.x+i,d.y+j);
      else { ctx.fillStyle = GROUND; ctx.fillRect(gx,gy,TILE,TILE); }
    }
  }

  // ---- 置き物 ----
  function drawPortDecor(d, camX, camY, t){
    const u = TILE/16, px = (d.x-camX)*TILE, py = (d.y-camY)*TILE, W = d.w*TILE, H = d.h*TILE;
    if(px > VIEW_COLS*TILE+TILE || py > VIEW_ROWS*TILE+TILE || px+W < -TILE || py+H < -TILE) return;
    drawDecorGround(d, px, py);
    switch(d.type){
      case 'lamp': {
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(px+8*u, py+14.5*u, 5*u, 2*u, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3a3a44'; ctx.fillRect(px+7.2*u, py+6*u, 1.6*u, 9*u); ctx.fillRect(px+5.5*u, py+13.5*u, 5*u, 2*u);
        ctx.fillStyle = `rgba(255,220,120,${0.16+0.08*Math.sin(t*3+d.x)})`; ctx.beginPath(); ctx.arc(px+8*u, py+5*u, 8*u, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#2f2f38'; ctx.fillRect(px+4.8*u, py+1.5*u, 6.4*u, 1.5*u);
        ctx.fillStyle = '#ffd870'; ctx.fillRect(px+5.5*u, py+3*u, 5*u, 4*u);
        ctx.fillStyle = '#2f2f38'; ctx.fillRect(px+5.5*u, py+7*u, 5*u, 1.2*u);
        break; }
      case 'bench': {
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(px+2*u, py+13*u, W-3*u, 2.5*u);
        ctx.fillStyle = '#8a5a34'; ctx.fillRect(px+1*u, py+4*u, W-2*u, 3.5*u);                   // 背もたれ
        ctx.fillStyle = '#a56b3a'; ctx.fillRect(px+1*u, py+8*u, W-2*u, 4*u);                     // 座面
        ctx.fillStyle = '#5a3a20'; ctx.fillRect(px+2*u, py+12*u, 1.8*u, 3*u); ctx.fillRect(px+W-3.8*u, py+12*u, 1.8*u, 3*u);
        break; }
      case 'tree': {
        const planter = d.ground==='=';
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(px+8*u, py+14.5*u, 6*u, 2*u, 0, 0, Math.PI*2); ctx.fill();
        if(planter){ ctx.fillStyle = '#9c968a'; ctx.fillRect(px+3*u, py+11*u, 10*u, 4.5*u); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(px+4*u, py+11*u, 8*u, 1.5*u); }
        ctx.fillStyle = '#6b4a2a'; ctx.fillRect(px+7*u, py+(planter?6:7)*u, 2*u, (planter?6:7.5)*u);
        const cy = py + (planter ? 5 : 5.5)*u;
        ctx.fillStyle = '#3f8a45'; ctx.beginPath(); ctx.arc(px+8*u, cy, 6*u, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#4fa055'; ctx.beginPath(); ctx.arc(px+6.5*u, cy-1.2*u, 4*u, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(px+5.5*u, cy-2.2*u, 1.8*u, 0, Math.PI*2); ctx.fill();
        break; }
      case 'crate': {
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(px+2.5*u, py+14*u, 12*u, 2*u);
        ctx.fillStyle = '#b98a4e'; ctx.fillRect(px+2*u, py+4*u, 12*u, 11*u);
        ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.5; ctx.strokeRect(px+2*u, py+4*u, 12*u, 11*u);
        ctx.beginPath(); ctx.moveTo(px+2*u, py+4*u); ctx.lineTo(px+14*u, py+15*u); ctx.moveTo(px+14*u, py+4*u); ctx.lineTo(px+2*u, py+15*u); ctx.stroke();
        break; }
      case 'barrel': {
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(px+8*u, py+14.5*u, 6*u, 2*u, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#a56b3a'; ctx.fillRect(px+3*u, py+4*u, 10*u, 10*u);
        ctx.beginPath(); ctx.ellipse(px+8*u, py+4*u, 5*u, 2.2*u, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#c58a52'; ctx.beginPath(); ctx.ellipse(px+8*u, py+4*u, 4*u, 1.6*u, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#4a4650'; ctx.fillRect(px+3*u, py+7*u, 10*u, 1.2*u); ctx.fillRect(px+3*u, py+11*u, 10*u, 1.2*u);
        break; }
      case 'stall': {
        const A = AWNINGS[d.awn];
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(px+2*u, py+14*u, W-3*u, 2*u);
        ctx.fillStyle = '#6b4a2a'; ctx.fillRect(px+1*u, py+4*u, 1.6*u, 11*u); ctx.fillRect(px+W-2.6*u, py+4*u, 1.6*u, 11*u);   // 柱
        ctx.fillStyle = '#b98a4e'; ctx.fillRect(px+1.5*u, py+9*u, W-3*u, 5*u);                                                   // 台
        ctx.fillStyle = '#8a5a34'; ctx.fillRect(px+1.5*u, py+13*u, W-3*u, 1.5*u);
        for(let i=0;i<4;i++){                                                                                                    // 商品
          const gx = px + (3+i*7)*u, gy = py+9*u;
          if(d.goods===0){ ctx.fillStyle = '#d9433a'; ctx.beginPath(); ctx.arc(gx+2.5*u, gy+1.5*u, 2.4*u, 0, Math.PI*2); ctx.fill(); }
          else if(d.goods===1){ ctx.fillStyle = '#7fa8c8'; ctx.beginPath(); ctx.ellipse(gx+2.5*u, gy+1.5*u, 3*u, 1.5*u, 0, 0, Math.PI*2); ctx.fill(); }
          else if(d.goods===2){ ctx.fillStyle = '#f0a020'; ctx.beginPath(); ctx.arc(gx+2.5*u, gy+1.5*u, 2.4*u, 0, Math.PI*2); ctx.fill(); }
          else { ctx.fillStyle = '#e0b878'; ctx.beginPath(); ctx.ellipse(gx+2.5*u, gy+1.5*u, 3*u, 2*u, 0, 0, Math.PI*2); ctx.fill(); }
        }
        let k = 0;                                                                                                               // ストライプの日よけ
        for(let sx=0; sx<W; sx+=4*u, k++){
          ctx.fillStyle = A[k%2]; ctx.fillRect(px+sx, py+1*u, Math.min(4*u, W-sx), 4.5*u);
          ctx.beginPath(); ctx.arc(px+sx+2*u, py+5.5*u, 2*u, 0, Math.PI); ctx.fill();
        }
        break; }
      case 'bollard': {
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(px+8*u, py+11*u, 3.6*u, 1.6*u, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#2f2f38'; ctx.fillRect(px+5.6*u, py+6*u, 4.8*u, 5*u);
        ctx.beginPath(); ctx.ellipse(px+8*u, py+6*u, 2.4*u, 1.3*u, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#5a5a66'; ctx.beginPath(); ctx.ellipse(px+8*u, py+5.6*u, 1.6*u, 0.8*u, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#9c7a4a'; ctx.fillRect(px+5.2*u, py+8*u, 5.6*u, 1.2*u);
        break; }
      case 'plaque': {
        ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(px+3.5*u, py+4*u, 10*u, 10*u);
        ctx.fillStyle = '#f5ecd0'; ctx.fillRect(px+3*u, py+3*u, 10*u, 10*u);
        ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.5; ctx.strokeRect(px+3*u, py+3*u, 10*u, 10*u);
        ctx.save(); ctx.fillStyle = '#3d3220'; ctx.font = 'bold '+Math.round(8*u)+'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(d.label, px+8*u, py+8.4*u); ctx.restore();
        break; }
      case 'fountain': drawFountain(px, py, t); break;
    }
  }
  function drawFountain(px, py, t){
    const u = TILE/16, cx = px+TILE, cy = py+TILE;
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(cx+1, cy+3, TILE*0.98, TILE*0.88, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#a8a296'; ctx.beginPath(); ctx.arc(cx, cy, TILE*0.95, 0, Math.PI*2); ctx.fill();       // ふち
    ctx.fillStyle = '#d8d2c6'; ctx.beginPath(); ctx.arc(cx, cy, TILE*0.85, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4f93cf'; ctx.beginPath(); ctx.arc(cx, cy, TILE*0.7, 0, Math.PI*2); ctx.fill();       // 水
    ctx.lineWidth = 1.5;
    for(let k=0;k<3;k++){                                                                                  // 広がる波紋
      const f = (t*0.55 + k/3) % 1;
      ctx.strokeStyle = `rgba(255,255,255,${0.7*(1-f)})`; ctx.beginPath(); ctx.arc(cx, cy, 5*u + f*TILE*0.55, 0, Math.PI*2); ctx.stroke();
    }
    ctx.fillStyle = '#cfc8bc'; ctx.beginPath(); ctx.arc(cx, cy, 5*u, 0, Math.PI*2); ctx.fill();            // まん中の柱
    ctx.fillStyle = '#e9e4da'; ctx.beginPath(); ctx.arc(cx, cy, 3*u, 0, Math.PI*2); ctx.fill();
    for(let i=0;i<8;i++){                                                                                  // 吹き上がる水しぶき
      const a = i/8*Math.PI*2 + t*0.8, r = (0.4 + 0.6*((Math.sin(t*3+i*1.7)+1)/2)) * 9*u;
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r, cy+Math.sin(a)*r*0.7-2*u, 1.3, 0, Math.PI*2); ctx.fill();
    }
  }

  // ---- 建物 ----
  function drawPortBuilding(b, camX, camY){
    const u = TILE/16, x = (b.x-camX)*TILE, y = (b.y-camY)*TILE, W = b.w*TILE, H = b.h*TILE;
    if(x > VIEW_COLS*TILE+TILE || y > VIEW_ROWS*TILE+TILE || x+W < -TILE || y+H < -TILE) return;
    if(b.type==='lighthouse'){ drawLighthouse(x, y, W, H); return; }
    const P = BUILD_PALS[b.pal], roofH = b.roofRows*TILE, wallY = y+roofH, wallH = b.wallRows*TILE, rowTop = y+H-TILE;
    const shopLike = b.type==='shop' || b.type==='inn', dbl = b.type==='warehouse' || b.type==='hall';
    ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(x+3, y+H-2, W, 6);                          // 影
    ctx.fillStyle = P.wall; ctx.fillRect(x, wallY, W, wallH);                                    // 壁
    ctx.fillStyle = 'rgba(0,0,0,0.07)'; for(let ly=wallY+5*u; ly<y+H-3*u; ly+=5*u) ctx.fillRect(x, ly, W, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(x+W-2*u, wallY, 2*u, wallH);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x, y+H-3*u, W, 3*u);                        // 土台
    // 窓
    const glass = b.type==='inn' ? '#ffe39a' : '#a9d6f0';
    for(let r=0; r<b.wallRows; r++){
      const bottom = r===b.wallRows-1;
      for(let c=0; c<b.w; c++){
        if(bottom && (c===b.door || (dbl && c===b.door+1))) continue;
        if(bottom && b.type==='warehouse') continue;
        if(!bottom && (shopLike || b.type==='warehouse') && c===b.door) continue;                // 看板の場所
        if(!bottom && b.type==='hall' && (c===b.door || c===b.door+1)) continue;                 // 時計の場所
        const wx = x + c*TILE + 4*u, wy = wallY + r*TILE + (bottom && shopLike ? 8*u : 4*u), ww = 8*u, wh = 7*u;
        ctx.fillStyle = '#5a4030'; ctx.fillRect(wx-1, wy-1, ww+2, wh+2);
        ctx.fillStyle = glass; ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(wx+1, wy+1, ww*0.4, 2);
        ctx.fillStyle = '#5a4030'; ctx.fillRect(wx+ww/2-0.5, wy, 1, wh); ctx.fillRect(wx, wy+wh/2-0.5, ww, 1);
        if(bottom && b.type==='house'){                                                          // 窓辺の花
          ctx.fillStyle = '#7a5a3a'; ctx.fillRect(wx-1, wy+wh+1, ww+2, 3*u);
          for(let k=0;k<3;k++){ ctx.fillStyle = ['#e0506a','#f0c040','#e07ab0'][k]; ctx.fillRect(wx+k*3*u, wy+wh-0.5, 2*u, 2*u); }
        }
      }
    }
    // 屋根
    const rx = x-3, rw = W+6, ry = y-2, rh = roofH+5;
    ctx.fillStyle = P.roof; ctx.fillRect(rx, ry, rw, rh);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(rx, ry, rw, 3*u);
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(rx, ry+rh-3*u, rw, 3*u);
    ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1; ctx.beginPath();
    if(b.type==='warehouse'){ for(let lx=rx+4*u; lx<rx+rw; lx+=4*u){ ctx.moveTo(lx, ry); ctx.lineTo(lx, ry+rh); } }
    else {
      let row = 0;
      for(let ly=ry+4*u; ly<ry+rh-3*u; ly+=4*u, row++){
        ctx.moveTo(rx, ly); ctx.lineTo(rx+rw, ly);
        for(let lx=rx+(row%2 ? 3*u : 0); lx<rx+rw; lx+=6*u){ ctx.moveTo(lx, ly); ctx.lineTo(lx, ly+4*u); }
      }
    }
    ctx.stroke();
    if(b.chimney && b.roofRows>=2 && !dbl){                                                      // 煙突
      const cx2 = x + W*0.72;
      ctx.fillStyle = '#8a6a5a'; ctx.fillRect(cx2, y+2*u, 6*u, 9*u);
      ctx.fillStyle = '#3a2a24'; ctx.fillRect(cx2-1, y+1*u, 8*u, 2.5*u);
    }
    if(b.type==='hall'){                                                                         // 役場:時計と旗
      const cx2 = x + W/2, cy2 = wallY + 9*u;
      ctx.fillStyle = '#3a2a24'; ctx.beginPath(); ctx.arc(cx2, cy2, 8*u, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f6f1e6'; ctx.beginPath(); ctx.arc(cx2, cy2, 6.6*u, 0, Math.PI*2); ctx.fill();
      const tt = performance.now()/1000;
      ctx.strokeStyle = '#3a2a24'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2+Math.cos(tt*0.05)*4*u, cy2+Math.sin(tt*0.05)*4*u);
      ctx.moveTo(cx2, cy2); ctx.lineTo(cx2+Math.cos(tt*0.6)*5.5*u, cy2+Math.sin(tt*0.6)*5.5*u); ctx.stroke();
      ctx.fillStyle = '#5a4030'; ctx.fillRect(x+W/2-1, y-9*u, 2, 11*u);
      ctx.fillStyle = '#d9433a'; ctx.beginPath(); ctx.moveTo(x+W/2+1, y-9*u); ctx.lineTo(x+W/2+11*u, y-6*u); ctx.lineTo(x+W/2+1, y-3*u); ctx.closePath(); ctx.fill();
    }
    // 入口(戸・日よけ・看板)
    const dx = x + b.door*TILE;
    if(dbl){                                                                                     // 大きな観音開きの扉
      const dw = Math.min(2, b.w-b.door)*TILE;
      ctx.fillStyle = b.type==='hall' ? '#5a3a24' : '#8a5a34'; ctx.fillRect(dx+3*u, rowTop+1.5*u, dw-6*u, TILE-4.5*u);
      ctx.strokeStyle = 'rgba(30,18,8,0.75)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(dx+dw/2, rowTop+1.5*u); ctx.lineTo(dx+dw/2, y+H-3*u);
      if(b.type==='warehouse'){ ctx.moveTo(dx+3*u, rowTop+1.5*u); ctx.lineTo(dx+dw/2-1, y+H-3*u); ctx.moveTo(dx+dw/2-1, rowTop+1.5*u); ctx.lineTo(dx+3*u, y+H-3*u);
                                ctx.moveTo(dx+dw/2+1, rowTop+1.5*u); ctx.lineTo(dx+dw-3*u, y+H-3*u); ctx.moveTo(dx+dw-3*u, rowTop+1.5*u); ctx.lineTo(dx+dw/2+1, y+H-3*u); }
      ctx.stroke();
      ctx.fillStyle = '#b9b3a5'; ctx.fillRect(dx+2*u, y+H-3*u, dw-4*u, 3*u);
    } else {
      ctx.fillStyle = '#4a2a1a'; ctx.fillRect(dx+3*u, rowTop+3*u, 10*u, TILE-6*u);
      ctx.fillStyle = shopLike ? '#9fd0ee' : '#6b3f26'; ctx.fillRect(dx+4.5*u, rowTop+4.5*u, 7*u, shopLike ? 5*u : 4*u);
      ctx.fillStyle = '#f2c230'; ctx.fillRect(dx+10.5*u, rowTop+9.5*u, 1.4*u, 1.4*u);
      ctx.fillStyle = '#b9b3a5'; ctx.fillRect(dx+2*u, y+H-3*u, 12*u, 3*u);
    }
    if(shopLike){                                                                                // しましまの日よけ
      const A = AWNINGS[b.awn], y0 = rowTop+1*u; let k = 0;
      for(let sx=0; sx<W; sx+=4*u, k++){
        ctx.fillStyle = A[k%2]; ctx.fillRect(x+sx, y0, Math.min(4*u, W-sx), 5*u);
        ctx.beginPath(); ctx.arc(x+sx+2*u, y0+5*u, 2*u, 0, Math.PI); ctx.fill();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(x, y0+7*u, W, 2);
    }
    if(shopLike || b.type==='warehouse'){                                                        // 看板
      const sx3 = dx + (dbl ? TILE : TILE/2), sy3 = rowTop - 11*u;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx3-7*u+1, sy3+1, 14*u, 11*u);
      ctx.fillStyle = '#fff4d6'; ctx.fillRect(sx3-7*u, sy3, 14*u, 11*u);
      ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.5; ctx.strokeRect(sx3-7*u, sy3, 14*u, 11*u);
      ctx.save(); ctx.font = Math.round(9*u)+'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.emoji, sx3, sy3+6*u); ctx.restore();
    }
  }
  function drawLighthouse(x, y, W, H){
    const t = performance.now()/1000, u = TILE/16, cx = x+W/2;
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x+3, y+H-3, W, 7);
    const topW = W*0.5, botW = W*0.96, towerTop = y + H*0.22, towerBot = y+H-3;
    const wAt = yy => topW + (botW-topW)*((yy-towerTop)/(towerBot-towerTop));
    const N = 6, bh = (towerBot-towerTop)/N;
    for(let i=0;i<N;i++){                                                                         // 赤と白のしま
      const y0 = towerTop + i*bh, y1 = y0+bh, w0 = wAt(y0), w1 = wAt(y1);
      ctx.fillStyle = i%2===0 ? '#d9433a' : '#f6f1e6';
      ctx.beginPath(); ctx.moveTo(cx-w0/2,y0); ctx.lineTo(cx+w0/2,y0); ctx.lineTo(cx+w1/2,y1); ctx.lineTo(cx-w1/2,y1); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.moveTo(cx+wAt(towerTop)*0.15,towerTop); ctx.lineTo(cx+topW/2,towerTop); ctx.lineTo(cx+botW/2,towerBot); ctx.lineTo(cx+botW*0.15,towerBot); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a4650'; ctx.fillRect(cx-topW/2-3*u, towerTop-2*u, topW+6*u, 3*u);          // バルコニー
    ctx.fillStyle = `rgba(255,230,120,${0.30+0.22*Math.sin(t*2.2)})`; ctx.beginPath(); ctx.arc(cx, towerTop-7*u, 13*u, 0, Math.PI*2); ctx.fill();   // あかり
    ctx.fillStyle = '#ffe27a'; ctx.fillRect(cx-topW*0.32, towerTop-11*u, topW*0.64, 9*u);
    ctx.fillStyle = '#5a4030'; ctx.fillRect(cx-topW*0.32, towerTop-11*u, topW*0.64, 1.4*u); ctx.fillRect(cx-0.7, towerTop-11*u, 1.4, 9*u);
    ctx.fillStyle = '#3a3a44'; ctx.beginPath(); ctx.moveTo(cx-topW*0.42, towerTop-11*u); ctx.lineTo(cx, towerTop-19*u); ctx.lineTo(cx+topW*0.42, towerTop-11*u); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a2a24'; ctx.fillRect(cx-3*u, towerBot-9*u, 6*u, 9*u);                       // 扉
    ctx.fillStyle = '#5a4030'; ctx.fillRect(cx-1.5*u, towerTop+bh*1.6, 3*u, 4*u); ctx.fillRect(cx-1.5*u, towerTop+bh*3.4, 3*u, 4*u);   // 小窓
  }

  // ---- 船が停まる区画(空きの区画には点線と錨のしるし。船がいる区画には船) ----
  function hullPath(x,y,w,h){
    ctx.beginPath(); ctx.moveTo(x+w*0.1,y); ctx.lineTo(x+w*0.9,y); ctx.lineTo(x+w,y+h*0.5);
    ctx.quadraticCurveTo(x+w*0.94,y+h*0.86,x+w/2,y+h); ctx.quadraticCurveTo(x+w*0.06,y+h*0.86,x,y+h*0.5); ctx.closePath();
  }
  function drawBoat(kind, cx, top, t, ropeL, ropeR){
    const u = TILE/16, S = { row:[1.5,3.6], fishing:[2.5,5], sail:[2.3,5] }[kind], w = S[0]*TILE, h = S[1]*TILE;
    const x = cx - w/2 + Math.sin(t*1.5)*1.3, y = top + Math.sin(t*1.1)*1;
    ctx.strokeStyle = 'rgba(60,40,20,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath();                  // もやい綱
    if(ropeL!=null){ ctx.moveTo(x+2, y+h*0.2); ctx.lineTo(ropeL, y+h*0.12); ctx.moveTo(x+2, y+h*0.62); ctx.lineTo(ropeL, y+h*0.7); }
    if(ropeR!=null){ ctx.moveTo(x+w-2, y+h*0.2); ctx.lineTo(ropeR, y+h*0.12); ctx.moveTo(x+w-2, y+h*0.62); ctx.lineTo(ropeR, y+h*0.7); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; hullPath(x-3, y-2, w+6, h+6); ctx.fill();            // 船のまわりの波
    ctx.fillStyle = { row:'#a56b3a', fishing:'#c2402e', sail:'#3f6aa8' }[kind]; hullPath(x, y, w, h); ctx.fill();
    ctx.fillStyle = { row:'#c58a52', fishing:'#e8d8b0', sail:'#ece4cc' }[kind]; hullPath(x+w*0.14, y+h*0.05, w*0.72, h*0.8); ctx.fill();
    ctx.strokeStyle = 'rgba(40,25,10,0.7)'; ctx.lineWidth = 1.5; hullPath(x, y, w, h); ctx.stroke();
    if(kind==='row'){
      ctx.fillStyle = '#8a5a34'; ctx.fillRect(x+w*0.18, y+h*0.4, w*0.64, 3*u);
      ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x+2, y+h*0.45); ctx.lineTo(x-7*u, y+h*0.62); ctx.moveTo(x+w-2, y+h*0.45); ctx.lineTo(x+w+7*u, y+h*0.62); ctx.stroke();
    } else if(kind==='fishing'){
      ctx.fillStyle = '#f2eee0'; ctx.fillRect(x+w*0.24, y+h*0.12, w*0.52, h*0.27);                 // 船室
      ctx.fillStyle = '#8a2a1f'; ctx.fillRect(x+w*0.2, y+h*0.1, w*0.6, 4*u);
      ctx.fillStyle = '#7fb8d8'; ctx.fillRect(x+w*0.3, y+h*0.2, w*0.14, 5*u); ctx.fillRect(x+w*0.56, y+h*0.2, w*0.14, 5*u);
      ctx.fillStyle = '#8aa07a'; ctx.beginPath(); ctx.arc(x+w*0.5, y+h*0.62, 7*u, 0, Math.PI*2); ctx.fill();   // 網
      ctx.strokeStyle = 'rgba(40,60,30,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x+w*0.5-6*u, y+h*0.62); ctx.lineTo(x+w*0.5+6*u, y+h*0.62); ctx.moveTo(x+w*0.5, y+h*0.62-6*u); ctx.lineTo(x+w*0.5, y+h*0.62+6*u); ctx.stroke();
    } else {
      const mx = x+w*0.5, my = y+h*0.4;
      ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx, y+h*0.78); ctx.stroke();       // ブーム
      ctx.fillStyle = 'rgba(246,241,230,0.96)'; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(x+w*0.92, y+h*0.26);
      ctx.quadraticCurveTo(x+w*0.82, y+h*0.6, mx, y+h*0.78); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(80,60,40,0.5)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#6b4a2a'; ctx.beginPath(); ctx.arc(mx, my, 2.4*u, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#d9433a'; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx-7*u, my-3*u); ctx.lineTo(mx, my-4*u); ctx.closePath(); ctx.fill();   // 小さな旗
    }
  }
  function drawBerth(b, camX, camY, t){
    const bx = (b.x0-camX)*TILE, by = (b.y0-camY)*TILE, bw = (b.x1-b.x0+1)*TILE, bh = (b.y1-b.y0+1)*TILE;
    if(bx > VIEW_COLS*TILE+TILE || by > VIEW_ROWS*TILE+TILE || bx+bw < -TILE || by+bh < -TILE) return;
    const cx = bx + bw/2, top = by + TILE*0.55;
    if(b.boat){
      const ropeL = PORT_JETTIES.some(j=>j+2===b.x0) ? bx : null, ropeR = PORT_JETTIES.some(j=>j===b.x1+1) ? bx+bw : null;
      drawBoat(b.boat, cx, top, t+b.id, ropeL, ropeR);
    } else {
      const w = Math.min(bw - 1.4*TILE, 2.6*TILE), h = 4.6*TILE;
      ctx.save(); ctx.setLineDash([6,5]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; hullPath(cx-w/2, top, w, h); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.55 + 0.25*Math.sin(t*2 + b.id); ctx.font = Math.round(TILE*0.8)+'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⚓', cx, top + h*0.5); ctx.restore();
    }
  }
  function drawPortLayer(camX, camY){
    const t = performance.now()/1000;
    for(const b of PORT_BERTHS) drawBerth(b, camX, camY, t);
    for(const d of PORT_DECOR) drawPortDecor(d, camX, camY, t);
    for(const b of PORT_BUILDINGS) drawPortBuilding(b, camX, camY);
  }

  // ---- 町の人たち ----
  function drawPortPeople(camX, camY){
    const t = performance.now()/1000;
    const list = portPeople.slice().sort((a,b)=>a.y-b.y);
    for(const p of list){
      const sx = (p.x-camX)*TILE, sy = (p.y-camY)*TILE;
      if(sx < -TILE*2 || sy < -TILE*2 || sx > VIEW_COLS*TILE+TILE || sy > VIEW_ROWS*TILE+TILE) continue;
      const moving = p.walker && (p.vx || p.vy);
      const bob = moving ? Math.abs(Math.sin(t*9+p.phase))*1.6 : Math.sin(t*1.5+p.phase)*0.4;
      const sc = (TILE/16)*p.scale, off = (1-p.scale)*TILE, y0 = sy + off - bob;
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(sx+TILE/2, sy+TILE-3, TILE*0.26*p.scale, 3.5, 0, 0, Math.PI*2); ctx.fill();
      drawSprite(sx, y0, PERSON_SPRITE, p.pal, sc, p.face<0);
      if(p.kind==='sailor'){ ctx.fillStyle = '#f4f4f4'; ctx.fillRect(sx+5*sc, y0+1*sc, 6*sc, 2*sc); ctx.fillStyle = '#2b4f9a'; ctx.fillRect(sx+5*sc, y0+2.5*sc, 6*sc, 0.8*sc); }
      else if(p.kind==='merchant'){ ctx.fillStyle = '#f6f1e6'; ctx.fillRect(sx+6*sc, y0+9*sc, 4*sc, 4*sc); }
    }
  }
