  const MAP_LAYOUTS = { home:HOME, north:NORTH, river:RIVER, cave:CAVE, dungeon:DUNGEON, coast:COAST, port:PORT };
  function setMapSize(name){
    if(name==='dungeon'){ COLS = DCOLS; ROWS = DROWS; }
    else if(name==='river'){ COLS = RCOLS; ROWS = RROWS; }
    else if(name==='coast'){ COLS = CCOLS; ROWS = CROWS; }
    else if(name==='port'){ COLS = PCOLS; ROWS = PROWS; }
    else { COLS = 32; ROWS = 24; }
  }

  const SOLID = new Set(['2','4','5','6','7','8','9','g','h','i','G','Z','J','l','m','n','o','p','q','r','R','x','s','S','y','a','b','c','d','e','f','T','N','M','A','D','Y','W','O','k','#']);

  let state = {
    px:6, py:5, dir:'down',
    gold:50, day:1, seedsByType:{wheat:3, tomato:0, corn:0, carrot:0}, harvestedByType:{wheat:0, tomato:0, corn:0, carrot:0},
    selectedCrop:'wheat', eggs:0, toolLevel:1,
    wood:0, mikan:0, treeHits:{}, chopped:{}, fruit:null,
    stone:0, iron:0, goldOre:0, rockHits:{}, mined:{}, axeLevel:1, pickLevel:1, map:'home',
    gateOpen:false, cows:[], milk:0, sheep:[], wool:0, sword:false, wells:{home:false,north:false,river:false,cave:false,coast:false}, wellsOpen:false, enchant:{knock:0,wave:0,fire:0}, swordLevel:1, floor:1, bossDone:{}, bossBeaten:{}, mushroom:0, rodLevel:1, opened:{}, hp:10, stairsOpen:false, dayTime:0, chest:{counts:{}}, northHouse:false, coastHouse:false, totalHarvest:0, gate2Open:false, gate4Open:false, gate3Open:false,
    fish:{ minnow:0, ayu:0, carp:0, yamame:0, catfish:0 },
    chicken:{ fed:false, eggReady:false },
    tiles:{} // "x,y" -> {tilled, planted, growth, watered}
  };

  function load(){
    try{
      const raw = localStorage.getItem(SAVE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed);
        if(state.px===undefined && parsed.x!==undefined){ state.px = parsed.x; state.py = parsed.y; }
        if(state.toolLevel===undefined) state.toolLevel = 1;
        if(!state.seedsByType){
          state.seedsByType = {wheat:parsed.seeds!==undefined?parsed.seeds:3, tomato:0, corn:0};
          state.harvestedByType = {wheat:parsed.harvested||0, tomato:0, corn:0};
          state.selectedCrop = 'wheat';
        }
      }
    }catch(e){ console.warn('load failed', e); }
  }
  function save(){
    try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
    catch(e){ console.warn('save failed', e); }
  }

  function tileAt(x,y){
    const c = curLayout[y] ? curLayout[y][x] : '0';
    if(c==='6' && state.chopped[K(x,y)]!==undefined) return '0';
    if((c==='g'||c==='A'||c==='P') && state.mined[K(x,y)]!==undefined) return '0';
    if(c==='Y' && state.opened && state.opened[K(x,y)]!==undefined) return 'W';
    if(c==='G' && state.gateOpen) return '3';
    if(c==='Z' && state.gate2Open) return '3';
    if(c==='T' && state.gate3Open) return '3';
    if(c==='J' && state.gate4Open) return '3';
    if(c==='D' && state.stairsOpen) return 'H';
    const built = state.map==='north' ? state.northHouse : state.map==='coast' ? state.coastHouse : false;   // 建設予定地は、そのマップの家が建ったときだけ家になる
    if(built){ const hm = HOUSE_MAP[c]; if(hm) return hm; }
    return c;
  }
  function tileX(){ return Math.round(state.px); }
  function tileY(){ return Math.round(state.py); }
  function K(x,y){ return (state.map==='north' ? 'n:' : state.map==='river' ? 'r:' : state.map==='coast' ? 's:' : state.map==='port' ? 'p:' : state.map==='cave' ? 'c:' : state.map==='dungeon' ? 'd:' : '') + x + ',' + y; }
  function key(x,y){ return K(x,y); }
  function parseKey(k){ const m = k.match(/^(?:(n|r|c|d|s|p):)?(-?\d+),(-?\d+)$/); return { map: m[1]==='n'?'north':m[1]==='r'?'river':m[1]==='s'?'coast':m[1]==='p'?'port':m[1]==='c'?'cave':m[1]==='d'?'dungeon':'home', x:+m[2], y:+m[3] }; }
  function farmTile(x,y){
    const k = key(x,y);
    if(!state.tiles[k]) state.tiles[k] = {tilled:false, planted:false, growth:0, watered:false, crop:null};
    return state.tiles[k];
  }

  function setMsg(t){ document.getElementById('msg').textContent = t; }
  function updateHud(){
    document.getElementById('gold').textContent = state.gold;
    for(const k of Object.keys(CROPS)){                                   // every kind of seed stays visible; the highlighted one is planted
      document.getElementById('seed_'+k).textContent = state.seedsByType[k]||0;
      document.querySelector('.seed[data-crop="'+k+'"]').classList.toggle('sel', state.selectedCrop===k);
    }
    document.getElementById('eggs').textContent = state.eggs;
    document.getElementById('wood').textContent = state.wood;
    document.getElementById('mikan').textContent = state.mikan;
    document.getElementById('stone').textContent = state.stone;
    document.getElementById('iron').textContent = state.iron;
    document.getElementById('milk').textContent = state.milk;
    document.getElementById('fish').textContent = fishCount();
    document.getElementById('goldore').textContent = state.goldOre||0;
    document.getElementById('wool').textContent = state.wool||0;
    document.getElementById('mushroom').textContent = state.mushroom||0;
  }

  function collides(px, py){
    const m = 0.16; // inset so the hitbox is a bit smaller than a full tile
    const pts = [[px+m,py+m],[px+1-m,py+m],[px+m,py+1-m],[px+1-m,py+1-m]];
    for(const [cx,cy] of pts){
      const t = tileAt(Math.floor(cx), Math.floor(cy));
      if(SOLID.has(t)) return true;
      if(cx<0||cy<0||cx>=COLS||cy>=ROWS) return true;
    }
    return false;
  }

  const SPEED = 4.2; // tiles per second
  function updatePosition(dt, vx, vy){
    if(vx===0 && vy===0) return;
    const len = Math.hypot(vx,vy) || 1;
    vx /= len; vy /= len;
    const nx = state.px + vx*SPEED*dt;
    if(!collides(nx, state.py)) state.px = nx;
    const ny = state.py + vy*SPEED*dt;
    if(!collides(state.px, ny)) state.py = ny;
    if(Math.abs(vx) > Math.abs(vy)) state.dir = vx>0 ? 'right' : 'left';
    else state.dir = vy>0 ? 'down' : 'up';
  }

  const WORK_CHARS = new Set(['h','i']);
  const GATE_CHARS = new Set(['G','Z','T','D','J']);
  const HOUSE_CHARS = new Set(['l','m','n','o','p','q']);
  const SITE_CHARS = new Set(['r','R','x','s','S','y']);
  const HOUSE_MAP = { r:'l', R:'m', x:'n', s:'o', S:'p', y:'q' };
  const HOUSE2_PALETTE = {
    R:'#7a3b2a', H:'#96503a', t:'#5a3a22', W:'#ead9a8', w:'#cdb883',
    K:'#8ec3e6', k:'#3d3220', D:'#6b3f26', d:'#3a2418'
  };
  const SHOP_CHARS = new Set(['a','b','c','d','e','f']);
  function nearAny(chars){
    const tx = tileX(), ty = tileY();
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(chars.has(tileAt(tx+dx, ty+dy))) return true;
    }
    return false;
  }
  function nearType(type){ return nearAny(new Set([type])); }
