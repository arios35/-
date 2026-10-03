  // ---- Toll gates ----
  const GATES = {
    G:{ cost:500,  key:'gateOpen',  title:'🚪 北の山への門', desc:'通行料500Gを払うと門が開いて、北の山に行けるようになります。', done:'門が開いた!北の山へ行けるよ⛰️' },
    D:{ cost:10000, key:'stairsOpen', title:'🪜 地下への階段', desc:'10000Gを払うと階段が使えるようになり、地下ダンジョンに行けます。ダンジョンでライフがなくなると、手荷物とお金を全部失います!(家に預けたものは無事)', done:'階段が開いた!地下ダンジョンへ行けるよ🪜' },
    T:{ cost:5000, key:'gate3Open', title:'🚪 洞窟への門', desc:'通行料5000Gを払うと門が開いて、山の奥の洞窟に行けるようになります。', done:'門が開いた!洞窟へ行けるよ🕳️' },
    Z:{ cost:2000, key:'gate2Open', title:'🚪 川の国への門', desc:'通行料2000Gを払うと門が開いて、川と橋と釣り場のあるエリアに行けるようになります。', done:'門が開いた!川の国へ行けるよ🏞️' },
  };
  let curGate = 'G';
  function openGate(ch){
    curGate = ch || 'G';
    const g = GATES[curGate];
    document.getElementById('gateTitle').textContent = g.title;
    document.getElementById('gateDesc').textContent = g.desc;
    document.getElementById('gateCostLabel').textContent = `通行料 ${g.cost}G`;
    document.getElementById('gateInfo').textContent = `所持金: ${state.gold}G`;
    document.getElementById('gateModal').classList.add('open');
  }
  document.getElementById('closeGate').onclick = ()=>document.getElementById('gateModal').classList.remove('open');
  document.getElementById('payGate').onclick = ()=>{
    const g = GATES[curGate];
    if(state.gold<g.cost){ document.getElementById('gateInfo').textContent = `お金が足りないよ(あと${g.cost-state.gold}G)`; return; }
    state.gold -= g.cost; state[g.key] = true;
    document.getElementById('gateModal').classList.remove('open');
    updateHud(); save();
    setMsg(g.done);
  };
  document.getElementById('buyCow').onclick = ()=>{
    if(state.cows.length>=4){ document.getElementById('shopInfo').textContent = '牧場はもう満員だよ(最大4頭)'; return; }
    if(state.gold<300){ document.getElementById('shopInfo').textContent = 'お金が足りないよ(300G必要)'; return; }
    state.gold -= 300;
    state.cows.push({ x:20+Math.random()*3, y:3+Math.random()*3, fed:false, milkReady:false, face:1 });
    updateHud();
    document.getElementById('shopInfo').textContent = '牛を買ったよ🐄 店の東の牧場にいるよ。小麦をあげてね';
    save();
  };

  document.getElementById('buySheep').onclick = ()=>{
    if(state.sheep.length>=4){ document.getElementById('shopInfo').textContent = '羊の牧場はもう満員だよ(最大4頭)'; return; }
    if(state.gold<250){ document.getElementById('shopInfo').textContent = 'お金が足りないよ(250G必要)'; return; }
    state.gold -= 250;
    state.sheep.push({ x:20+Math.random()*3, y:11+Math.random()*3, fed:false, woolReady:false, face:1 });
    updateHud();
    document.getElementById('shopInfo').textContent = '羊を買ったよ🐑 牛の牧場の南の牧場にいるよ。トマトをあげてね';
    save();
  };

  // ---- Sleeping: only at a house ----
  function openSleep(){ document.getElementById('sleepModal').classList.add('open'); }
  document.getElementById('closeSleep').onclick = ()=>document.getElementById('sleepModal').classList.remove('open');
  document.getElementById('doSleep').onclick = ()=>{
    document.getElementById('sleepModal').classList.remove('open');
    sleep();
  };

  // ---- River tackle shop ----
  const FISH_MULT = 1.3, MUSH_PRICE = 15, ROD_COST = [1500, 5000];
  const fishPrice = k=>Math.round(FISH[k].price*FISH_MULT);
  function renderFishShop(msg){
    let ft = 0, fc = 0;
    for(const k of Object.keys(FISH)){ const n = state.fish[k]||0; fc += n; ft += n*fishPrice(k); }
    document.getElementById('fs_fish').textContent = `${fc}匹 → ${ft}G`;
    const mu = state.mushroom||0;
    document.getElementById('fs_mush').textContent = `${mu}個 → ${mu*MUSH_PRICE}G`;
    const lv = state.rodLevel||1;
    document.getElementById('fs_rod').textContent = lv>=3 ? 'Lv3 (最大)' : `Lv${lv}→Lv${lv+1}: ${ROD_COST[lv-1]}G`;
    document.getElementById('fsUpgradeRod').style.display = lv>=3 ? 'none' : '';
    document.getElementById('fishShopInfo').textContent = msg || `所持金: ${state.gold}G`;
  }
  function openFishShop(){ document.getElementById('fishShopModal').classList.add('open'); renderFishShop(); }
  document.getElementById('closeFishShop').onclick = ()=>document.getElementById('fishShopModal').classList.remove('open');
  document.getElementById('fsSellFish').onclick = ()=>{
    let total = 0, n = 0;
    for(const k of Object.keys(FISH)){ const c = state.fish[k]||0; total += c*fishPrice(k); n += c; state.fish[k] = 0; }
    if(!total){ renderFishShop('売れる魚がないよ'); return; }
    state.gold += total; updateHud(); save();
    renderFishShop(`魚${n}匹が売れて+${total}G!`);
  };
  document.getElementById('fsSellMush').onclick = ()=>{
    const n = state.mushroom||0;
    if(n<=0){ renderFishShop('売れるきのこがないよ'); return; }
    state.gold += n*MUSH_PRICE; state.mushroom = 0; updateHud(); save();
    renderFishShop(`きのこ${n}個が売れて+${n*MUSH_PRICE}G!`);
  };
  document.getElementById('fsUpgradeRod').onclick = ()=>{
    const lv = state.rodLevel||1;
    if(lv>=3) return;
    const cost = ROD_COST[lv-1];
    if(state.gold<cost){ renderFishShop(`お金が足りないよ(${cost}G必要)`); return; }
    state.gold -= cost; state.rodLevel = lv+1; updateHud(); save();
    renderFishShop(`釣竿がLv${state.rodLevel}になった!`);
  };

  // ---- Storage at home (deposit / withdraw) ----
  const STORE_ITEMS = [
    { id:'gold', icon:'💰', label:'お金', unit:100 },
    { id:'eggs', icon:'🥚', label:'卵' }, { id:'wood', icon:'🪵', label:'木材' },
    { id:'stone', icon:'🪨', label:'石' }, { id:'iron', icon:'🔩', label:'鉄' },
    { id:'goldOre', icon:'🥇', label:'金鉱石' }, { id:'mikan', icon:'🍊', label:'みかん' },
    { id:'milk', icon:'🥛', label:'牛乳' }, { id:'wool', icon:'🧶', label:'羊毛' }, { id:'mushroom', icon:'🍄', label:'きのこ' },
    { id:'crop:wheat', icon:'🌾', label:'小麦' }, { id:'crop:tomato', icon:'🍅', label:'トマト' },
    { id:'crop:corn', icon:'🌽', label:'とうもろこし' },
    { id:'fish:minnow', icon:'🐟', label:'小魚' }, { id:'fish:ayu', icon:'🐟', label:'アユ' },
    { id:'fish:carp', icon:'🐠', label:'コイ' }, { id:'fish:yamame', icon:'🐡', label:'ヤマメ' },
    { id:'fish:catfish', icon:'🐋', label:'大ナマズ' },
  ];
  let storeAmt = 1;
  function invGet(id){
    if(id.startsWith('crop:')) return state.harvestedByType[id.slice(5)]||0;
    if(id.startsWith('fish:')) return state.fish[id.slice(5)]||0;
    return state[id]||0;
  }
  function invSet(id,v){
    if(id.startsWith('crop:')) state.harvestedByType[id.slice(5)] = v;
    else if(id.startsWith('fish:')) state.fish[id.slice(5)] = v;
    else state[id] = v;
  }
  function chestCounts(){ if(!state.chest || !state.chest.counts) state.chest = { counts:{} }; return state.chest.counts; }
  function moveItem(id, dir){
    const it = STORE_ITEMS.find(i=>i.id===id), unit = it.unit||1, counts = chestCounts();
    const want = storeAmt==='all' ? Infinity : storeAmt*unit;
    const n = Math.min(want, dir==='in' ? invGet(id) : (counts[id]||0));
    if(n<=0){ renderStorage('動かせるものがないよ'); return; }
    if(dir==='in'){ invSet(id, invGet(id)-n); counts[id] = (counts[id]||0)+n; }
    else { counts[id] = (counts[id]||0)-n; invSet(id, invGet(id)+n); }
    updateHud(); save();
    renderStorage(`${it.icon}${it.label} ${n}${id==='gold'?'G':'個'}を${dir==='in'?'預けた':'出した'}`);
  }
  function renderStorage(msg){
    document.querySelectorAll('.amtBtn').forEach(b=>{
      const on = String(storeAmt)===b.dataset.amt;
      b.style.background = on ? 'var(--accent)' : ''; b.style.color = on ? '#fff' : '';
    });
    const list = document.getElementById('storageList'); list.innerHTML = '';
    const counts = chestCounts(); let shown = 0;
    for(const it of STORE_ITEMS){
      const inv = invGet(it.id), st = counts[it.id]||0, u = it.id==='gold' ? 'G' : '';
      if(inv<=0 && st<=0) continue;
      shown++;
      const row = document.createElement('div'); row.className = 'shop-item';
      const span = document.createElement('span');
      span.innerHTML = `${it.icon} ${it.label}<br><small>手荷物 ${inv}${u} / 家 ${st}${u}</small>`;
      const box = document.createElement('span');
      const b1 = document.createElement('button'); b1.textContent = '預ける'; b1.onclick = ()=>moveItem(it.id,'in');
      const b2 = document.createElement('button'); b2.textContent = '出す'; b2.onclick = ()=>moveItem(it.id,'out');
      box.appendChild(b1); box.appendChild(document.createTextNode(' ')); box.appendChild(b2);
      row.appendChild(span); row.appendChild(box); list.appendChild(row);
    }
    if(!shown){ const p = document.createElement('p'); p.className = 'sub'; p.textContent = '預けられるものも、預けたものもまだないよ'; list.appendChild(p); }
    document.getElementById('storageInfo').textContent = msg || '';
  }
  document.querySelectorAll('.amtBtn').forEach(b=>b.addEventListener('click', ()=>{
    storeAmt = b.dataset.amt==='all' ? 'all' : +b.dataset.amt; renderStorage();
  }));
  document.getElementById('openStorage').onclick = ()=>{
    document.getElementById('sleepModal').classList.remove('open');
    document.getElementById('storageModal').classList.add('open');
    renderStorage();
  };
  document.getElementById('closeStorage').onclick = ()=>document.getElementById('storageModal').classList.remove('open');

  // ---- House construction site (north map) ----
  const SITE_COST = { gold:2500, wood:50, stone:40, iron:15 };
  const SITE_ICON = { gold:'💰', wood:'🪵', stone:'🪨', iron:'🔩' };
  function siteConds(){
    const lv = Math.max(state.toolLevel, state.axeLevel, state.pickLevel);
    return [
      { label:'牛を2頭以上飼う', ok: state.cows.length>=2, now:`${state.cows.length}/2頭` },
      { label:'いずれかの道具をLv3にする', ok: lv>=3, now:`最高Lv${lv}` },
      { label:'作物を累計20個収穫する', ok: (state.totalHarvest||0)>=20, now:`${state.totalHarvest||0}/20個` },
    ];
  }
  function siteReady(){
    return siteConds().every(c=>c.ok) && Object.keys(SITE_COST).every(k=>state[k]>=SITE_COST[k]);
  }
  function renderSite(msg){
    const list = document.getElementById('siteList');
    list.innerHTML = '';
    const add = (ok, text)=>{
      const row = document.createElement('div'); row.className = 'shop-item';
      const span = document.createElement('span'); span.textContent = (ok?'✅ ':'⬜ ') + text;
      row.appendChild(span); list.appendChild(row);
    };
    for(const c of siteConds()) add(c.ok, `${c.label}(${c.now})`);
    for(const k of Object.keys(SITE_COST)) add(state[k]>=SITE_COST[k], `${SITE_ICON[k]} ${SITE_COST[k]}${k==='gold'?'G':'個'}を渡す(所持${state[k]})`);
    document.getElementById('siteInfo').textContent = msg || (siteReady() ? '準備OK!建設できるよ' : 'まだ条件・材料が足りないよ');
  }
  function openSite(){ document.getElementById('siteModal').classList.add('open'); renderSite(); }
  document.getElementById('closeSite').onclick = ()=>document.getElementById('siteModal').classList.remove('open');
  document.getElementById('buildHouse').onclick = ()=>{
    if(!siteReady()){ renderSite('まだ条件・材料が足りないよ'); return; }
    for(const k of Object.keys(SITE_COST)) state[k] -= SITE_COST[k];
    state.northHouse = true;
    document.getElementById('siteModal').classList.remove('open');
    updateHud(); save();
    setMsg('🏠 家が完成した!家でアクションすると1日を過ごせるよ');
  };

  const DAY_SEC = 120;   // one in-game day = 2 real minutes
  function sleep(auto){
    const isRain = Math.random() < 0.3;
    Object.values(state.tiles).forEach(t=>{
      if(t.planted && (t.watered || isRain) && t.growth<3){ t.growth++; }
      t.watered = false;
    });
    if(state.chicken.fed){ state.chicken.eggReady = true; }
    state.chicken.fed = false;
    for(const c of state.cows){ if(c.fed) c.milkReady = true; c.fed = false; }
    for(const c of state.sheep){ if(c.fed) c.woolReady = true; c.fed = false; }
    state.day++;
    for(const k of Object.keys(state.chopped)){
      const pk = parseKey(k), x = pk.x, y = pk.y;
      const near = pk.map===state.map && Math.abs(state.px-x)<1 && Math.abs(state.py-y)<1;
      if(state.day - state.chopped[k] >= 5 && !near) delete state.chopped[k];
    }
    for(const k of Object.keys(state.mined)){
      const pk = parseKey(k), x = pk.x, y = pk.y;
      const near = pk.map===state.map && Math.abs(state.px-x)<1 && Math.abs(state.py-y)<1;
      const isGold = MAP_LAYOUTS[pk.map] && MAP_LAYOUTS[pk.map][y] && MAP_LAYOUTS[pk.map][y][x]==='A';
      if(state.day - state.mined[k] >= (isGold ? 7 : 4) && !near) delete state.mined[k];
    }
    for(const k of Object.keys(state.opened||{})){ if(state.day - state.opened[k] >= 14) delete state.opened[k]; }
    for(const k of treeKeys.concat(treeKeysN, treeKeysR)){
      if(state.chopped[k]===undefined && !state.fruit[k] && Math.random()<0.2) state.fruit[k] = true;
    }
    state.dayTime = 0;
    if(auto) setMsg(isRain ? '🌧️ 雨が降った。畑は自動で水やりされたよ' : '☀️ 新しい一日が始まった');
    else setMsg(isRain ? '雨の音…🌧️ 畑は自動で水やりされたよ' : 'おやすみ…🌙 また新しい一日だよ');
    updateHud(); draw(); save();
  }
