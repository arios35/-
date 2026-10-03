  // ---- Fishing (only on the pier in the river area) ----
  const FISH = {
    minnow:  { label:'小魚',   emoji:'🐟', price:15,  w:55 },
    ayu:     { label:'アユ',   emoji:'🐟', price:35,  w:28 },
    carp:    { label:'コイ',   emoji:'🐠', price:60,  w:12 },
    yamame:  { label:'ヤマメ', emoji:'🐡', price:90,  w:4 },
    catfish: { label:'大ナマズ', emoji:'🐋', price:200, w:1 },
  };
  const fishing = { phase:'idle', t:0, bx:0, by:0 };
  function fishCount(){ return Object.values(state.fish).reduce((a,b)=>a+b,0); }
  function fishTarget(){
    const fdx = state.dir==='left'?-1:state.dir==='right'?1:0;
    const fdy = state.dir==='up'?-1:state.dir==='down'?1:0;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort((a,b)=>(b[0]*fdx+b[1]*fdy)-(a[0]*fdx+a[1]*fdy));
    const tx = tileX(), ty = tileY();
    for(const [dx,dy] of dirs) for(let d=1;d<=3;d++){
      if(tileAt(tx+dx*d,ty+dy*d)==='7') return [tx+dx*d, ty+dy*d];
    }
    return null;
  }
  function pickFish(){
    const keys = Object.keys(FISH);
    const lv = state.rodLevel||1, east = state.map==='river' && state.px>=32;   // the east lake has rarer fish
    const mul = { carp: east?1.15:1, yamame:(1+0.5*(lv-1))*(east?1.3:1), catfish:(1+0.8*(lv-1))*(east?1.4:1) };
    const w = k=>FISH[k].w*(mul[k]||1);
    let r = Math.random()*keys.reduce((a,k)=>a+w(k),0);
    for(const k of keys){ r -= w(k); if(r<=0) return k; }
    return keys[0];
  }
  function fishAction(){
    if(fishing.phase==='idle'){
      const tg = fishTarget();
      if(!tg){ setMsg('水面が近くにないよ'); return; }
      fishing.phase = 'wait'; fishing.t = Math.max(0.8, 1.5 - 0.3*((state.rodLevel||1)-1) + Math.random()*3); fishing.bx = tg[0]; fishing.by = tg[1];
      setMsg('釣り糸をたらした…🎣 「❗」が出たらアクション!');
    } else if(fishing.phase==='wait'){
      fishing.phase = 'idle';
      setMsg('早すぎた!逃げられちゃった');
    } else {
      const k = pickFish(), f = FISH[k];
      state.fish[k] = (state.fish[k]||0) + 1;
      addEffect(fishing.bx, fishing.by, 'water');
      fishing.phase = 'idle';
      setMsg(`${f.emoji} ${f.label}が釣れた!(${f.price}G)`);
      updateHud(); save();
    }
  }
  function updateFishing(dt){
    if(fishing.phase==='idle') return;
    if(tileAt(tileX(),tileY())!=='F'){ fishing.phase = 'idle'; return; }
    fishing.t -= dt;
    if(fishing.t<=0){
      if(fishing.phase==='wait'){ fishing.phase = 'bite'; fishing.t = 1.1 + 0.25*((state.rodLevel||1)-1); setMsg('❗ 引いてる!今すぐアクション!'); }
      else { fishing.phase = 'idle'; setMsg('逃げられた…'); }
    }
  }
  function drawFishing(camX,camY){
    if(fishing.phase==='idle') return;
    const sx = (state.px+0.5-camX)*TILE, sy = (state.py+0.4-camY)*TILE;
    const bite = fishing.phase==='bite';
    const bx = (fishing.bx+0.5-camX)*TILE;
    const by = (fishing.by+0.5-camY)*TILE + (bite ? 3+Math.sin(performance.now()/50)*2.5 : Math.sin(performance.now()/300)*1.5);
    const tipX = sx + (bx-sx)*0.3, tipY = sy - 14;
    ctx.lineWidth = 2; ctx.strokeStyle = '#6b4a2a';
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(tipX,tipY); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.moveTo(tipX,tipY); ctx.lineTo(bx,by); ctx.stroke();
    ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.arc(bx,by,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(bx-3.5,by-0.5,7,1.5);
    if(bite){ ctx.font = Math.round(TILE*0.7)+'px sans-serif'; ctx.fillText('❗', sx-TILE*0.2, (state.py-camY)*TILE-6); }
  }

  // ---- Fishing spot marker: a rod leaning on the pier entrance + bobbing icon ----
  function drawFishingSpot(camX, camY){
    if(state.map !== 'river') return;
    const u = TILE/16;
    for(const [tx,ty] of FISH_SPOTS){
      const px = (tx-camX)*TILE, py = (ty-camY)*TILE; // pier entrance tile
      if(px<-TILE*2 || py<-TILE*2 || px>VIEW_COLS*TILE+TILE || py>VIEW_ROWS*TILE+TILE) continue;
      ctx.lineWidth = 2; ctx.strokeStyle = '#6b4a2a';
      ctx.beginPath(); ctx.moveTo(px+13*u, py+15*u); ctx.lineTo(px+21*u, py+2*u); ctx.stroke();
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.moveTo(px+21*u, py+2*u); ctx.lineTo(px+21*u, py+9*u); ctx.stroke();
      ctx.fillStyle = '#e04a3a';
      ctx.beginPath(); ctx.arc(px+21*u, py+9*u, 2.5, 0, Math.PI*2); ctx.fill();
      const bob = Math.sin(performance.now()/350) * 3;
      ctx.font = Math.round(TILE*0.8) + 'px sans-serif';
      ctx.fillText('🎣', px + TILE*0.1, py - TILE*0.3 + bob);
    }
  }
