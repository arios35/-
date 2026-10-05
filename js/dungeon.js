  // ---- Map name label (HTML, under the instructions) ----
  const MAP_NAMES = { home:'🏡 のんびり村', north:'⛰️ 北の山', river:'🏞️ 川の国', coast:'🏖️ 南の海岸', cave:'🕳️ 洞窟', dungeon:'⚔️ 地下ダンジョン' };
  function updateMapName(){
    document.getElementById('mapName').textContent = (MAP_NAMES[state.map] || '') + (state.map==='dungeon' ? ` 地下${state.floor||1}階` : '');
    document.getElementById('btnReturn').style.display = state.map==='dungeon' ? '' : 'none';
    resizeCanvas();                                                    // 帰還ボタンの出し入れで、画面の高さを合わせ直す
  }

  // ---- Dungeon: 15 floors, enemies, bosses, sword, life ----
  let enemies = [];
  let invuln = 0, atkCool = 0, stairLock = false, stairHold = 0, deathPending = false;
  const ENEMY_DEFS = {
    slime:    { name:'スライム',   hp:2,  speed:1.4, chase:4.5 },
    bat:      { name:'コウモリ',   hp:1,  speed:2.3, chase:4.5 },
    skeleton: { name:'スケルトン', hp:5,  speed:1.6, chase:5 },
    ghost:    { name:'ゴースト',   hp:4,  speed:1.3, chase:5.5, phase:true },   // floats through walls
    goblin:   { name:'ゴブリン',   hp:8,  speed:2.0, chase:5.5 },
    orc:      { name:'オーク',     hp:12, speed:1.5, chase:5 },
    golem:    { name:'ゴーレム',   hp:20, speed:1.1, chase:5 },
    scorpion: { name:'サソリ',     hp:14, speed:2.2, chase:5.5 },
    demon:    { name:'デーモン',   hp:28, speed:1.9, chase:6 },
    dragon:   { name:'ドラゴン',   hp:40, speed:1.6, chase:6 },
  };
  const TIER_KINDS = { 1:['slime','bat'], 2:['skeleton','ghost'], 3:['goblin','orc'], 4:['golem','scorpion'], 5:['demon','dragon'] };
  // Attack building blocks. Every attack = telegraph (wind) -> attack (act) -> recover (the opening!)
  const ATTACK_DEFS = {
    dash:     { label:'突進',       wind:0.9, speed:9,  dur:0.55, recover:1.5 },
    leap:     { label:'ジャンプ',   wind:0.8, air:0.5, radius:1.7, recover:1.4 },
    ring:     { label:'範囲攻撃',   wind:1.0, radius:2.6, recover:1.4 },
    fan:      { label:'扇状弾',     wind:0.8, count:5, spread:0.9, speed:5.5, recover:1.3 },
    nova:     { label:'全方位弾',   wind:1.0, count:12, speed:4.2, recover:1.6 },
    rain:     { label:'降り注ぐ',   wind:0.7, count:7, delay:1.0, radius:1.1, recover:1.4 },
    summon:   { label:'召喚',       wind:1.2, count:2, recover:1.6 },
    teleport: { label:'瞬間移動',   wind:0.6, recover:0.9, chain:true },
  };
  const BOSS_FLOORS = {
    3:  { kind:'slime',    name:'キングスライム',     hp:60,  speed:1.3, scale:2.2, gold:120,  shot:'#5fe07a',
          atks:  [{t:'leap',radius:1.9},{t:'nova',count:8,speed:3.6},{t:'summon',count:2}],
          atks2: [{t:'rain',count:6,radius:1.2},{t:'leap',radius:2.2,wind:0.6}] },
    6:  { kind:'bat',      name:'ヴァンパイアバット', hp:110, speed:2.0, scale:2.0, gold:280,  shot:'#b58cff',
          atks:  [{t:'dash',speed:11,dur:0.6,wind:0.8,recover:1.3},{t:'fan',count:5,spread:1.1},{t:'rain',count:8}],
          atks2: [{t:'nova',count:10},{t:'dash',speed:12.5,dur:0.7,wind:0.65}] },
    9:  { kind:'skeleton', name:'スケルトンロード',   hp:200, speed:1.6, scale:2.0, gold:600,  shot:'#efe9d2',
          atks:  [{t:'dash',speed:8.5},{t:'ring',radius:2.4},{t:'fan',count:3,speed:6},{t:'summon',count:2}],
          atks2: [{t:'rain',count:9,radius:1.0},{t:'ring',radius:3.0,wind:0.8}] },
    12: { kind:'ghost',    name:'ゴーストロード',     hp:320, speed:1.5, scale:2.1, gold:1100, shot:'#9fd0ff',
          atks:  [{t:'teleport'},{t:'nova',count:12},{t:'fan',count:5},{t:'summon',count:2}],
          atks2: [{t:'rain',count:9},{t:'ring',radius:3.0}] },
    15: { kind:'orc',      name:'オークキング',       hp:520, speed:1.7, scale:2.3, gold:2500, shot:'#ff9b3a',
          atks:  [{t:'dash',speed:9.5},{t:'ring',radius:3.2},{t:'leap',radius:2.1},{t:'fan',count:3,speed:6},{t:'summon',count:3}],
          atks2: [{t:'rain',count:10},{t:'nova',count:12,speed:4.6}] },
    18: { kind:'goblin',   name:'ゴブリンキング',     hp:700,  speed:2.1, scale:2.2, gold:3500,  shot:'#8fe06a',
          atks:  [{t:'dash',speed:10},{t:'fan',count:5,spread:1.1,speed:6},{t:'leap',radius:2.0},{t:'summon',count:3}],
          atks2: [{t:'rain',count:10},{t:'nova',count:12,speed:4.8},{t:'dash',speed:12,wind:0.65}] },
    21: { kind:'golem',    name:'ストーンゴーレム',   hp:950,  speed:1.3, scale:2.4, gold:5000,  shot:'#b7b0a0',
          atks:  [{t:'ring',radius:3.4},{t:'leap',radius:2.4},{t:'dash',speed:8.5},{t:'summon',count:2}],
          atks2: [{t:'rain',count:12,radius:1.2},{t:'ring',radius:3.9,wind:0.8}] },
    24: { kind:'scorpion', name:'デススコーピオン', hp:1200, speed:2.3, scale:2.1, gold:7000,  shot:'#b8e04a',
          atks:  [{t:'dash',speed:12,dur:0.6,wind:0.7},{t:'fan',count:7,spread:1.3,speed:6},{t:'rain',count:10}],
          atks2: [{t:'nova',count:14,speed:4.8},{t:'dash',speed:13.5,dur:0.7,wind:0.55}] },
    27: { kind:'demon',    name:'デーモンロード',     hp:1500, speed:1.9, scale:2.2, gold:9500,  shot:'#ff4a6a',
          atks:  [{t:'teleport'},{t:'fan',count:7,spread:1.2,speed:6},{t:'nova',count:14,speed:5},{t:'summon',count:3},{t:'ring',radius:3.2}],
          atks2: [{t:'rain',count:12},{t:'ring',radius:3.6,wind:0.7}] },
    30: { kind:'dragon',   name:'ドラゴンロード',     hp:2200, speed:1.9, scale:2.6, gold:20000, shot:'#ff7a2a',
          atks:  [{t:'dash',speed:11},{t:'nova',count:16,speed:5},{t:'fan',count:9,spread:1.5,speed:6.5},{t:'leap',radius:2.6},{t:'ring',radius:3.6},{t:'summon',count:3}],
          atks2: [{t:'rain',count:14,radius:1.3,delay:0.9},{t:'nova',count:20,speed:5.2},{t:'dash',speed:14,wind:0.6}] },
  };
  const MAX_FLOOR = 30;                                       // 最下層(ここのボスを倒すと制覇)
  const DUNGEON_GROUND = { 1:'#57526a', 2:'#4b5866', 3:'#5d5246', 4:'#4e5a4c', 5:'#5a3f45' };
  const SWORD_DMG = [1,2,3,5,8];
  const SWORD_CD = [0.35,0.32,0.28,0.25,0.22];
  const SWORD_COLORS = ['#dfe5ee','#9fd8ff','#8fe0a8','#ffd45a','#ff8ae0'];
  function floorTier(f){ return f<=6 ? 1 : f<=12 ? 2 : f<=18 ? 3 : f<=24 ? 4 : 5; }   // 1-6 slime/bat, 7-12 skeleton/ghost, 13-18 goblin/orc, 19-24 golem/scorpion, 25-30 demon/dragon
  function makeEnemy(kind,x,y){
    const d = ENEMY_DEFS[kind];
    return { kind, x, y, hp:d.hp, maxhp:d.hp, vx:0, vy:0, t:Math.random(), hurt:0, face:1, r:0.72, scale:1 };
  }
  // A boss stays down for 3 days, then comes back
  const BOSS_RESPAWN_DAYS = 3;
  function bossDefeated(f){
    state.bossDone = state.bossDone || {};
    const d = state.bossDone[f];
    if(d===undefined) return false;
    if(d===true){ state.bossDone[f] = state.day; return true; }          // old save: count from today
    if(state.day - d >= BOSS_RESPAWN_DAYS){ delete state.bossDone[f]; return false; }
    return true;
  }
  function makeBoss(f){
    const b = BOSS_FLOORS[f], e = makeEnemy(b.kind, DUNGEON_ARENA.cx, DUNGEON_ARENA.cy);
    e.boss = true; e.name = b.name; e.hp = e.maxhp = b.hp; e.speed = b.speed; e.scale = b.scale;
    e.r = 0.72 + (b.scale-1)*0.45; e.gold = b.gold; e.active = true;
    e.st = 'intro'; e.stT = 1.6; e.atk = null; e.lastT = ''; e.p2 = false; e.z = 0;   // a short pause before the fight starts
    return e;
  }
  function spawnEnemies(){
    enemies = [];
    const f = state.floor||1, kinds = TIER_KINDS[floorTier(f)], boss = BOSS_FLOORS[f];
    if(boss){                                                    // boss floor: just you and the boss
      if(!bossDefeated(f)) enemies.push(makeBoss(f));
      return;
    }
    const rooms = DUNGEON_ROOMS.filter(r=>r.d>=3);
    for(let i=rooms.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); const tmp = rooms[i]; rooms[i] = rooms[j]; rooms[j] = tmp; }
    for(const r of rooms.slice(0, 55)){
      enemies.push(makeEnemy(Math.random()<0.6 ? kinds[0] : kinds[1], r.cx, r.cy));
    }
  }
  function inArena(x,y){
    const a = DUNGEON_ARENA;
    return a.active && x>=a.x0-0.5 && x<=a.x0+a.w-0.5 && y>=a.y0-0.5 && y<=a.y0+a.h-0.5;
  }
  function nudgePos(x,y,dx,dy,dist){
    const len = Math.hypot(dx,dy) || 1; dx /= len; dy /= len;
    for(let k=0;k<6;k++){
      const nx = x + dx*dist/6, ny = y + dy*dist/6;
      if(!collides(nx,y)) x = nx;
      if(!collides(x,ny)) y = ny;
    }
    return [x,y];
  }
  function summonMinions(b, count){
    const kinds = TIER_KINDS[floorTier(state.floor||1)];
    const offs = [[-2,0],[2,0],[0,2],[0,-2],[2,2],[-2,2]];
    for(let i=0;i<(count||3);i++){
      const o = offs[i%offs.length], p = nudgePos(b.x, b.y, o[0], o[1], 2);
      enemies.push(makeEnemy(kinds[Math.random()<0.5 ? 0 : 1], p[0], p[1]));
    }
    setMsg(`${b.name}が仲間を呼んだ!`);
  }

  // ---- sword enchantments (effect tables by level 0-3) ----
  const KNOCK_DIST = [0.7, 1.4, 2.1, 2.8], KNOCK_STUN = [0, 0.3, 0.5, 0.7];
  const WAVE_FACTOR = [0, 0.6, 0.8, 1.0], WAVE_RANGE = [0, 4.5, 6, 7.5];
  const FIRE_DPS = [0, 1, 1.5, 2.5], FIRE_DUR = [0, 3, 4, 5];
  let waves = [];
  const killAcc = { n:0, gain:0, ore:0, name:'', boss:null };
  function flushKills(){
    if(!killAcc.n) return;
    let msg = killAcc.n===1 ? `${killAcc.name}を倒した!+${killAcc.gain}G` : `${killAcc.n}体倒した!+${killAcc.gain}G`;
    if(killAcc.ore) msg += ` 金鉱石+${killAcc.ore}`;
    if(killAcc.boss){
      const f = state.floor||1;
      state.bossDone = state.bossDone || {}; state.bossDone[f] = state.day;                   // respawns 3 days later
      state.bossBeaten = state.bossBeaten || {}; state.bossBeaten[f] = true;                 // (checkpoint stays unlocked)
      if(f<MAX_FLOOR){ DUNGEON[DUNGEON_STAIRS.y][DUNGEON_STAIRS.x] = 'K'; msg += ' 下への階段が現れた!'; }
      else msg += ' ダンジョンを制覇した!';
    }
    killAcc.n = 0; killAcc.gain = 0; killAcc.ore = 0; killAcc.name = ''; killAcc.boss = null;
    updateHud(); save();
    setMsg(msg);
  }
  function igniteEnemy(e, dps, dur, spread){
    e.burnT = Math.max(e.burnT||0, dur); e.burnDps = dps; e.burnSpread = !!spread; e.burnAcc = e.burnAcc||0;
  }
  // Every hit goes through here: damage, knockback, rewards. quiet = no white flash (burn ticks)
  function damageEnemy(e, dmg, kdx, kdy, kdist, quiet){
    if(e.dead) return;
    e.hp -= dmg;
    if(!quiet) e.hurt = 0.3;
    if(kdist>0){ const np = nudgePos(e.x, e.y, kdx, kdy, kdist*(e.boss ? 0.3 : 1)); e.x = np[0]; e.y = np[1]; }
    if(e.hp>0) return;
    e.dead = true;
    const i = enemies.indexOf(e); if(i>=0) enemies.splice(i,1);
    if(e.boss){ for(const o of enemies) o.dead = true; enemies.length = 0; bossShots.length = 0; hazards.length = 0; }   // the fight is over
    let gain, ore = 0;
    if(e.boss){ gain = e.gold; ore = 3 + Math.floor((state.floor||1)/3) + Math.floor(Math.random()*3); killAcc.boss = e; }
    else { gain = 2 + Math.floor(Math.random()*4); if(floorTier(state.floor||1)>=2 && Math.random()<0.04) ore = 1; }
    state.gold += gain; if(ore) state.goldOre = (state.goldOre||0) + ore;
    killAcc.n++; killAcc.gain += gain; killAcc.ore += ore;
    killAcc.name = e.boss ? e.name : ENEMY_DEFS[e.kind].name;
  }
  function updateWaves(dt){
    for(let i=waves.length-1;i>=0;i--){
      const w = waves[i], step = 9*dt;
      w.x += w.dx*step; w.y += w.dy*step; w.left -= step;
      const tt = tileAt(Math.floor(w.x+0.5), Math.floor(w.y+0.5));
      if(w.left<=0 || SOLID.has(tt)){ waves.splice(i,1); continue; }
      for(const e of enemies.slice()){
        if(e.dead || w.hit.has(e)) continue;
        if(Math.hypot(e.x-w.x, e.y-w.y) < 0.85 + (e.r-0.72)){ w.hit.add(e); damageEnemy(e, w.dmg, w.dx, w.dy, 0.5); }
      }
    }
  }
