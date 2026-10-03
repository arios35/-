  const UPG = {
    hoe:  { name:'鍬', icon:'🌱', key:'toolLevel', costs:[{wood:5,stone:10,iron:2},{wood:10,stone:20,iron:6}], desc:['一度に5マス作業','一度に9マス作業'] },
    axe:  { name:'斧', icon:'🪓', key:'axeLevel',  costs:[{stone:8,iron:2},{stone:16,iron:6}], desc:['2回で伐採・木材+1','1回で伐採・木材+2'] },
    pick: { name:'ピッケル', icon:'⛏️', key:'pickLevel', costs:[{wood:8,stone:6,iron:1},{wood:15,stone:14,iron:5}], desc:['6回で採掘・鉄が出やすい','4回で採掘・鉄がさらに出やすい'] },
  };
  function costStr(c){ return [c.wood&&`🪵${c.wood}`, c.stone&&`🪨${c.stone}`, c.iron&&`🔩${c.iron}`].filter(Boolean).join(' '); }
  function renderCraft(msg){
    const list = document.getElementById('craftList');
    list.innerHTML = '';
    for(const id of Object.keys(UPG)){
      const u = UPG[id], lv = state[u.key];
      const row = document.createElement('div'); row.className = 'shop-item';
      const span = document.createElement('span');
      if(lv>=3){ span.textContent = `${u.icon} ${u.name} Lv3 (最大)`; row.appendChild(span); }
      else{
        span.innerHTML = `${u.icon} ${u.name} Lv${lv}→${lv+1}<br><small>${u.desc[lv-1]}<br>${costStr(u.costs[lv-1])}</small>`;
        const b = document.createElement('button'); b.textContent = '強化';
        b.onclick = ()=>upgradeTool(id);
        row.appendChild(span); row.appendChild(b);
      }
      list.appendChild(row);
    }
    const swRow = document.createElement('div'); swRow.className = 'shop-item';
    const swSpan = document.createElement('span');
    if(state.sword){
      const lv = state.swordLevel||1;
      if(lv>=5){ swSpan.textContent = '⚔️ 剣 Lv5 (最大)'; swRow.appendChild(swSpan); }
      else{
        swSpan.innerHTML = `⚔️ 剣 Lv${lv}→${lv+1}<br><small>攻撃力 ${SWORD_DMG[lv-1]}→${SWORD_DMG[lv]} / 振りも速くなる<br>${swordCostStr(SWORD_UP[lv])}</small>`;
        const b = document.createElement('button'); b.textContent = '強化'; b.onclick = upgradeSword;
        swRow.appendChild(swSpan); swRow.appendChild(b);
      }
    }
    else{
      swSpan.innerHTML = `⚔️ 剣を作る<br><small>ダンジョンで敵を倒せる<br>${costStr(SWORD_COST)}</small>`;
      const b = document.createElement('button'); b.textContent = '作る'; b.onclick = craftSword;
      swRow.appendChild(swSpan); swRow.appendChild(b);
    }
    list.appendChild(swRow);
    document.getElementById('craftInfo').textContent = msg || `所持: 🪵${state.wood} 🪨${state.stone} 🔩${state.iron}`;
  }
  function upgradeTool(id){
    const u = UPG[id], lv = state[u.key];
    if(lv>=3) return;
    const c = u.costs[lv-1];
    if((c.wood||0)>state.wood || (c.stone||0)>state.stone || (c.iron||0)>state.iron){ renderCraft('素材が足りないよ'); return; }
    state.wood -= c.wood||0; state.stone -= c.stone||0; state.iron -= c.iron||0;
    state[u.key]++;
    updateHud(); save();
    renderCraft(`${u.name}がLv${state[u.key]}になった!`);
  }
  const SWORD_COST = { wood:5, stone:10, iron:5 };
  function craftSword(){
    if(state.sword) return;
    const c = SWORD_COST;
    if(c.wood>state.wood || c.stone>state.stone || c.iron>state.iron){ renderCraft('素材が足りないよ'); return; }
    state.wood -= c.wood; state.stone -= c.stone; state.iron -= c.iron;
    state.sword = true; state.swordLevel = 1;
    updateHud(); save();
    renderCraft('剣を作った!ダンジョンでアクションを押すと振れるよ⚔️');
  }
  const SWORD_UP = [null,
    { wood:10, stone:15, iron:8 },                      // Lv1 -> 2
    { stone:25, iron:15, goldOre:2 },                   // Lv2 -> 3
    { iron:25, goldOre:6, gold:1500 },                  // Lv3 -> 4
    { iron:40, goldOre:12, gold:5000 },                 // Lv4 -> 5
  ];
  function swordCostStr(c){
    return [c.wood&&`🪵${c.wood}`, c.stone&&`🪨${c.stone}`, c.iron&&`🔩${c.iron}`, c.goldOre&&`🥇${c.goldOre}`, c.gold&&`💰${c.gold}G`].filter(Boolean).join(' ');
  }
  function upgradeSword(){
    const lv = state.swordLevel||1;
    if(!state.sword || lv>=5) return;
    const c = SWORD_UP[lv];
    if((c.wood||0)>state.wood || (c.stone||0)>state.stone || (c.iron||0)>state.iron || (c.goldOre||0)>(state.goldOre||0) || (c.gold||0)>state.gold){ renderCraft('素材が足りないよ'); return; }
    state.wood -= c.wood||0; state.stone -= c.stone||0; state.iron -= c.iron||0; state.goldOre = (state.goldOre||0) - (c.goldOre||0); state.gold -= c.gold||0;
    state.swordLevel = lv+1;
    updateHud(); save();
    renderCraft(`剣がLv${lv+1}になった!攻撃力${SWORD_DMG[lv]}`);
  }
  function openCraft(){ document.getElementById('craftModal').classList.add('open'); renderCraft(); }
  document.getElementById('closeCraft').onclick = ()=>document.getElementById('craftModal').classList.remove('open');
  document.querySelectorAll('.sellMat').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const m = btn.dataset.mat, price = {wood:5, stone:8, iron:30, goldOre:150}[m];
      if(state[m]<=0){ setMsg('その素材がないよ'); return; }
      state[m]--; state.gold += price;
      updateHud();
      document.getElementById('shopInfo').textContent = `+${price}G / ${inventorySummary()}`;
      save();
    });
  });

  // ---- Magic table: enchant the sword (needs lots of gold ore and assorted goods) ----
  const ENCHANTS = {
    knock: { icon:'💥', name:'ノックバック',
      desc: lv=>`斬った敵を${KNOCK_DIST[lv]}マス弾き飛ばし、${KNOCK_STUN[lv]}秒ひるませる`,
      costs: [
        [['wool',5],['wood',20],['stone',10],['goldOre',4]],
        [['wool',12],['iron',15],['eggs',10],['goldOre',10],['gold',1000]],
        [['wool',25],['iron',30],['milk',15],['goldOre',20],['gold',3000]],
      ] },
    wave: { icon:'🌊', name:'波動',
      desc: lv=>`斬るたびに波動が飛ぶ(威力${Math.round(WAVE_FACTOR[lv]*100)}%・射程${WAVE_RANGE[lv]}マス・貫通)`,
      costs: [
        [['milk',10],['mushroom',10],['iron',10],['goldOre',6]],
        [['milk',20],['mushroom',25],['iron',20],['goldOre',15],['gold',2000]],
        [['milk',30],['fish:carp',5],['iron',35],['goldOre',30],['gold',6000]],
      ] },
    fire: { icon:'🔥', name:'火炎',
      desc: lv=>`斬った敵を${FIRE_DUR[lv]}秒燃やす(毎秒${FIRE_DPS[lv]}ダメージ${lv>=3?'・まわりに燃え移る':''})`,
      costs: [
        [['crop:tomato',10],['crop:corn',10],['wood',30],['goldOre',10]],
        [['crop:tomato',25],['fish:yamame',2],['iron',25],['goldOre',22],['gold',4000]],
        [['crop:tomato',50],['fish:yamame',5],['iron',40],['goldOre',40],['gold',10000]],
      ] },
  };
  function itemInfo(id){ return STORE_ITEMS.find(i=>i.id===id) || { icon:'', label:id }; }
  function renderEnchant(msg){
    const list = document.getElementById('enchantList'); list.innerHTML = '';
    state.enchant = state.enchant || { knock:0, wave:0, fire:0 };
    if(!state.sword){
      const p = document.createElement('p'); p.className = 'sub'; p.textContent = '剣がない…先に作業台で剣を作ろう。'; list.appendChild(p);
    } else {
      for(const id of Object.keys(ENCHANTS)){
        const en = ENCHANTS[id], lv = state.enchant[id]||0;
        const box = document.createElement('div');
        box.style.cssText = 'padding:8px 0;border-bottom:1px dashed var(--sub);font-size:0.85rem;';
        const head = document.createElement('div');
        head.innerHTML = `<b>${en.icon} ${en.name}</b> Lv${lv}${lv>=3 ? ' (最大)' : ''}`;
        box.appendChild(head);
        const now = document.createElement('div'); now.className = 'sub';
        now.textContent = lv>0 ? `いまの効果: ${en.desc(lv)}` : 'まだ付いていない';
        box.appendChild(now);
        if(lv<3){
          const nx = document.createElement('div'); nx.className = 'sub';
          nx.textContent = `Lv${lv+1}の効果: ${en.desc(lv+1)}`;
          box.appendChild(nx);
          for(const [cid,n] of en.costs[lv]){
            const have = invGet(cid), info = itemInfo(cid), u = cid==='gold' ? 'G' : '';
            const line = document.createElement('div'); line.className = 'sub';
            line.textContent = `${have>=n ? '✅' : '⬜'} ${info.icon}${info.label} ${have}${u}/${n}${u}`;
            box.appendChild(line);
          }
          const b = document.createElement('button'); b.className = 'close-shop'; b.textContent = `${en.name} Lv${lv+1} を付与する`;
          b.onclick = ()=>applyEnchant(id);
          box.appendChild(b);
        }
        list.appendChild(box);
      }
    }
    document.getElementById('enchantInfo').textContent = msg || '';
  }
  function applyEnchant(id){
    const en = ENCHANTS[id], lv = state.enchant[id]||0;
    if(!state.sword || lv>=3) return;
    const cost = en.costs[lv];
    if(!cost.every(([cid,n])=>invGet(cid)>=n)){ renderEnchant('材料が足りないよ'); return; }
    for(const [cid,n] of cost) invSet(cid, invGet(cid)-n);
    state.enchant[id] = lv+1;
    updateHud(); save();
    renderEnchant(`${en.icon}${en.name}がLv${lv+1}になった!`);
  }
  function openEnchant(){ document.getElementById('enchantModal').classList.add('open'); renderEnchant(); }
  document.getElementById('closeEnchant').onclick = ()=>document.getElementById('enchantModal').classList.remove('open');
