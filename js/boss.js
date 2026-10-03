  // ---- Boss fights ----
  let bossShots = [], hazards = [];
  const inRect = (x,y)=> DUNGEON_ARENA.active && x>=DUNGEON_ARENA.x0+0.2 && x<=DUNGEON_ARENA.x0+DUNGEON_ARENA.w-1.2 && y>=DUNGEON_ARENA.y0+0.2 && y<=DUNGEON_ARENA.y0+DUNGEON_ARENA.h-1.2;
  function pickBossAttack(e){
    const B = BOSS_FLOORS[state.floor||1];
    let pool = B.atks.concat(e.p2 ? B.atks2 : []);
    pool = pool.filter(a=>!(a.t==='summon' && enemies.filter(x=>!x.boss).length>=4));
    const other = pool.filter(a=>a.t!==e.lastT);          // never the same attack twice in a row
    if(other.length) pool = other;
    const c = pool[Math.floor(Math.random()*pool.length)];
    return Object.assign({}, ATTACK_DEFS[c.t], c);
  }
  function bossStep(e, vx, vy, dt){
    if(ENEMY_DEFS[e.kind].phase){                          // the ghost lord floats through pillars
      e.x = Math.min(DUNGEON_ARENA.x0+DUNGEON_ARENA.w-1, Math.max(DUNGEON_ARENA.x0, e.x + vx*dt));
      e.y = Math.min(DUNGEON_ARENA.y0+DUNGEON_ARENA.h-1, Math.max(DUNGEON_ARENA.y0, e.y + vy*dt));
      return true;
    }
    let moved = false;
    const nx = e.x + vx*dt; if(!collides(nx,e.y)){ e.x = nx; moved = true; }
    const ny = e.y + vy*dt; if(!collides(e.x,ny)){ e.y = ny; moved = true; }
    return moved;
  }
  function addHazard(x,y,r,delay){ hazards.push({ x, y, r, t:delay, delay, done:false, fx:0 }); }
  function fireShot(x,y,ang,speed,color){
    bossShots.push({ x, y, vx:Math.cos(ang)*speed, vy:Math.sin(ang)*speed, life:4, r:0.28, color });
  }
  function startWind(e, a){
    e.atk = a; e.st = 'wind'; e.stT = a.wind*(e.p2 ? 0.8 : 1); e.lastT = a.t;
    const cx = e.x+0.5, cy = e.y+0.5, pxc = state.px+0.5, pyc = state.py+0.5, d = Math.hypot(pxc-cx, pyc-cy) || 1;
    e.dashDx = (pxc-cx)/d; e.dashDy = (pyc-cy)/d;
    if(a.t==='leap'){
      e.leapFrom = { x:e.x, y:e.y }; e.leapTo = { x:state.px, y:state.py };
      addHazard(pxc, pyc, a.radius, e.stT + a.air);          // landing zone is shown from the start of the wind-up
    } else if(a.t==='ring'){
      addHazard(cx, cy, a.radius, e.stT);
    }
  }
  function beginAct(e, a){
    e.st = 'act';
    const B = BOSS_FLOORS[state.floor||1], cx = e.x+0.5, cy = e.y+0.5, pxc = state.px+0.5, pyc = state.py+0.5;
    if(a.t==='dash'){ e.stT = a.dur; return; }
    if(a.t==='leap'){ e.stT = a.air; e.leapT0 = a.air; return; }
    e.stT = 0.12;
    if(a.t==='fan'){
      const base = Math.atan2(pyc-cy, pxc-cx);
      for(let i=0;i<a.count;i++) fireShot(cx, cy, base + (a.count>1 ? (i/(a.count-1)-0.5)*a.spread : 0), a.speed, B.shot);
    } else if(a.t==='nova'){
      const r0 = Math.random()*Math.PI*2;
      for(let i=0;i<a.count;i++) fireShot(cx, cy, r0 + i*Math.PI*2/a.count, a.speed, B.shot);
    } else if(a.t==='rain'){
      const ar = DUNGEON_ARENA;
      for(let i=0;i<a.count;i++){
        let hx = pxc, hy = pyc;
        if(i>0){ const ang = Math.random()*Math.PI*2, rr = 0.8 + Math.random()*4.2; hx += Math.cos(ang)*rr; hy += Math.sin(ang)*rr; }
        hx = Math.min(ar.x0+ar.w-0.5, Math.max(ar.x0+0.5, hx)); hy = Math.min(ar.y0+ar.h-0.5, Math.max(ar.y0+0.5, hy));
        addHazard(hx, hy, a.radius, a.delay + i*0.1);        // the boss is open while these fall
      }
    } else if(a.t==='summon'){
      summonMinions(e, a.count);
    } else if(a.t==='teleport'){
      for(let k=0;k<14;k++){
        const ang = Math.random()*Math.PI*2, rr = 2.8 + Math.random()*1.6;
        const nx = state.px + Math.cos(ang)*rr, ny = state.py + Math.sin(ang)*rr;
        if(inRect(nx,ny)){ e.x = nx; e.y = ny; break; }
      }
    }
  }
  function updateBoss(e, dt){
    const cx = e.x+0.5, cy = e.y+0.5;
    const dx = state.px+0.5-cx, dy = state.py+0.5-cy, dist = Math.hypot(dx,dy) || 0.001;
    if(!e.p2 && e.hp<=e.maxhp/2 && e.st!=='intro'){               // second phase: angrier, more attacks, faster
      e.p2 = true; e.st = 'recover'; e.stT = 1.4; e.atk = null; e.z = 0;
      setMsg(`${e.name}が怒った!`);
    }
    e.stT -= dt;
    const spd = e.speed * (e.p2 ? 1.25 : 1);
    if(e.st==='intro'){
      if(e.stT<=0){ e.st = 'move'; e.stT = 0.6; }
    } else if(e.st==='move'){
      if(dist>2.2) bossStep(e, dx/dist*spd, dy/dist*spd, dt);
      if(e.stT<=0) startWind(e, pickBossAttack(e));
    } else if(e.st==='wind'){
      if(e.atk.t==='dash' && e.stT>0.3){ e.dashDx = dx/dist; e.dashDy = dy/dist; }   // aim freezes just before the charge
      if(e.stT<=0) beginAct(e, e.atk);
    } else if(e.st==='act'){
      const a = e.atk;
      if(a.t==='dash'){
        const sp = a.speed * (e.p2 ? 1.1 : 1);
        if(!bossStep(e, e.dashDx*sp, e.dashDy*sp, dt)) e.stT = 0;                    // hit a wall/pillar
      } else if(a.t==='leap'){
        const p = Math.min(1, 1 - Math.max(0, e.stT)/e.leapT0);
        e.x = e.leapFrom.x + (e.leapTo.x-e.leapFrom.x)*p; e.y = e.leapFrom.y + (e.leapTo.y-e.leapFrom.y)*p;
        e.z = Math.sin(p*Math.PI)*1.5;
      }
      if(e.stT<=0){
        if(a.t==='leap'){ e.x = e.leapTo.x; e.y = e.leapTo.y; e.z = 0; }
        e.st = 'recover'; e.stT = a.recover * (e.p2 ? 0.85 : 1);                     // the opening
      }
    } else if(e.st==='recover'){
      if(e.stT<=0){
        e.st = 'move';
        e.stT = (e.atk && e.atk.chain) ? 0.05 : (e.p2 ? 0.5 + Math.random()*0.6 : 0.9 + Math.random()*0.8);
      }
    }
    e.face = dx>=0 ? 1 : -1;
    if(e.st!=='recover' && e.st!=='intro' && !(e.z>0.3) && dist<e.r && invuln<=0) hurtPlayer(dx,dy);   // body contact (not while dizzy)
  }
  function updateBossFx(dt){
    for(let i=bossShots.length-1;i>=0;i--){
      const sh = bossShots[i];
      sh.x += sh.vx*dt; sh.y += sh.vy*dt; sh.life -= dt;
      if(sh.life<=0 || SOLID.has(tileAt(Math.floor(sh.x), Math.floor(sh.y)))){ bossShots.splice(i,1); continue; }
      const ddx = state.px+0.5-sh.x, ddy = state.py+0.5-sh.y;
      if(invuln<=0 && Math.hypot(ddx,ddy) < sh.r + 0.32){
        bossShots.splice(i,1);
        hurtPlayer(ddx,ddy);
        if(state.map!=='dungeon') return;
      }
    }
    for(let i=hazards.length-1;i>=0;i--){
      const h = hazards[i];
      if(!h.done){
        h.t -= dt;
        if(h.t<=0){
          h.done = true; h.fx = 0.35;
          const ddx = state.px+0.5-h.x, ddy = state.py+0.5-h.y;
          if(invuln<=0 && Math.hypot(ddx,ddy) < h.r + 0.25){ hurtPlayer(ddx,ddy); if(state.map!=='dungeon') return; }
        }
      } else { h.fx -= dt; if(h.fx<=0) hazards.splice(i,1); }
    }
  }
  function drawBossGround(camX, camY){
    const t = performance.now()/1000;
    for(const e of enemies){
      if(!e.boss || e.st!=='wind' || !e.atk) continue;
      const a = e.atk, cx = (e.x+0.5-camX)*TILE, cy = (e.y+0.5-camY)*TILE;
      if(a.t==='dash'){
        const L = a.speed*a.dur*TILE, w = e.r*TILE*1.6;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.atan2(e.dashDy, e.dashDx));
        ctx.fillStyle = `rgba(255,60,50,${0.18+0.12*Math.sin(t*16)})`; ctx.fillRect(0, -w/2, L, w);
        ctx.strokeStyle = 'rgba(255,110,80,0.85)'; ctx.lineWidth = 2; ctx.strokeRect(0, -w/2, L, w);
        ctx.restore();
      } else if(a.t==='fan'){
        const base = Math.atan2(state.py-e.y, state.px-e.x);
        ctx.save(); ctx.strokeStyle = 'rgba(255,110,80,0.4)'; ctx.lineWidth = 1.5;
        for(let i=0;i<a.count;i++){
          const ang = base + (a.count>1 ? (i/(a.count-1)-0.5)*a.spread : 0);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx+Math.cos(ang)*6*TILE, cy+Math.sin(ang)*6*TILE); ctx.stroke();
        }
        ctx.restore();
      }
    }
    for(const h of hazards){
      const hx = (h.x-camX)*TILE, hy = (h.y-camY)*TILE, r = h.r*TILE;
      if(!h.done){
        const prog = 1 - Math.max(0, h.t)/h.delay;
        ctx.fillStyle = 'rgba(255,60,50,0.16)'; ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = `rgba(255,90,60,${0.15+0.3*prog})`; ctx.beginPath(); ctx.arc(hx, hy, r*prog, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,110,80,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI*2); ctx.stroke();
      } else {
        const f = Math.max(0, h.fx)/0.35;
        ctx.fillStyle = `rgba(255,225,130,${0.6*f})`; ctx.beginPath(); ctx.arc(hx, hy, r*(1+(1-f)*0.15), 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${0.9*f})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI*2); ctx.stroke();
      }
    }
  }
  function drawBossShots(camX, camY){
    for(const sh of bossShots){
      const x = (sh.x-camX)*TILE, y = (sh.y-camY)*TILE;
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = sh.color; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(x-1.5, y-1.5, 2, 0, Math.PI*2); ctx.fill();
    }
  }
