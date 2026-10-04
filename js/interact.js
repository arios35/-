  function action(){
    if(wellAnim) return;
    if(state.map==='dungeon'){ attackAction(); return; }
    const cur = tileAt(tileX(), tileY());
    if(cur==='1'){ farmAction(); return; }
    if(cur==='F'){ fishAction(); return; }
    if(nearAny(SHOP_CHARS)){ if(state.map==='north') openNorthShop(); else if(state.map==='river') openFishShop(); else if(state.map==='coast') openCropShop(); else openShop(); return; }
    if(nearType('4')){ talkNPC(); return; }
    if(nearType('5')){ chickenAction(); return; }
    if(state.map==='home' && nearRanch()){ ranchAction(); return; }
    if(state.map==='home' && nearSheepRanch()){ sheepAction(); return; }
    if(nearType('O')){ openEnchant(); return; }
    const wk = findNear('k'), gd = findNear('D');
    if(wk && !(gd && gd[2] < wk[2])){ openWell(); return; }   // next to both the well and the locked stairs: the nearer one
    if(nearAny(GATE_CHARS)){ openGate(['G','Z','T','D','J'].find(c=>findNear(c))); return; }
    if(nearAny(HOUSE_CHARS)){ openSleep(); return; }
    if(nearAny(SITE_CHARS)){ openSite(); return; }
    if(nearAny(WORK_CHARS)){ openCraft(); return; }
    const tr = findNear('6'), rk = findNear('g'), ga = findNear('A'), ch = findNear('Y'), mu = findNear('P');
    const cands = [[tr,treeAction],[rk,rockAction],[ga,goldAction],[ch,chestAction],[mu,mushroomAction]].filter(c=>c[0]);
    if(cands.length){
      cands.sort((a,b)=>a[0][2]-b[0][2]);
      cands[0][1](cands[0][0]);
      return;
    }
    setMsg('ここでは何もできないみたい');
  }

  function nearRanch(){
    const tx = tileX(), ty = tileY();
    return tx>=19 && tx<=25 && ty>=1 && ty<=8;
  }
  function ranchAction(){
    const cows = state.cows;
    if(!cows.length){ setMsg('ここは牧場。お店で牛を買うとここに来るよ🐄'); return; }
    let milk = 0;
    for(const c of cows){ if(c.milkReady){ c.milkReady = false; milk++; addEffect(Math.round(c.x),Math.round(c.y),'water'); } }
    if(milk){ state.milk += milk; setMsg(`牛乳を${milk}本搾った🥛`); updateHud(); save(); return; }
    let fed = 0, short = 0;
    for(const c of cows){
      if(c.fed) continue;
      if((state.harvestedByType.wheat||0)>0){ state.harvestedByType.wheat--; c.fed = true; fed++; addEffect(Math.round(c.x),Math.round(c.y),'plant'); }
      else short++;
    }
    if(fed) setMsg(`小麦を${fed}頭にあげたよ🌾` + (short ? `(あと${short}頭ぶん小麦が足りない)` : ''));
    else if(short) setMsg('小麦がないよ。畑で育てよう🌾');
    else setMsg('みんなお腹いっぱいだよ');
    updateHud(); save();
  }
  function updateCows(dt){
    for(const c of state.cows){
      c.t = (c.t||0) - dt;
      if(c.t<=0){
        c.t = 1 + Math.random()*2.5;
        if(Math.random()<0.4){ c.vx = 0; c.vy = 0; }
        else { const a = Math.random()*Math.PI*2; c.vx = Math.cos(a)*0.55; c.vy = Math.sin(a)*0.55; }
        if(c.vx) c.face = c.vx>0 ? 1 : -1;
      }
      c.x = Math.min(23, Math.max(20, c.x + (c.vx||0)*dt));
      c.y = Math.min(6, Math.max(3, c.y + (c.vy||0)*dt));
    }
  }
  // ---- Sheep pasture (sheep only; they eat tomatoes, give wool) ----
  function nearSheepRanch(){
    const tx = tileX(), ty = tileY();
    return tx>=19 && tx<=25 && ty>=9 && ty<=15;
  }
  function sheepAction(){
    const list = state.sheep;
    if(!list.length){ setMsg('ここは羊の牧場。お店で羊を買うとここに来るよ🐑'); return; }
    let wool = 0;
    for(const sh of list){ if(sh.woolReady){ sh.woolReady = false; wool++; addEffect(Math.round(sh.x),Math.round(sh.y),'pick'); } }
    if(wool){ state.wool = (state.wool||0) + wool; setMsg(`羊毛を${wool}個刈り取った🧶`); updateHud(); save(); return; }
    let fed = 0, short = 0;
    for(const sh of list){
      if(sh.fed) continue;
      if((state.harvestedByType.tomato||0)>0){ state.harvestedByType.tomato--; sh.fed = true; fed++; addEffect(Math.round(sh.x),Math.round(sh.y),'plant'); }
      else short++;
    }
    if(fed) setMsg(`トマトを${fed}頭にあげたよ🍅` + (short ? `(あと${short}頭ぶんトマトが足りない)` : ''));
    else if(short) setMsg('トマトがないよ。畑で育てよう🍅');
    else setMsg('みんなお腹いっぱいだよ');
    updateHud(); save();
  }
  function updateSheep(dt){
    for(const c of state.sheep){
      c.t = (c.t||0) - dt;
      if(c.t<=0){
        c.t = 1 + Math.random()*2.5;
        if(Math.random()<0.4){ c.vx = 0; c.vy = 0; }
        else { const a = Math.random()*Math.PI*2; c.vx = Math.cos(a)*0.5; c.vy = Math.sin(a)*0.5; }
        if(c.vx) c.face = c.vx>0 ? 1 : -1;
      }
      c.x = Math.min(23, Math.max(20, c.x + (c.vx||0)*dt));
      c.y = Math.min(14, Math.max(11, c.y + (c.vy||0)*dt));
    }
  }
  function drawSheep(x,y,face,hungry,wool){
    const u = TILE/16;
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(x+TILE/2, y+TILE-2, TILE*0.34, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.save();
    ctx.translate(x+TILE/2, y); ctx.scale(face,1); ctx.translate(-TILE/2, 0);
    ctx.fillStyle = '#4a4038';
    ctx.fillRect(4*u,11*u,2*u,4*u); ctx.fillRect(9*u,11*u,2*u,4*u);           // legs
    if(wool){
      ctx.fillStyle = '#fbfbf6';
      for(const [cx,cy,r] of [[5,8.5,3.8],[8,6.8,4],[10.6,8.4,3.6],[7,10,3.6]]){
        ctx.beginPath(); ctx.arc(cx*u, cy*u, r*u, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = '#e6e6dc'; ctx.fillRect(4*u,11*u,7*u,1*u);
    } else {
      ctx.fillStyle = '#e9d9c4'; ctx.fillRect(3*u,7*u,9*u,4*u);                // sheared body
    }
    ctx.fillStyle = '#3f3630'; ctx.fillRect(11*u,5*u,4*u,5*u);                 // head
    ctx.fillStyle = '#f4efe6'; ctx.fillRect(13*u,6*u,1*u,1*u);                 // eye
    ctx.restore();
    if(wool || hungry){
      ctx.font = Math.round(TILE*0.55)+'px sans-serif';
      ctx.fillText(wool ? '🧶' : '🍅', x+TILE*0.2, y-2);
    }
  }
  function drawCow(x,y,face,hungry,milk){
    const u = TILE/16;
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(x+TILE/2, y+TILE-2, TILE*0.36, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.save();
    ctx.translate(x+TILE/2, y); ctx.scale(face,1); ctx.translate(-TILE/2, 0);
    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(2*u,5*u,10*u,6*u);          // body
    ctx.fillRect(3*u,11*u,2*u,4*u); ctx.fillRect(9*u,11*u,2*u,4*u); // legs
    ctx.fillRect(11*u,3*u,4*u,6*u);          // head
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(4*u,5*u,3*u,3*u); ctx.fillRect(9*u,8*u,3*u,3*u);   // spots
    ctx.fillRect(3*u,14*u,2*u,1*u); ctx.fillRect(9*u,14*u,2*u,1*u); // hooves
    ctx.fillRect(1*u,5*u,1*u,4*u);           // tail
    ctx.fillRect(13*u,4*u,1*u,1*u);          // eye
    ctx.fillStyle = '#e8a0a0'; ctx.fillRect(14*u,7*u,2*u,2*u); // nose
    ctx.fillStyle = '#e0d0a0'; ctx.fillRect(12*u,2*u,1*u,1*u); ctx.fillRect(14*u,2*u,1*u,1*u); // horns
    ctx.restore();
    if(milk || hungry){
      ctx.font = Math.round(TILE*0.55)+'px sans-serif';
      ctx.fillText(milk ? '🥛' : '🌾', x+TILE*0.2, y-2);
    }
  }

  const npcLines = [
    '今日もいい天気だね〜',
    '畑仕事は順調?',
    'お店で種を買えるよ🏪',
    'たまには休むのも大事だよ',
    '家でアクションすると、1日を過ごせるよ🛏️',
    '左下の門の先に川の国があるよ(通行料2000G)',
    'この村、のんびりしてていいでしょ',
    'ニワトリにもエサあげてる?',
    '雨の日は水やりしなくても育つらしいよ',
    '牛の牧場の南に羊の牧場があるよ。羊のエサはトマトなんだ🍅'
  ];
  const riverLines = [
    '川の国の南の端に門があるよ。その先は海岸なんだ(通行料3000G)🏖️',
    '釣りは西と東、ふたつの桟橋でできるよ🎣',
    '東の湖の魚はレアなのが多いんだ。竿を強化するともっと釣れるよ',
    '西の釣具屋は魚を高く買ってくれるよ。きのこも買い取りだ🍄',
    '森にはきのこが生えてるよ。採っても、しばらくするとまた生える',
    '東の湖の桟橋の先の小島に、宝箱があるらしいよ',
    '宝箱は森の奥にも隠れてる。開けても、二週間たつとまた中身が入るんだって',
    '糸をたらして、「❗」が出たらすぐアクションだよ',
    'いくつも橋を渡った先にいい釣り場があるよ',
    '大ナマズは滅多に釣れない。釣れたら大金だ',
    '釣った魚はお店で売れるよ'
  ];
  const northLines = [
    'ここの岩は硬いけど、鉄が出やすいんだ',
    '奥の採石場は宝の山さ',
    '作業台はここにもあるよ。素材が貯まったら強化してくといい',
    '西の森は木が密集してて、みかんも実りやすいんだ',
    '池のまわりは静かでね、昼寝にちょうどいい',
    '南の抜け道から村に戻れるよ',
    '南の建設予定地に家が建つらしいよ。材料と条件をそろえてね🏠',
    '一番上の門の先に洞窟があるらしいよ(通行料5000G)🕳️',
    '洞窟の一番奥に、地下へ続く階段があるって噂だよ(10000G)🪜',
    '建設予定地の東に素材屋があるよ。木材・石・鉄をまとめて売れるんだ🏪'
  ];
  const coastLines = [
    '潮風が気持ちいいでしょ。ここは世界の南の果ての海岸だよ🌊',
    '西も南も、見渡すかぎり海さ。この先には行けないんだ',
    '浜辺のどこかに宝箱が埋まってるって噂だよ。開けても二週間たつとまた中身が入るらしい',
    '砂浜は歩きやすいけど、波打ち際には近づきすぎないようにね',
    '夕日が海に沈むところは最高なんだ。何度見ても飽きないよ',
    '井戸があるから、他の井戸の場所とすぐ行き来できるよ',
    '木のそばにはきのこも生えてるよ🍄',
    '西の桟橋では海の魚が釣れるよ。東の湖と同じで、レアな魚が多いんだ🎣',
    '東と北西と南東に広い畑があるよ。クワを強化すると、まとめて耕せて楽だよ🌾',
    '釣った魚は、川の国の釣具屋が高く買い取ってくれるよ',
    '南の広場に作物屋があるよ。にんじんの種はそこでしか売ってないんだ🥕',
    '作物屋の隣は家の建設予定地さ。畑のそばに家があると、すぐ寝られて便利だよ🏠'
  ];
  function talkNPC(){
    const m = state.map;
    const lines = m==='north' ? northLines : m==='river' ? riverLines : m==='coast' ? coastLines : npcLines;
    setMsg((m==='north' ? '🧔 ' : m==='river' ? '🧓 ' : m==='coast' ? '🧑 ' : '👩 ') + lines[Math.floor(Math.random()*lines.length)]);
  }

  function chickenAction(){
    if(state.chicken.eggReady){
      state.eggs++;
      state.chicken.eggReady = false;
      setMsg('卵を集めたよ🥚');
      updateHud(); save(); return;
    }
    if(state.chicken.fed){
      setMsg('もうエサはあげたよ'); return;
    }
    state.chicken.fed = true;
    setMsg('ニワトリにエサをあげたよ🐔');
    updateHud(); save();
  }
