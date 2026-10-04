  function findNear(ch){
    const tx = tileX(), ty = tileY();
    const fx = state.dir==='left'?-1:state.dir==='right'?1:0;
    const fy = state.dir==='up'?-1:state.dir==='down'?1:0;
    const cx = state.px+0.5, cy = state.py+0.5;
    let best = null, bd = 1e9;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const x = tx+dx, y = ty+dy;
      if(tileAt(x,y)!==ch) continue;
      const ddx = x+0.5-cx, ddy = y+0.5-cy;
      const d = Math.hypot(ddx,ddy) - (ddx*fx+ddy*fy)*0.15;
      if(d<bd){ bd = d; best = [x,y,d]; }
    }
    return best;
  }
  function treeAction(t){
    const k = K(t[0],t[1]);
    if(state.fruit[k]){
      const fr = FRUITS[fruitTypeOf(t[0],t[1])];
      const n = 1 + Math.floor(Math.random()*3);
      state[fr.key] = (state[fr.key]||0) + n; state.fruit[k] = false;
      addEffect(t[0],t[1],'pick');
      setMsg(`${fr.label}を${n}個収穫した${fr.emoji}`);
    } else {
      const hits = (state.treeHits[k]||0) + 1;
      const need = [3,2,1][state.axeLevel-1] || 1;
      triggerActionAnim('axe');
      addEffect(t[0],t[1],'chop');
      if(hits>=need){
        delete state.treeHits[k]; delete state.fruit[k];
        state.chopped[k] = state.day;
        const n = 2 + Math.floor(Math.random()*2) + (state.axeLevel-1);
        state.wood += n;
        addEffect(t[0],t[1],'wood');
        setMsg(`木を切り倒した!木材を${n}個回収🪵`);
      } else {
        state.treeHits[k] = hits;
        setMsg(`斧でコーン!(${hits}/${need})`);
      }
    }
    updateHud(); save();
  }

  function rockAction(t){
    const k = K(t[0],t[1]);
    const need = [8,6,4][state.pickLevel-1] || 4;
    const hits = (state.rockHits[k]||0) + 1;
    triggerActionAnim('pick');
    addEffect(t[0],t[1],'rockchip');
    if(hits>=need){
      delete state.rockHits[k];
      state.mined[k] = state.day;
      const ironP = ([0.25,0.35,0.5][state.pickLevel-1] || 0.5) + (state.map==='north' ? 0.2 : state.map==='cave' ? 0.35 : 0);
      if(Math.random()<ironP){
        const n = 1 + (state.pickLevel>=3 ? 1 : 0);
        state.iron += n;
        addEffect(t[0],t[1],'drop','#7d8fa8');
        setMsg(`鉄を${n}個回収🔩`);
      } else {
        const n = 2 + Math.floor(Math.random()*2) + (state.pickLevel-1);
        state.stone += n;
        addEffect(t[0],t[1],'drop','#a4a8b0');
        setMsg(`石を${n}個回収🪨`);
      }
    } else {
      state.rockHits[k] = hits;
      setMsg(`ピッケルでカーン!(${hits}/${need})`);
    }
    updateHud(); save();
  }

  // Gold ore: very hard (20 hits with the starting pickaxe)
  function goldAction(t){
    const k = K(t[0],t[1]);
    const need = [20,15,10][state.pickLevel-1] || 10;
    const hits = (state.rockHits[k]||0) + 1;
    triggerActionAnim('pick');
    addEffect(t[0],t[1],'rockchip');
    if(hits>=need){
      delete state.rockHits[k];
      state.mined[k] = state.day;
      const n = 1 + Math.floor(Math.random()*2);
      state.goldOre = (state.goldOre||0) + n;
      addEffect(t[0],t[1],'drop','#f2c230');
      setMsg(`金鉱石を${n}個回収🥇`);
    } else {
      state.rockHits[k] = hits;
      setMsg(`ピッケルでガキン!(${hits}/${need})`);
    }
    updateHud(); save();
  }

  // Wild mushrooms: pick by hand, they grow back
  function mushroomAction(t){
    const k = K(t[0],t[1]);
    const n = 1 + Math.floor(Math.random()*2);
    state.mushroom = (state.mushroom||0) + n;
    state.mined[k] = state.day;
    addEffect(t[0],t[1],'pick');
    setMsg(`きのこを${n}個採った🍄`);
    updateHud(); save();
  }
  // Treasure chests: open once, refill after 14 days
  function chestAction(t){
    const k = K(t[0],t[1]);
    state.opened = state.opened || {};
    state.opened[k] = state.day;
    addEffect(t[0],t[1],'pick');
    const r = Math.random();
    if(r<0.45){ const n = 150 + Math.floor(Math.random()*301); state.gold += n; setMsg(`宝箱を開けた!${n}G見つけた💰`); }
    else if(r<0.7){ const n = 3 + Math.floor(Math.random()*4); state.iron += n; setMsg(`宝箱を開けた!鉄を${n}個見つけた🔩`); }
    else if(r<0.85){ const w = 8 + Math.floor(Math.random()*8), st = 8 + Math.floor(Math.random()*8); state.wood += w; state.stone += st; setMsg(`宝箱を開けた!木材${w}・石${st}を見つけた`); }
    else { const n = 1 + Math.floor(Math.random()*2); state.goldOre = (state.goldOre||0) + n; setMsg(`宝箱を開けた!金鉱石を${n}個見つけた🥇`); }
    updateHud(); save();
  }

  const OFFSETS_1 = [[0,0]];
  const OFFSETS_PLUS = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
  const OFFSETS_3x3 = [[0,0],[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
  const ACTION_MSG = { till:'土を耕したよ🪓', plant:'種を植えたよ🌱', water:'水をあげたよ💧', harvest:'収穫した!🧺' };

  function actOnTile(wx,wy){
    if(tileAt(wx,wy) !== '1') return null;
    const t = farmTile(wx,wy);
    if(!t.tilled){
      t.tilled = true;
      addEffect(wx,wy,'till');
      return 'till';
    } else if(!t.planted){
      const crop = state.selectedCrop;
      if(state.seedsByType[crop]<=0) return null;
      t.planted = true; t.growth = 0; t.watered = false; t.crop = crop;
      state.seedsByType[crop]--;
      addEffect(wx,wy,'plant');
      return 'plant';
    } else if(t.growth>=3){
      const crop = t.crop || 'wheat';
      state.harvestedByType[crop] = (state.harvestedByType[crop]||0) + 1;
      state.totalHarvest = (state.totalHarvest||0) + 1;
      t.planted = false; t.tilled = false; t.growth = 0; t.watered = false; t.crop = null;
      addEffect(wx,wy,'harvest');
      return 'harvest';
    } else if(!t.watered){
      t.watered = true;
      addEffect(wx,wy,'water');
      return 'water';
    }
    return null;
  }

  function farmAction(){
    if((state.seedsByType[state.selectedCrop]||0)<=0){
      const other = Object.keys(CROPS).find(k=>(state.seedsByType[k]||0)>0);
      if(other){ state.selectedCrop = other; setMsg(`${CROPS[other].label}の種に切りかえた${CROPS[other].emoji}`); updateHud(); }
    }
    const offsets = state.toolLevel>=3 ? OFFSETS_3x3 : state.toolLevel>=2 ? OFFSETS_PLUS : OFFSETS_1;
    const results = [];
    for(const [dx,dy] of offsets){
      const r = actOnTile(tileX()+dx, tileY()+dy);
      if(r) results.push(r);
    }
    if(results.length===0){
      setMsg('今日はここではもうやることないよ');
    } else {
      triggerActionAnim();
      setMsg(results.length===1 ? ACTION_MSG[results[0]] : `まとめて${results.length}マス作業したよ⚡`);
    }
    updateHud(); draw(); save();
  }
