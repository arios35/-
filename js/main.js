  load();
  for(const k of Object.keys(CROPS)){                         // 古いセーブには、あとから増えた作物の欄がないので補う
    if(state.seedsByType[k]===undefined) state.seedsByType[k] = 0;
    if(state.harvestedByType[k]===undefined) state.harvestedByType[k] = 0;
  }
  curLayout = MAP_LAYOUTS[state.map] || HOME;
  setMapSize(MAP_LAYOUTS[state.map] ? state.map : 'home');
  if(state.map==='dungeon'){ buildFloor(state.floor||1); spawnEnemies(); }
  if(state.map==='port') spawnPortPeople();
  if(state.map==='dungeon' && state.hp<=0) openDeath();            // closed the game at 0 hearts: the choice is still waiting
  state.bossBeaten = state.bossBeaten || {};
  for(const k of Object.keys(state.bossDone||{})) state.bossBeaten[k] = true;                // old saves: keep their checkpoints
  if(state.wellsOpen){ for(const k of Object.keys(WELLS)) state.wells[k] = true; state.wellsOpen = false; }   // old saves: everything was unlocked at once
  if(state.map!=='home' && collides(state.px, state.py)){ const m0 = state.map; state.map = 'home'; goMap(m0); }   // saved spot is inside a wall after a map change
  if(!state.fruit){ state.fruit = {}; for(const k of treeKeys.concat(treeKeysN, treeKeysR, treeKeysC)) state.fruit[k] = Math.random()<0.25; }
  updateHud();
  updateMapName();

  function goMap(name){
    const prev = state.map;
    state.map = name;
    setMapSize(name);
    curLayout = MAP_LAYOUTS[name];
    enemies = []; waves = []; bossShots = []; hazards = []; invuln = 0; atkCool = 0; deathPending = false;
    if(name==='north' && prev==='cave'){ state.px = 22.5; state.py = 3; state.dir = 'down'; }
    else if(name==='north'){ state.px = 26.5; state.py = ROWS-3; state.dir = 'up'; }
    else if(name==='dungeon'){ buildFloor(state.floor||1); state.px = DUNGEON_START.spawnX; state.py = DUNGEON_START.spawnY; state.dir = 'down'; state.hp = 10; spawnEnemies(); }
    else if(name==='cave' && prev==='dungeon'){ state.px = CAVE_STAIRS.spawnX; state.py = CAVE_STAIRS.spawnY; state.dir = 'down'; }
    else if(name==='cave'){ state.px = 15.5; state.py = ROWS-3; state.dir = 'up'; }
    else if(name==='port'){ state.px = 3.5; state.py = 17; state.dir = 'right'; }                     // 港町の西の入口
    else if(name==='coast' && prev==='port'){ state.px = 36.5; state.py = 12; state.dir = 'left'; }   // 海岸の東の道へ戻る
    else if(name==='coast'){ state.px = 20.5; state.py = 2; state.dir = 'down'; }
    else if(name==='river' && prev==='coast'){ state.px = 22.5; state.py = ROWS-3; state.dir = 'up'; }
    else if(name==='river'){ state.px = 3.5; state.py = 2; state.dir = 'down'; }
    else if(prev==='river'){ state.px = 3.5; state.py = ROWS-3; state.dir = 'up'; }
    else { state.px = 26.5; state.py = 2; state.dir = 'down'; }
    updateMapName();
    effects = []; actionAnim = null; fishing.phase = 'idle';
    if(name==='port') spawnPortPeople();
    fadeStart = performance.now();
    setMsg(name==='dungeon' ? `🪜 地下${state.floor||1}階に来た!敵を倒して進もう(タップで剣を振る。動きながら別の指でタップもOK)`
         : name==='cave' ? '🕳️ 洞窟に来た!暗いけど、岩から鉄がよく出るみたい'
         : name==='north' ? '⛰️ 北の山に来た!岩が鉄を含みやすいみたい'
         : name==='port' ? '⚓ 港町に来た!にぎやかな町だ'
         : name==='coast' ? '🏖️ 南の海岸に来た!潮風が気持ちいい'
         : name==='river' ? '🏞️ 川の国に来た!広い!釣りは2つの桟橋でできるよ🎣'
         : '🏡 村に戻ってきた');
    save();
  }

  let lastT = null;
  function loop(t){
    if(lastT===null) lastT = t;
    const dt = Math.min((t-lastT)/1000, 0.05);
    lastT = t;
    let vx = stickVec.x, vy = stickVec.y;
    if(vx===0 && vy===0){
      if(keyVec.left) vx -= 1;
      if(keyVec.right) vx += 1;
      if(keyVec.up) vy -= 1;
      if(keyVec.down) vy += 1;
    }
    if(!wellAnim) updatePosition(dt, vx, vy);
    if(wellAnim) updateWell(dt);
    const curT = tileAt(tileX(), tileY());
    if(curT!=='H') stairLock = false;
    if(curT!=='L' && curT!=='K') stairHold = 0;
    if(curT==='u' && state.map==='home') goMap('north');
    else if(curT==='v' && state.map==='north') goMap('home');
    else if(curT==='U' && state.map==='home') goMap('river');
    else if(curT==='V' && state.map==='river') goMap('home');
    else if(curT==='I' && state.map==='river') goMap('coast');
    else if(curT==='z' && state.map==='coast') goMap('river');
    else if(curT==='>' && state.map==='coast') goMap('port');
    else if(curT==='<' && state.map==='port') goMap('coast');
    else if(curT==='X' && state.map==='north') goMap('cave');
    else if(curT==='Q' && state.map==='cave') goMap('north');
    else if(curT==='H' && state.map==='cave'){ if(!stairLock){ stairLock = true; openFloorSelect(); } }
    else if((curT==='L' || curT==='K') && state.map==='dungeon'){
      stairHold += dt;                                   // stand on the stairs for a moment (being knocked onto them does nothing)
      if(stairHold >= 0.5){
        stairHold = 0;
        if(curT==='K'){ if((state.floor||1)<MAX_FLOOR) changeFloor((state.floor||1)+1, true); }
        else if((state.floor||1)<=1) goMap('cave');
        else changeFloor(state.floor-1, false);
      }
    }
    updateFishing(dt);
    updateCows(dt);
    updateSheep(dt);
    const paused = !!document.querySelector('.shop.open');      // menus stop the clock and the dungeon
    if(!paused) updatePortPeople(dt);
    if(!paused){
      state.dayTime = (state.dayTime||0) + dt;
      if(state.dayTime >= DAY_SEC) sleep(true);
    }
    if(invuln>0) invuln = Math.max(0, invuln-dt);
    if(atkCool>0) atkCool = Math.max(0, atkCool-dt);
    if(!paused) updateEnemies(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  setInterval(save, 2500);
