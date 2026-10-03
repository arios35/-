  // ---- Wells: fast travel between wells (unlock once for 2000G) ----
  const WELLS = { home:{x:14,y:11}, north:{x:15,y:12}, river:{x:6,y:20}, cave:CAVE_WELL };
  const WELL_COST = 2000;
  const IN_HOP = 0.4, IN_SINK = 0.55, IN_FADE = 0.3, OUT_RISE = 0.5, OUT_HOP = 0.4, OUT_FADE = 0.3;
  let wellAnim = null;        // the jump-in / climb-out cutscene
  let curWell = null;         // the well the player is standing next to
  function renderWell(msg){
    const list = document.getElementById('wellList'); list.innerHTML = '';
    const desc = document.getElementById('wellDesc'), here = state.map;
    if(!state.wells[here]){
      desc.textContent = `この井戸に${WELL_COST}Gを払うと解放されて、解放ずみの他の井戸と行き来できるようになります。`;
      const row = document.createElement('div'); row.className = 'shop-item';
      const span = document.createElement('span'); span.textContent = `この井戸を解放 ${WELL_COST}G`;
      const b = document.createElement('button'); b.textContent = '払う'; b.onclick = payWell;
      row.appendChild(span); row.appendChild(b); list.appendChild(row);
    } else {
      desc.textContent = '行き先を選ぶと、井戸に飛び込みます。行き先の井戸は、先に行って解放しておく必要があります。';
      for(const name of Object.keys(WELLS)){
        if(name===here) continue;
        const row = document.createElement('div'); row.className = 'shop-item';
        const span = document.createElement('span'); span.textContent = `${MAP_NAMES[name]}の井戸`;
        row.appendChild(span);
        if(state.wells[name]){
          const b = document.createElement('button'); b.textContent = '行く'; b.onclick = ()=>startWellTravel(name);
          row.appendChild(b);
        } else {
          const tag = document.createElement('small'); tag.textContent = '未解放'; row.appendChild(tag);
        }
        list.appendChild(row);
      }
    }
    document.getElementById('wellInfo').textContent = msg || `所持金: ${state.gold}G`;
  }
  function openWell(){
    curWell = findNear('k');
    if(!curWell) return;
    document.getElementById('wellModal').classList.add('open'); renderWell();
  }
  function payWell(){
    if(state.wells[state.map]) return;
    if(state.gold<WELL_COST){ renderWell(`お金が足りないよ(あと${WELL_COST-state.gold}G)`); return; }
    state.gold -= WELL_COST; state.wells[state.map] = true; updateHud(); save();
    renderWell('この井戸を解放した!');
  }
  document.getElementById('closeWell').onclick = ()=>document.getElementById('wellModal').classList.remove('open');
  function startWellTravel(dest){
    if(!state.wells[state.map] || !state.wells[dest] || !curWell || wellAnim || !WELLS[dest]) return;
    document.getElementById('wellModal').classList.remove('open');
    wellAnim = { phase:'in', t:0, dest, sx:state.px, sy:state.py, wx:curWell[0], wy:curWell[1], splashed:false };
  }
  function warpToWell(name){
    state.map = name; setMapSize(name); curLayout = MAP_LAYOUTS[name];
    enemies = []; waves = []; bossShots = []; hazards = []; invuln = 0; atkCool = 0;
    effects = []; actionAnim = null; fishing.phase = 'idle';
    const w = WELLS[name];
    let land = [w.x, w.y+1];
    for(const d of [[0,1],[1,0],[-1,0],[0,-1]]){
      const x = w.x+d[0], y = w.y+d[1];
      const tt = tileAt(x,y);
      if(x>=0 && y>=0 && x<COLS && y<ROWS && !SOLID.has(tt) && !'HKLuvUVXQ'.includes(tt)){ land = [x,y]; break; }
    }
    state.px = land[0]; state.py = land[1]; state.dir = 'down';
    updateMapName();
    setMsg(`${MAP_NAMES[name]}の井戸から出てきた`);
    save();
  }
  function updateWell(dt){
    const a = wellAnim; a.t += dt;
    if(a.phase==='in'){
      if(!a.splashed && a.t >= IN_HOP){ a.splashed = true; addEffect(a.wx, a.wy, 'water'); }
      if(a.t >= IN_HOP + IN_SINK + IN_FADE){                          // the screen is black: pop out of the other well
        warpToWell(a.dest);
        const w = WELLS[a.dest];
        wellAnim = { phase:'out', t:0, wx:w.x, wy:w.y, lx:state.px, ly:state.py, splashed:false, landed:false };
      }
    } else {
      if(!a.splashed && a.t >= 0.12){ a.splashed = true; addEffect(a.wx, a.wy, 'water'); }
      if(!a.landed && a.t >= OUT_RISE + OUT_HOP){ a.landed = true; addEffect(a.lx, a.ly, 'water'); }
      if(a.t >= OUT_RISE + OUT_HOP + 0.05) wellAnim = null;
    }
  }
  function wellFadeAlpha(){
    if(!wellAnim) return 0;
    const a = wellAnim;
    if(a.phase==='in') return Math.max(0, Math.min(1, (a.t - (IN_HOP + IN_SINK*0.6)) / (IN_SINK*0.4 + IN_FADE)));
    return Math.max(0, Math.min(1, 1 - a.t/OUT_FADE));
  }
  // The jump: hop onto the rim, sink behind the front wall (clipped at the rim); coming out is the reverse
  function drawPlayerWell(camX, camY){
    const a = wellAnim, scale = TILE/16, u = TILE/16;
    const ease = q=> q<=0 ? 0 : q>=1 ? 1 : q*q*(3-2*q);
    const Y0 = a.wy - 0.4625;                       // sprite top that puts the feet on the water line
    let X, Y, clip = false, shadow = true;
    if(a.phase==='in'){
      if(a.t < IN_HOP){
        const q = a.t/IN_HOP, e = ease(q);
        X = a.sx + (a.wx-a.sx)*e; Y = a.sy + (Y0-a.sy)*e - Math.sin(q*Math.PI)*0.45;
      } else {
        const q = Math.min(1, (a.t-IN_HOP)/IN_SINK);
        X = a.wx; Y = Y0 + ease(q)*1.1; clip = true; shadow = false;
      }
    } else if(a.t < OUT_RISE){
      const q = a.t/OUT_RISE;
      X = a.wx; Y = Y0 + (1-ease(q))*1.1; clip = true; shadow = false;
    } else {
      const q = Math.min(1, (a.t-OUT_RISE)/OUT_HOP), e = ease(q);
      X = a.wx + (a.lx-a.wx)*e; Y = Y0 + (a.ly-Y0)*e - Math.sin(q*Math.PI)*0.6;
    }
    const px = (X-camX)*TILE, py = (Y-camY)*TILE;
    if(shadow){
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(px+TILE/2, py+TILE-3, TILE*0.26, 3.5, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.save();
    if(clip){
      const rim = (a.wy-camY)*TILE + 8.5*u;
      ctx.beginPath(); ctx.rect((a.wx-camX)*TILE - TILE, -10000, TILE*3, rim + 10000); ctx.clip();
    }
    drawSprite(px, py, BOY_FRONT, PLAYER_PALETTE, scale, false);
    ctx.restore();
  }
