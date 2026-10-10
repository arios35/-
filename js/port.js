  // ===== 港町(南の海岸の東) =====
  // ダミーの店や家がたくさん並ぶ町。建物は入れない飾り、町の人は話しかけられない飾り。
  // 道・広場は '=' 、板張りの岸と桟橋は 'w' 、建物や置き物の足もとは '#'(通れない) 、西の出口は '<'
  const PCOLS = 56, PROWS = 40, PORT_SEA_Y = 30;
  const PORT = [];
  for(let y=0;y<PROWS;y++){ const row=[]; for(let x=0;x<PCOLS;x++) row.push('0'); PORT.push(row); }
  function pfr(x0,y0,x1,y1,ch){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ if(PORT[y] && PORT[y][x]!==undefined) PORT[y][x]=ch; } }
  const PORT_BUILDINGS = [], PORT_DECOR = [], PORT_BERTHS = [];
  const PORT_JETTIES = [5,16,27,38,49];                    // 桟橋(2マス幅)の左端x。y=30〜35 へ海に向かって伸びる
  const BUILD_PALS = [
    { roof:'#b5503c', wall:'#ead9a8' }, { roof:'#3f6aa8', wall:'#f2efe6' }, { roof:'#4f8f5a', wall:'#f0e2a0' }, { roof:'#d9843a', wall:'#efe2cc' },
    { roof:'#7a5a9a', wall:'#f3e4e4' }, { roof:'#3a8f8f', wall:'#e8eef0' }, { roof:'#7a4a2a', wall:'#d9c7a0' }, { roof:'#5f6f86', wall:'#e4dcc8' },
    { roof:'#7b6c5a', wall:'#b8a88a' },                    // 8: 倉庫
    { roof:'#2f7f8f', wall:'#f0ead8' },                    // 9: 役場
  ];
  const AWNINGS = [['#d9433a','#f6f1e6'], ['#3a6fb0','#f6f1e6'], ['#4a9a5a','#f6f1e6'], ['#e0a030','#f6f1e6']];
  const PORT_SHOPS_N = [['📚','本屋'], ['🧵','雑貨屋'], ['🔨','鍛冶屋'], ['🕯️','ろうそく屋']];
  const PORT_SHOPS_M = [['🍞','パン屋'], ['🍎','八百屋'], ['👕','服屋'], ['☕','カフェ'], ['💊','薬屋'], ['🥩','肉屋'], ['🧀','チーズ屋'], ['🎁','おみやげ屋'], ['🌸','花屋'], ['📮','郵便局']];
  const PORT_SHOPS_S = [['🐟','魚屋'], ['⚓','船具屋'], ['🍺','酒場'], ['🦀','海鮮食堂'], ['🧂','塩屋'], ['🎣','釣具屋'], ['🍤','屋台食堂']];

  (function buildPort(){
    let seed = 770055;                                         // 固定シード:毎回同じ町
    const rnd = ()=>{ seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const pick = a => a[Math.floor(rnd()*a.length)];

    // 1) 海(南)と、北・西・東のふちの森
    pfr(0,PORT_SEA_Y,PCOLS-1,PROWS-1,'7');
    for(let y=0;y<PORT_SEA_Y;y++) for(let x=0;x<PCOLS;x++) if(y<2 || x<2 || x>=PCOLS-2) PORT[y][x]='9';

    // 2) 通り・広場・岸壁・桟橋
    pfr(2,8,53,9,'=');  pfr(1,17,53,18,'=');  pfr(2,25,53,26,'=');          // 北通り / メインストリート / 港通り
    pfr(14,8,15,28,'='); pfr(27,8,28,28,'='); pfr(40,8,41,28,'=');          // 南北の通り(まん中のは役場から桟橋へまっすぐ)
    pfr(2,27,53,28,'=');                                                    // 市場の並び+岸壁
    pfr(2,29,53,29,'w');                                                    // 板張りの岸(海のふち)
    pfr(22,10,33,24,'=');                                                   // 中央広場
    for(const jx of PORT_JETTIES) pfr(jx,PORT_SEA_Y,jx+1,35,'w');           // 桟橋
    PORT[17][0]='<'; PORT[18][0]='<';                                       // 海岸へ戻る西の出口

    // 3) 船を停められる場所(桟橋と桟橋のあいだ)。boat が null のところは空き
    const slips = [[2,4],[7,15],[18,26],[29,37],[40,48],[51,55]];
    const boats = ['row', null, 'fishing', null, 'sail', null];
    slips.forEach(([a,b],i)=>PORT_BERTHS.push({ id:i+1, x0:a, x1:b, y0:PORT_SEA_Y, y1:35, boat:boats[i] }));

    // 4) 建物
    const doorFront = new Set();
    function addBuilding(o){
      o.wallRows = o.h>=4 ? 2 : 1; o.roofRows = o.h - o.wallRows;
      for(let yy=o.y; yy<o.y+o.h; yy++) for(let xx=o.x; xx<o.x+o.w; xx++) PORT[yy][xx]='#';
      doorFront.add((o.x+o.door)+','+(o.y+o.h));
      if(o.type==='hall' || o.type==='warehouse') doorFront.add((o.x+o.door+1)+','+(o.y+o.h));
      PORT_BUILDINGS.push(o);
    }
    function addDecor(type,x,y,w,h,solid,extra){
      const ground = PORT[y][x];
      PORT_DECOR.push(Object.assign({ type, x, y, w, h, ground }, extra||{}));
      if(solid) for(let yy=y; yy<y+h; yy++) for(let xx=x; xx<x+w; xx++) PORT[yy][xx]='#';
    }
    const okTile = (x,y,ch)=> PORT[y] && ch.includes(PORT[y][x]) && !doorFront.has(x+','+y);
    const canPlace = (x,y,w,h,ch)=>{ for(let yy=y; yy<y+h; yy++) for(let xx=x; xx<x+w; xx++) if(!okTile(xx,yy,ch)) return false; return true; };
    let lastPal = -1;
    const nextPal = ()=>{ let p; do{ p = Math.floor(rnd()*8); }while(p===lastPal); lastPal = p; return p; };
    const decks = new Map();                                                 // 店の種類は、一巡するまで同じものを出さない
    function takeShop(list){
      let deck = decks.get(list);
      if(!deck || !deck.length){
        deck = list.slice();
        for(let i=deck.length-1;i>0;i--){ const j = Math.floor(rnd()*(i+1)); const t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
        decks.set(list,deck);
      }
      return deck.pop();
    }
    function fillSegment(x0,x1,bottom,topLimit,mix,shops){
      let x = x0;
      while(x1 - x + 1 >= 2){
        const r = rnd();
        let type = r < mix.house ? 'house' : r < mix.house + mix.shop ? 'shop' : 'warehouse';
        let w = type==='warehouse' ? 4 + Math.floor(rnd()*2) : 2 + Math.floor(rnd()*3);   // 幅 2〜4(細い家も混ぜて、びっしり並べる)。倉庫は 4〜5
        if(x + w - 1 > x1) w = x1 - x + 1;
        if(x1 - (x + w - 1) === 1) w += 1;                                   // 1マスだけ余らせない
        if(type==='warehouse' && w<4) type = 'shop';
        const h = Math.min(bottom - topLimit + 1, 3 + Math.floor(rnd()*4));  // 高さ 3〜6
        const o = { type, x, y:bottom-h+1, w, h, pal: type==='warehouse' ? 8 : nextPal(), awn:Math.floor(rnd()*AWNINGS.length),
                    door: w===2 ? Math.floor(rnd()*2) : w===3 ? 1 : 1 + Math.floor(rnd()*(w-2)), chimney: rnd()<0.6 };
        if(type==='shop'){ const s = takeShop(shops); o.emoji = s[0]; o.name = s[1]; }
        else if(type==='warehouse'){ o.emoji = '📦'; o.name = '倉庫'; }
        else o.name = '民家';
        addBuilding(o);
        for(let tx=x; tx<x+w; tx++){ const ty = o.y-1; if(ty>=topLimit && rnd()<0.35 && PORT[ty][tx]==='0') addDecor('tree',tx,ty,1,1,true); }   // 裏庭の木
        x += w + (rnd()<0.22 ? 1 : 0);
      }
    }
    const mixN = { house:0.85, shop:0.15 }, mixM = { house:0.45, shop:0.55 }, mixS = { house:0.25, shop:0.47 };
    addBuilding({ type:'hall', x:24, y:2, w:8, h:6, pal:9, door:3, name:'役場', emoji:'🏛️', awn:0, chimney:false });     // 通りの突きあたりの役場
    fillSegment(3,23,7,2,mixN,PORT_SHOPS_N); fillSegment(32,52,7,2,mixN,PORT_SHOPS_N);                                    // 北の並び
    fillSegment(3,13,16,10,mixM,PORT_SHOPS_M);
    addBuilding({ type:'inn', x:16, y:11, w:6, h:6, pal:3, door:2, name:'宿屋', emoji:'🛏️', awn:1, chimney:true });
    fillSegment(34,39,16,10,mixM,PORT_SHOPS_M); fillSegment(42,52,16,10,mixM,PORT_SHOPS_M);                               // 中の並び
    fillSegment(3,13,24,19,mixS,PORT_SHOPS_S); fillSegment(16,21,24,19,mixS,PORT_SHOPS_S);
    fillSegment(34,39,24,19,mixS,PORT_SHOPS_S); fillSegment(42,52,24,19,mixS,PORT_SHOPS_S);                               // 港側の並び
    addBuilding({ type:'lighthouse', x:51, y:26, w:2, h:4, pal:0, door:0, name:'灯台' });

    // 5) 置き物(街灯・市場・木箱・広場)
    const inVert = x => (x>=13 && x<=16) || (x>=26 && x<=29) || (x>=39 && x<=42);
    for(const [row, xs] of [[9,[5,10,19,36,45,50]], [18,[5,10,19,36,45,50]], [26,[5,10,19,36,45,50]], [28,[5,12,20,24,31,35,44,49]]]){
      for(const x of xs){ if(!inVert(x) && okTile(x,row,'=')) addDecor('lamp',x,row,1,1,true); }
    }
    for(const x of [4,9,19,23,32,36,45,49]){                                  // 市場の屋台
      if(canPlace(x,27,2,1,'=')) addDecor('stall',x,27,2,1,true,{ awn:Math.floor(rnd()*AWNINGS.length), goods:Math.floor(rnd()*4) });
    }
    for(const x of [3,8,11,17,21,31,34,37,43,47,51]){                          // 岸壁の木箱・樽
      if(!inVert(x) && canPlace(x,28,1,1,'=')) addDecor(rnd()<0.5 ? 'crate' : 'barrel',x,28,1,1,true);
    }
    addDecor('fountain',27,17,2,2,true);                                       // 広場の噴水(井戸と同じく使える。足もとの4マスは 'k' = 井戸のマス)
    pfr(27,17,28,18,'k');
    for(const [x,y] of [[22,10],[33,10],[22,24],[33,24]]) if(okTile(x,y,'=')) addDecor('tree',x,y,1,1,true);
    for(const [x,y] of [[24,13],[30,13],[24,21],[30,21]]) if(canPlace(x,y,2,1,'=')) addDecor('bench',x,y,2,1,true);
    for(const [x,y] of [[23,16],[32,16],[23,19],[32,19]]) if(okTile(x,y,'=')) addDecor('lamp',x,y,1,1,true);
    const jcol = new Set(); for(const jx of PORT_JETTIES){ jcol.add(jx); jcol.add(jx+1); }
    for(let x=3; x<=52; x+=3){ if(!jcol.has(x) && PORT[29][x]==='w') addDecor('bollard',x,29,1,1,false); }      // 岸の係船柱
    for(const jx of PORT_JETTIES) for(const [x,y] of [[jx,32],[jx+1,32],[jx,35],[jx+1,35]]) addDecor('bollard',x,y,1,1,false);
    PORT_BERTHS.forEach(b=>{ const cx = Math.floor((b.x0+b.x1)/2); if(PORT[29][cx]==='w') addDecor('plaque',cx,29,1,1,false,{ label:String(b.id) }); });   // 区画の番号札
  })();

  // ---- 町の人たち(話しかけられない。歩いたり、立ち話をしたり) ----
  let portPeople = [];
  const PEOPLE_SKIN = ['#f2c58a','#ecb98a','#d9a06a','#b97a4a','#8d5a3a','#f7d6b8'];
  const PEOPLE_HAIR = ['#2a1f18','#4a3020','#6b4a2a','#8a4a3a','#c9a050','#d8d0c0','#2f3a4a','#a03a2a'];
  const PEOPLE_SHIRT = ['#d9433a','#3a6fb0','#4a9a5a','#e0a030','#8a5ab0','#e07a9a','#3aa0a0','#f0ece0','#c06a3a','#6a7a8a'];
  const PEOPLE_PANTS = ['#4a3a2a','#3a4a6a','#5a5a5a','#2f3f2f','#6a4a3a'];
  const pickOf = a => a[Math.floor(Math.random()*a.length)];
  function portWalkable(x,y){                                   // 足もと4点が、道か板張りの上にあるか
    for(const [cx,cy] of [[x+0.3,y+0.65],[x+0.7,y+0.65],[x+0.3,y+0.95],[x+0.7,y+0.95]]){
      const row = PORT[Math.floor(cy)], c = row && row[Math.floor(cx)];
      if(c!=='=' && c!=='w') return false;
    }
    return true;
  }
  function spawnPortPeople(){
    portPeople = [];
    const all = [], plaza = [], harbor = [];
    for(let y=0;y<PROWS;y++) for(let x=0;x<PCOLS;x++){
      const c = PORT[y][x]; if(c!=='=' && c!=='w') continue;
      if(x<9 && y>=15 && y<=20) continue;                      // 入口のまわりは空けておく
      all.push([x,y]);
      if(x>=22 && x<=33 && y>=10 && y<=24) plaza.push([x,y]);
      if(y>=27) harbor.push([x,y]);
    }
    const shuffle = a=>{ for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    const spots = shuffle(plaza.slice()).slice(0,16).concat(shuffle(harbor.slice()).slice(0,12), shuffle(all.slice()).slice(0,20));
    spots.forEach(([x,y],i)=>{
      const kind = i%7===0 ? 'sailor' : i%9===0 ? 'kid' : i%5===0 ? 'merchant' : 'villager';
      const pal = { H:pickOf(PEOPLE_HAIR), S:pickOf(PEOPLE_SKIN), E:'#2a2118', B:pickOf(PEOPLE_SHIRT), P:pickOf(PEOPLE_PANTS), O:'#2a2118' };
      if(kind==='sailor'){ pal.B = '#2b4f9a'; pal.P = '#f2f2f2'; }
      portPeople.push({ x:x+Math.random()*0.3, y, kind, pal, scale: kind==='kid' ? 0.78 : 1, walker: Math.random()<0.7,
                        speed: (kind==='kid' ? 1.1 : 0.55) + Math.random()*0.35, vx:0, vy:0, t:Math.random()*2, face: Math.random()<0.5 ? 1 : -1, phase:Math.random()*6.28 });
    });
  }
  function updatePortPeople(dt){
    if(state.map!=='port') return;
    for(const p of portPeople){
      if(!p.walker) continue;
      p.t -= dt;
      if(p.t<=0){
        p.t = 1.2 + Math.random()*3.2;
        if(Math.random()<0.3){ p.vx = 0; p.vy = 0; }
        else { const d = [[1,0],[-1,0],[0,1],[0,-1]][Math.floor(Math.random()*4)]; p.vx = d[0]*p.speed; p.vy = d[1]*p.speed; }
        if(p.vx) p.face = p.vx>0 ? 1 : -1;
      }
      const nx = p.x + p.vx*dt, ny = p.y + p.vy*dt;
      if(portWalkable(nx,p.y)) p.x = nx; else if(p.vx){ p.vx = -p.vx; p.face = -p.face; }       // ぶつかったら向きを変える
      if(portWalkable(p.x,ny)) p.y = ny; else if(p.vy){ p.vy = -p.vy; }
    }
  }
