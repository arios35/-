  function updateEnemies(dt){
    if(state.map!=='dungeon') return;
    updateWaves(dt);
    updateBossFx(dt);
    for(const e of enemies.slice()){
      if(e.dead) continue;
      e.hurt = Math.max(0, e.hurt - dt);
      if(e.burnT>0){                                              // burning (fire enchantment)
        e.burnT -= dt; e.burnAcc = (e.burnAcc||0) + dt;
        if(e.burnAcc>=0.5){
          e.burnAcc -= 0.5;
          damageEnemy(e, e.burnDps*0.5, 0, 0, 0, true);
          if(e.dead) continue;
          if(e.burnSpread){
            for(const o of enemies){
              if(!o.dead && o!==e && !(o.burnT>0) && Math.hypot(o.x-e.x, o.y-e.y)<1.6 && Math.random()<0.35) igniteEnemy(o, e.burnDps*0.8, 2.5, true);
            }
          }
        }
      }
      if(e.boss){ updateBoss(e, dt); if(state.map!=='dungeon') return; continue; }   // bosses run their own pattern (no stun)
      if(e.stun>0){ e.stun -= dt; continue; }                     // knocked out for a moment
      const def = ENEMY_DEFS[e.kind];
      const dx = state.px - e.x, dy = state.py - e.y, dist = Math.hypot(dx,dy);
      const speed = def.speed, chasing = dist < def.chase;
      if(chasing){ e.vx = dx/(dist||1)*speed; e.vy = dy/(dist||1)*speed; }
      else {
        e.t -= dt;
        if(e.t<=0){
          e.t = (e.kind==='bat' ? 0.4 : 1) + Math.random()*1.5;
          if(Math.random()<0.35){ e.vx = 0; e.vy = 0; }
          else { const a = Math.random()*Math.PI*2; e.vx = Math.cos(a)*speed*0.6; e.vy = Math.sin(a)*speed*0.6; }
        }
      }
      if(e.vx) e.face = e.vx>0 ? 1 : -1;
      if(def.phase){                                              // ghosts ignore walls
        e.x = Math.min(COLS-3, Math.max(2, e.x + e.vx*dt));
        e.y = Math.min(ROWS-3, Math.max(2, e.y + e.vy*dt));
      } else {
        const nx = e.x + e.vx*dt; if(!collides(nx,e.y)) e.x = nx; else if(!chasing) e.t = 0;
        const ny = e.y + e.vy*dt; if(!collides(e.x,ny)) e.y = ny; else if(!chasing) e.t = 0;
      }
      if(dist < e.r && invuln<=0){ hurtPlayer(dx,dy); if(state.map!=='dungeon') return; }
    }
    flushKills();
  }
  function hurtPlayer(dx,dy){
    if(deathPending) return;
    state.hp = Math.max(0, state.hp - 1);   // 1 = half a heart
    invuln = 1.0;
    const np = nudgePos(state.px, state.py, dx, dy, 0.8);
    state.px = np[0]; state.py = np[1];
    if(state.hp<=0){ openDeath(); return; }
    setMsg('攻撃を受けた!');
    save();
  }
  // Out of hearts: pay 1000G to get back up on the spot, or give up and lose everything you carry
  const REVIVE_COST = 1000;
  function openDeath(){
    deathPending = true;
    document.getElementById('deathInfo').textContent = state.gold>=REVIVE_COST ? `所持金: ${state.gold}G` : `お金が足りないよ(${REVIVE_COST}G必要・所持金 ${state.gold}G)`;
    document.getElementById('deathModal').classList.add('open');
  }
  document.getElementById('doRevive').onclick = ()=>{
    if(state.gold<REVIVE_COST){ document.getElementById('deathInfo').textContent = `お金が足りないよ(${REVIVE_COST}G必要・所持金 ${state.gold}G)`; return; }
    state.gold -= REVIVE_COST; state.hp = 10; invuln = 3; deathPending = false;
    document.getElementById('deathModal').classList.remove('open');
    updateHud(); save();
    setMsg(`${REVIVE_COST}Gを払って復活した!`);
  };
  document.getElementById('giveUp').onclick = ()=>{
    deathPending = false;
    document.getElementById('deathModal').classList.remove('open');
    playerDied();
  };
  function playerDied(){
    state.gold = 0;
    for(const k of ['eggs','wood','mikan','stone','iron','milk','goldOre','wool','mushroom']) state[k] = 0;
    for(const k of Object.keys(state.harvestedByType)) state.harvestedByType[k] = 0;
    for(const k of Object.keys(state.fish)) state.fish[k] = 0;
    state.hp = 10; invuln = 0;
    goMap('cave');
    updateHud(); save();
    setMsg('力尽きた…手荷物とお金を全部失った(家に預けたものは無事)');
  }
  // Moving between floors (fromAbove: arrived by the stairs down; otherwise came back up from below)
  function changeFloor(n, fromAbove){
    state.floor = n; buildFloor(n);
    enemies = []; waves = []; bossShots = []; hazards = []; invuln = 0;
    if(fromAbove){ state.px = DUNGEON_START.spawnX; state.py = DUNGEON_START.spawnY; }
    else { state.px = DUNGEON_STAIRS.spawnX; state.py = DUNGEON_STAIRS.spawnY; }
    state.dir = 'down';
    spawnEnemies();
    updateMapName();
    fadeStart = performance.now();
    const bossHere = BOSS_FLOORS[n] && !bossDefeated(n);
    setMsg(bossHere ? `地下${n}階…強い気配がする…!` : `地下${n}階`);
    save();
  }
  // Choosing where to start when going down from the cave (boss floors are checkpoints)
  // Pay 500G to get back to the cave from anywhere in the dungeon
  const RETURN_COST = 500;
  function openReturn(){
    if(state.map!=='dungeon') return;
    document.getElementById('returnInfo').textContent = `所持金: ${state.gold}G`;
    document.getElementById('returnModal').classList.add('open');
  }
  document.getElementById('closeReturn').onclick = ()=>document.getElementById('returnModal').classList.remove('open');
  document.getElementById('doReturn').onclick = ()=>{
    if(state.gold<RETURN_COST){ document.getElementById('returnInfo').textContent = `お金が足りないよ(${RETURN_COST}G必要)`; return; }
    state.gold -= RETURN_COST;
    document.getElementById('returnModal').classList.remove('open');
    goMap('cave');
    updateHud(); save();
    setMsg(`${RETURN_COST}Gを払って洞窟に帰還した`);
  };
  document.getElementById('btnReturn').addEventListener('pointerdown', (e)=>{ e.preventDefault(); openReturn(); });
  function startDungeon(f){
    document.getElementById('floorModal').classList.remove('open');
    state.floor = f; goMap('dungeon');
  }
  function openFloorSelect(){
    const opts = [1];
    for(const b of [3,6,9,12]) if(state.bossBeaten && state.bossBeaten[b]) opts.push(b+1);
    if(opts.length===1){ startDungeon(1); return; }
    const list = document.getElementById('floorList'); list.innerHTML = '';
    for(const f of opts){
      const row = document.createElement('div'); row.className = 'shop-item';
      const span = document.createElement('span'); span.textContent = `地下${f}階から` + (f===1 ? '(最初から)' : '');
      const b = document.createElement('button'); b.textContent = '降りる'; b.onclick = ()=>startDungeon(f);
      row.appendChild(span); row.appendChild(b); list.appendChild(row);
    }
    document.getElementById('floorModal').classList.add('open');
  }
  document.getElementById('closeFloor').onclick = ()=>document.getElementById('floorModal').classList.remove('open');

  function attackAction(){
    if(!state.sword){ setMsg('剣がない!作業台で作ろう⚔️'); return; }
    if(atkCool>0) return;
    const lv = state.swordLevel||1, en = state.enchant || {};
    atkCool = SWORD_CD[lv-1];
    triggerActionAnim('sword');
    const dmg = SWORD_DMG[lv-1], reach = 1.05 + 0.08*(lv-1);
    const fx = state.dir==='left'?-1:state.dir==='right'?1:0;
    const fy = state.dir==='up'?-1:state.dir==='down'?1:0;
    const cx = state.px + fx*0.75, cy = state.py + fy*0.75;
    const kl = en.knock||0, fl = en.fire||0, wl = en.wave||0;
    for(const e of enemies.slice()){
      if(e.dead) continue;
      if(Math.hypot(e.x-cx, e.y-cy) > reach + (e.r-0.72)) continue;
      damageEnemy(e, dmg, e.x-state.px, e.y-state.py, KNOCK_DIST[kl]);
      if(e.dead) continue;
      if(kl && !e.boss) e.stun = Math.max(e.stun||0, KNOCK_STUN[kl]);   // bosses can't be stunned
      if(fl) igniteEnemy(e, FIRE_DPS[fl], FIRE_DUR[fl], fl>=3);
    }
    if(wl){
      waves.push({ x:state.px+fx*0.7, y:state.py+fy*0.7, dx:fx, dy:fy, dmg:Math.max(1, Math.round(dmg*WAVE_FACTOR[wl])),
                   left:WAVE_RANGE[wl], range:WAVE_RANGE[wl], hit:new Set() });
    }
    flushKills();
  }
