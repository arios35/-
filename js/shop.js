  // ---- North material shop (sells wood / stone / iron only) ----
  const MAT_PRICE = { wood:5, stone:8, iron:30, goldOre:150 };
  const MAT_ICON = { wood:'🪵', stone:'🪨', iron:'🔩', goldOre:'🥇' };
  function renderNorthShop(msg){
    let total = 0;
    for(const m of Object.keys(MAT_PRICE)){
      document.getElementById('ns_'+m).textContent = `×${state[m]||0}(1個${MAT_PRICE[m]}G)`;
      total += (state[m]||0)*MAT_PRICE[m];
    }
    document.getElementById('northShopInfo').textContent = msg || `全部売ると +${total}G / 所持金 ${state.gold}G`;
  }
  function openNorthShop(){ document.getElementById('northShopModal').classList.add('open'); renderNorthShop(); }
  function sellMats(list){
    let total = 0; const sold = [];
    for(const m of list){
      const n = state[m]||0;
      if(n>0){ total += n*MAT_PRICE[m]; sold.push(MAT_ICON[m]+n); state[m] = 0; }
    }
    if(total===0){ renderNorthShop('売れる素材がないよ'); return; }
    state.gold += total;
    updateHud(); save();
    renderNorthShop(`${sold.join(' ')} 売れて+${total}G!`);
  }
  document.querySelectorAll('.nsSell').forEach(btn=>{
    btn.addEventListener('click', ()=>sellMats([btn.dataset.mat]));
  });
  document.getElementById('nsSellAll').onclick = ()=>sellMats(Object.keys(MAT_PRICE));
  document.getElementById('closeNorthShop').onclick = ()=>document.getElementById('northShopModal').classList.remove('open');

  document.querySelectorAll('.seed').forEach(el=>{
    el.addEventListener('pointerdown', (e)=>{
      e.preventDefault();
      const k = el.dataset.crop;
      state.selectedCrop = k; updateHud(); save();
      setMsg(`${CROPS[k].label}の種を選んだ${CROPS[k].emoji}(植えるのはこの種)`);
    });
  });

  function inventorySummary(){
    const cropsStr = Object.keys(CROPS).map(k=>`${CROPS[k].emoji}${state.harvestedByType[k]||0}`).join(' ');
    const seedsStr = Object.keys(CROPS).map(k=>`${CROPS[k].emoji}${state.seedsByType[k]||0}`).join(' ');
    return `種: ${seedsStr} / 収穫物: ${cropsStr} / 🪵${state.wood} 🪨${state.stone} 🔩${state.iron} 🥇${state.goldOre||0} 🍊${state.mikan} 🥛${state.milk} 🧶${state.wool||0} 🍄${state.mushroom||0} 🐟${fishCount()} / 卵: ${state.eggs}個`;
  }

  function openShop(){
    document.getElementById('shopModal').classList.add('open');
    document.getElementById('shopInfo').textContent = inventorySummary();
    document.getElementById('toolLv').textContent = state.toolLevel;
  }
  function closeShop(){ document.getElementById('shopModal').classList.remove('open'); }

  document.querySelectorAll('.buySeed').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const crop = btn.dataset.crop;
      const cost = CROPS[crop].seedCost;
      if(state.gold<cost){ setMsg('お金が足りないよ'); return; }
      state.gold -= cost;
      state.seedsByType[crop] = (state.seedsByType[crop]||0) + 1;
      state.selectedCrop = crop;
      updateHud();
      document.getElementById('shopInfo').textContent = `${CROPS[crop].label}の種を買って選択したよ${CROPS[crop].emoji} / ${inventorySummary()}`;
      save();
    });
  });
  document.getElementById('sellCrop').onclick = ()=>{
    let total = 0, sold = [];
    for(const k of Object.keys(CROPS)){
      const n = state.harvestedByType[k]||0;
      if(n>0){ total += n*CROPS[k].sellPrice; sold.push(`${CROPS[k].emoji}${n}`); state.harvestedByType[k] = 0; }
    }
    if(state.mikan>0){ total += state.mikan*12; sold.push(`🍊${state.mikan}`); state.mikan = 0; }
    if(state.milk>0){ total += state.milk*30; sold.push(`🥛${state.milk}`); state.milk = 0; }
    if((state.wool||0)>0){ total += state.wool*45; sold.push(`🧶${state.wool}`); state.wool = 0; }
    if((state.mushroom||0)>0){ total += state.mushroom*MUSH_PRICE; sold.push(`🍄${state.mushroom}`); state.mushroom = 0; }
    for(const k of Object.keys(FISH)){
      const n = state.fish[k]||0;
      if(n>0){ total += n*FISH[k].price; sold.push(`${FISH[k].emoji}${n}`); state.fish[k] = 0; }
    }
    if(total===0){ setMsg('売れるものがないよ'); return; }
    state.gold += total;
    updateHud();
    document.getElementById('shopInfo').textContent = `${sold.join(' ')} 売れて+${total}G!`;
    save();
  };
  document.getElementById('sellEgg').onclick = ()=>{
    if(state.eggs<=0){ setMsg('売れる卵がないよ'); return; }
    state.eggs--; state.gold += 15;
    updateHud();
    document.getElementById('shopInfo').textContent = `卵が売れたよ🥚 / ${inventorySummary()}`;
    save();
  };
  document.getElementById('upgradeTool').onclick = ()=>{
    if(state.toolLevel>=3){ setMsg('鍬はもう最大まで強化してるよ'); return; }
    const cost = state.toolLevel*250;
    if(state.gold<cost){ setMsg(`お金が足りないよ(${cost}G必要)`); return; }
    state.gold -= cost; state.toolLevel++;
    updateHud();
    document.getElementById('toolLv').textContent = state.toolLevel;
    document.getElementById('shopInfo').textContent = `鍬がLv${state.toolLevel}になったよ!一度に${state.toolLevel===2?'5':'9'}マス作業できるよ`;
    save();
  };
  document.getElementById('closeShop').onclick = closeShop;

  // ---- 南の海岸の作物屋(作物だけを扱う店。小麦とトマトの種は置いていない) ----
  const CROP_SHOP_SEEDS = ['corn','carrot'];
  function cropStock(){ let n = 0, total = 0; for(const k of Object.keys(CROPS)){ const c = state.harvestedByType[k]||0; n += c; total += c*CROPS[k].sellPrice; } return { n, total }; }
  function renderCropShop(msg){
    const list = document.getElementById('cropShopSeeds'); list.innerHTML = '';
    for(const k of CROP_SHOP_SEEDS){
      const c = CROPS[k], row = document.createElement('div'); row.className = 'shop-item';
      const span = document.createElement('span'); span.textContent = `${c.emoji} ${c.label}の種 (${c.seedCost}G)`;
      const b = document.createElement('button'); b.textContent = '買う'; b.onclick = ()=>buyCropShopSeed(k);
      row.appendChild(span); row.appendChild(b); list.appendChild(row);
    }
    const st = cropStock();
    document.getElementById('cs_crops').textContent = `${st.n}個 → ${st.total}G`;
    document.getElementById('cropShopInfo').textContent = msg || `所持金: ${state.gold}G`;
  }
  function openCropShop(){ document.getElementById('cropShopModal').classList.add('open'); renderCropShop(); }
  function buyCropShopSeed(k){
    const c = CROPS[k];
    if(state.gold<c.seedCost){ renderCropShop('お金が足りないよ'); return; }
    state.gold -= c.seedCost; state.seedsByType[k] = (state.seedsByType[k]||0) + 1; state.selectedCrop = k;
    updateHud(); save();
    renderCropShop(`${c.label}の種を買って選択したよ${c.emoji}(所持${state.seedsByType[k]})`);
  }
  document.getElementById('csSellCrops').onclick = ()=>{
    let total = 0; const sold = [];
    for(const k of Object.keys(CROPS)){
      const n = state.harvestedByType[k]||0;
      if(n>0){ total += n*CROPS[k].sellPrice; sold.push(`${CROPS[k].emoji}${n}`); state.harvestedByType[k] = 0; }
    }
    if(!total){ renderCropShop('売れる作物がないよ'); return; }
    state.gold += total; updateHud(); save();
    renderCropShop(`${sold.join(' ')} 売れて+${total}G!`);
  };
  document.getElementById('closeCropShop').onclick = ()=>document.getElementById('cropShopModal').classList.remove('open');
