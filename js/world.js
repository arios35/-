  // World: 0 grass, 1 soil, 2 shop, 3 path, 4 NPC, 5 chicken coop, 6 tree, 7 water
  // ---- 木のばらまき:シード固定の乱数(毎回同じ世界)+ゆるいかたまり(森と空き地)。式のような格子模様が出ないようにする ----
  function hash2(x,y,s){
    let h = Math.imul(x|0, 374761393) ^ Math.imul(y|0, 668265263) ^ Math.imul(s|0, 982451653);
    h = Math.imul(h ^ (h>>>13), 1274126177); h ^= h>>>16;
    return (h>>>0)/4294967296;
  }
  function vnoise(x,y,s,sc){                                  // 0..1 のなめらかなノイズ
    const fx = x/sc, fy = y/sc, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx-x0, ty = fy-y0;
    const sx = tx*tx*(3-2*tx), sy = ty*ty*(3-2*ty);
    const a = hash2(x0,y0,s), b = hash2(x0+1,y0,s), c = hash2(x0,y0+1,s), d = hash2(x0+1,y0+1,s);
    const top = a+(b-a)*sx, bot = c+(d-c)*sx;
    return top+(bot-top)*sy;
  }
  function treeRnd(x,y,seed,density){                          // density = 平均の密度。場所によって 0.15倍〜1.85倍 に濃淡がつく
    const clump = 0.15 + 1.7*vnoise(x,y,seed,5);
    return hash2(x,y,seed+7) < Math.min(0.34, density*clump);
  }
  const layout = [];
  for(let y=0;y<ROWS;y++){ const row=[]; for(let x=0;x<COLS;x++) row.push('0'); layout.push(row); }
  function fillRect(x0,y0,x1,y1,ch){
    for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ if(layout[y] && layout[y][x]!==undefined) layout[y][x]=ch; }
  }
  fillRect(4,3,10,8,'1');            // home farm
  fillRect(3,2,11,2,'8');            // farm fence: north
  fillRect(3,9,11,9,'8');            // farm fence: south
  fillRect(3,3,3,8,'8');             // farm fence: west
  fillRect(11,2,11,18,'3');          // main path spine (reopens east side of farm)
  fillRect(11,6,18,6,'3');           // branch to village
  fillRect(18,6,18,16,'3');          // branch down
  fillRect(18,16,24,16,'3');         // branch to second farm
  fillRect(21,17,26,20,'1');         // second farm plot
  fillRect(2,14,6,17,'7');           // lake
  layout[4][15]='a'; layout[4][16]='b'; layout[4][17]='c'; // shop building: roof (3 tiles)
  layout[5][15]='d'; layout[5][16]='e'; layout[5][17]='f'; // shop building: walls + door (3 tiles)
  layout[4][13]='4';                 // NPC
  layout[8][16]='5';                 // chicken coop
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    if(layout[y][x]==='0' && treeRnd(x,y,11,0.05) && !(x>=19 && x<=25 && y>=1 && y<=15)) layout[y][x]='6'; // scattered trees(牛・羊の牧場まわりは、アクションが世話に取られて木に届かなくなるので避ける)
  }
  // Rocks: scattered plus a rocky quarry area
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    if(layout[y][x]==='0' && (x*5+y*11)%19===0) layout[y][x]='g';
  }
  for(let y=3;y<=8;y++) for(let x=22;x<=28;x++){
    if(layout[y][x]==='0' && (x*3+y*7)%3===0) layout[y][x]='g';
  }
  layout[8][13]='h'; layout[8][14]='i'; // workbench (2 tiles wide, moved 1 south to stay clear of the shop)
  layout[11][7]='l'; layout[11][8]='m'; layout[11][9]='n'; // my house: roof
  layout[12][7]='o'; layout[12][8]='p'; layout[12][9]='q'; // my house: walls + door
  // Keep trees/rocks away from the shop, coop, workbench and NPC
  function clearAround(L,x0,y0,x1,y1,r){
    for(let y=y0-r;y<=y1+r;y++) for(let x=x0-r;x<=x1+r;x++){
      if(L[y] && (L[y][x]==='6'||L[y][x]==='g'||L[y][x]==='P')) L[y][x]='0';
    }
  }
  clearAround(layout,15,4,17,5,3);   // shop
  clearAround(layout,16,8,16,8,3);   // coop
  clearAround(layout,13,8,14,8,3);   // workbench
  clearAround(layout,13,4,13,4,2);   // NPC
  clearAround(layout,7,11,9,12,2);   // my house
  layout[11][14]='k'; clearAround(layout,14,11,14,11,2);   // village well
  // Unbreakable border forest (2 tiles thick)
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    if(x<2||y<2||x>=COLS-2||y>=ROWS-2) layout[y][x]='9';
  }
  // Secret passage in the top-right: leads to the northern map
  fillRect(26,2,27,9,'3');
  fillRect(19,9,27,9,'3');
  layout[1][26]='3'; layout[1][27]='3'; layout[0][26]='u'; layout[0][27]='u';
  // Fenced pasture east of the shop (interior x20-23, y3-6)
  for(let y=2;y<=7;y++) for(let x=19;x<=24;x++){
    layout[y][x] = (x===19||x===24||y===2||y===7) ? '8' : '0';
  }
  layout[7][21]='j';                 // pasture gate (1 tile, walkable by the player)
  // Sheep pasture just south of the secret-passage path (interior x20-23, y11-14)
  for(let y=10;y<=15;y++) for(let x=19;x<=24;x++){
    layout[y][x] = (x===19||x===24||y===10||y===15) ? '8' : '0';
  }
  layout[10][21]='j';                // sheep pasture gate
  clearAround(layout,21,7,21,7,1); clearAround(layout,21,10,21,10,1);   // 牧場の入口に木が生えてふさがないように
  // Toll gate (500G) set between the border trees
  layout[1][26]='G'; layout[1][27]='G';
  // Bottom-left passage to the river area (2000G gate between the border trees)
  fillRect(3,19,11,20,'3');
  fillRect(3,19,4,21,'3');
  layout[22][3]='Z'; layout[22][4]='Z'; layout[23][3]='U'; layout[23][4]='U';
  const treeKeys = [];
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){ if(layout[y][x]==='6') treeKeys.push(x+','+y); }

  // ===== Northern map (mountain & forest) =====
  const HOME = layout;
  const NORTH = [];
  for(let y=0;y<ROWS;y++){ const row=[]; for(let x=0;x<COLS;x++) row.push('0'); NORTH.push(row); }
  function nfr(x0,y0,x1,y1,ch){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ if(NORTH[y] && NORTH[y][x]!==undefined) NORTH[y][x]=ch; } }
  nfr(26,15,27,23,'3');      // corridor from the entrance
  nfr(13,15,27,16,'3');      // west
  nfr(13,8,14,16,'3');       // north
  nfr(13,8,23,9,'3');        // east
  nfr(22,2,23,9,'3');        // up to the quarry (and on to the cave gate)
  nfr(4,12,9,17,'7');        // pond
  nfr(17,11,22,14,'1');      // farm patch
  NORTH[7][16]='h'; NORTH[7][17]='i';  // workbench
  NORTH[7][20]='4';                    // hermit NPC
  NORTH[18][18]='r'; NORTH[18][19]='R'; NORTH[18][20]='x';  // house construction site
  NORTH[19][18]='s'; NORTH[19][19]='S'; NORTH[19][20]='y';
  NORTH[18][22]='a'; NORTH[18][23]='b'; NORTH[18][24]='c';  // material shop: roof
  NORTH[19][22]='d'; NORTH[19][23]='e'; NORTH[19][24]='f';  // material shop: walls + door
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    if(NORTH[y][x]!=='0') continue;
    if(x<=12 && y<=11 && treeRnd(x,y,23,0.26)) NORTH[y][x]='6';        // dense forest (west)
    else if(x>=24 && y>=3 && y<=12 && (x+y*2)%3===0) NORTH[y][x]='g'; // rich quarry (east)
    else if(treeRnd(x,y,29,0.10)) NORTH[y][x]='6';
    else if((x*5+y*11)%17===0) NORTH[y][x]='g';
  }
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    if(y<2) NORTH[y][x]='M';                                   // north edge: mountain range
    else if(x<2||x>=COLS-2||y>=ROWS-2) NORTH[y][x]='9';
  }
  NORTH[1][22]='T'; NORTH[1][23]='T';                          // toll gate to the cave
  NORTH[0][22]='X'; NORTH[0][23]='X';                          // exit to the cave
  NORTH[22][26]='3'; NORTH[22][27]='3'; NORTH[23][26]='v'; NORTH[23][27]='v';
  clearAround(NORTH,16,7,17,7,2);
  clearAround(NORTH,20,7,20,7,2);
  clearAround(NORTH,18,18,20,19,2);
  clearAround(NORTH,22,18,24,19,3);
  NORTH[12][15]='k'; clearAround(NORTH,15,12,15,12,2);      // mountain well
  const treeKeysN = [];
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){ if(NORTH[y][x]==='6') treeKeysN.push('n:'+x+','+y); }
  let curLayout = HOME;

  // ===== River area (big: rivers, bridges, two piers, a tackle shop, chests, mushrooms) =====
  const RCOLS = 48, RROWS = 34;
  const RIVER = [];
  for(let y=0;y<RROWS;y++){ const row=[]; for(let x=0;x<RCOLS;x++) row.push('0'); RIVER.push(row); }
  function rfr(x0,y0,x1,y1,ch){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ if(RIVER[y] && RIVER[y][x]!==undefined) RIVER[y][x]=ch; } }
  const rput = (x,y,ch)=>{ RIVER[y][x] = ch; };
  for(let y=0;y<RROWS;y++) for(let x=0;x<RCOLS;x++){
    if(treeRnd(x,y,37,0.11)) RIVER[y][x]='6';
    else if((x*5+y*11)%23===0) RIVER[y][x]='g';
    else if((x*11+y*3)%13===0) RIVER[y][x]='P';                 // wild mushrooms
  }
  for(let y=0;y<RROWS;y++) for(let x=0;x<RCOLS;x++){
    if(x<2||y<2||x>=RCOLS-2||y>=RROWS-2) RIVER[y][x]='9';
  }
  rfr(12,2,13,31,'7');    // river A (north-south)
  rfr(14,13,45,14,'7');   // river B (east-west)
  rfr(30,15,31,31,'7');   // river C (north-south)
  rfr(16,19,27,28,'7');   // lake 1 (west pier)
  rfr(36,19,44,27,'7');   // lake 2 (east pier, rarer fish)
  rfr(36,3,42,7,'7');     // north-east pond
  rfr(6,25,9,29,'7');     // south-west pond
  rfr(3,1,4,10,'3');      // road from the gate
  rfr(3,9,11,10,'3');     // to bridge A1
  rfr(3,10,4,30,'3');     // west road going south
  rfr(3,22,11,23,'3');    // to bridge A2
  rfr(14,9,45,10,'3');    // main road east
  rfr(20,11,21,18,'3');   // road to the west pier
  rfr(34,11,35,18,'3');   // road south over bridge C2
  rfr(14,22,15,30,'3');   // riverside road
  rfr(14,29,44,30,'3');   // southern road
  rfr(34,15,35,30,'3');   // eastern road
  rfr(34,17,41,18,'3');   // road to the east pier
  rfr(12,9,13,10,'B');    // bridge A1
  rfr(12,22,13,23,'B');   // bridge A2
  rfr(20,13,21,14,'C');   // bridge C1
  rfr(34,13,35,14,'C');   // bridge C2
  rfr(30,29,31,30,'B');   // bridge over river C
  rfr(21,19,21,23,'F');   // west fishing pier
  rfr(40,19,40,24,'F');   // east fishing pier
  rfr(38,25,42,26,'0');   // small island at the end of the east pier
  rput(6,13,'a'); rput(7,13,'b'); rput(8,13,'c');   // tackle shop: roof
  rput(6,14,'d'); rput(7,14,'e'); rput(8,14,'f');   // tackle shop: walls + door
  rput(23,17,'4'); rput(43,17,'4'); rput(6,16,'4'); rput(28,6,'4');   // villagers
  rput(44,5,'Y'); rput(40,26,'Y'); rput(5,30,'Y'); rput(30,4,'Y');   // treasure chests
  RIVER[0][3]='V'; RIVER[0][4]='V';
  rput(6,20,'k'); clearAround(RIVER,6,20,6,20,2);           // river well
  clearAround(RIVER,6,13,8,14,3);
  for(const [nx,ny] of [[23,17],[43,17],[6,16],[28,6]]) clearAround(RIVER,nx,ny,nx,ny,3);
  for(const [cx,cy] of [[44,5],[40,26],[5,30],[30,4]]) clearAround(RIVER,cx,cy,cx,cy,1);
  clearAround(RIVER,3,2,4,2,2);
  rfr(22,31,23,31,'3');                         // road down to the south gate
  RIVER[32][22]='J'; RIVER[32][23]='J';         // toll gate to the coast (between the border trees)
  RIVER[33][22]='I'; RIVER[33][23]='I';         // exit down to the coast
  clearAround(RIVER,22,31,23,32,2);
  const FISH_SPOTS = [[21,19],[40,19]];   // pier entrances (the rod marker is drawn here)
  const treeKeysR = [];
  for(let y=0;y<RROWS;y++) for(let x=0;x<RCOLS;x++){ if(RIVER[y][x]==='6') treeKeysR.push('r:'+x+','+y); }

  // ===== Coast area (the southern end of the world): beach & sea along the south and west sides =====
  const CCOLS = 40, CROWS = 30;
  const COAST = [];
  for(let y=0;y<CROWS;y++){ const row=[]; for(let x=0;x<CCOLS;x++) row.push('0'); COAST.push(row); }
  function cfr(x0,y0,x1,y1,ch){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ if(COAST[y] && COAST[y][x]!==undefined) COAST[y][x]=ch; } }
  const cput = (x,y,ch)=>{ COAST[y][x] = ch; };
  const wSea = y => 5 + Math.round(1.3*Math.sin(y*0.55));              // west shoreline: x <= this is sea
  const sSea = x => CROWS-6 + Math.round(1.3*Math.sin(x*0.45+1));      // south shoreline: y >= this is sea
  for(let y=0;y<CROWS;y++) for(let x=0;x<CCOLS;x++){
    if(x<=wSea(y) || y>=sSea(x)) COAST[y][x]='7';                      // sea
    else if(x<=wSea(y)+3 || y>=sSea(x)-3) COAST[y][x]='t';            // sand beach
    else if(treeRnd(x,y,53,0.15)) COAST[y][x]='6';
    else if((x*5+y*11)%23===0) COAST[y][x]='g';
    else if((x*11+y*3)%17===0) COAST[y][x]='P';                        // wild mushrooms
  }
  for(let y=0;y<CROWS;y++) for(let x=0;x<CCOLS;x++){
    if((x>=CCOLS-2 || y<2) && COAST[y][x]!=='7') COAST[y][x]='9';     // north / east: unbreakable forest
  }
  // 大規模な畑(土のマスなので、アクションで耕して種まき・水やり・収穫ができる)
  cfr(24,2,36,9,'1');                        // 東の大きな畑 13x8
  cfr(11,3,18,9,'1');                        // 北西の畑 8x7
  cfr(30,14,36,19,'1');                      // 南東の畑 7x6
  // 西の桟橋(海へ向かってまっすぐ。岸側のいちばん端に釣り竿の目印を立てる)
  const PIER_Y = 14;
  for(let x=1;x<=wSea(PIER_Y);x++) COAST[PIER_Y][x]='F';
  const COAST_FISH_SPOTS = [[wSea(PIER_Y), PIER_Y]];
  cfr(20,1,21,13,'3');                       // road from the gate down to the village green
  cfr(12,12,28,13,'3');                      // east-west street
  cfr(12,12,13,19,'3');                      // road toward the west beach
  cfr(27,12,28,19,'3');                      // road toward the south-east beach
  COAST[0][20]='z'; COAST[0][21]='z';        // back to the river area
  cput(23,6,'4');                            // villager
  cput(18,10,'k');                           // coast well(畑にかぶらないよう、北西の畑の下に置く)
  cput(9,6,'Y'); cput(30,21,'Y'); cput(8,21,'Y');   // treasure chests
  // 南の広場:作物屋さん(左)と家の建設予定地(右)
  cfr(20,14,21,18,'3');                      // 街道から南の広場へ
  cfr(14,18,26,18,'3');                      // 店と建設予定地の前の道
  cput(15,16,'a'); cput(16,16,'b'); cput(17,16,'c');   // 作物屋: 屋根
  cput(15,17,'d'); cput(16,17,'e'); cput(17,17,'f');   // 作物屋: 壁とドア
  cput(23,16,'r'); cput(24,16,'R'); cput(25,16,'x');   // 家の建設予定地
  cput(23,17,'s'); cput(24,17,'S'); cput(25,17,'y');
  clearAround(COAST,15,16,17,17,3); clearAround(COAST,23,16,25,17,3);
  for(const [nx,ny] of [[23,6],[18,10]]) clearAround(COAST,nx,ny,nx,ny,2);
  for(const [cx,cy] of [[9,6],[30,21],[8,21]]) clearAround(COAST,cx,cy,cx,cy,1);
  clearAround(COAST,20,2,21,2,2);
  const treeKeysC = [];
  for(let y=0;y<CROWS;y++) for(let x=0;x<CCOLS;x++){ if(COAST[y][x]==='6') treeKeysC.push('s:'+x+','+y); }

  // ===== Cave area: a winding maze of narrow passages =====
  const CAVE_STAIRS = {}, CAVE_TABLE = {}, CAVE_WELL = {};
  const CAVE = [];
  for(let y=0;y<ROWS;y++){ const row=[]; for(let x=0;x<COLS;x++) row.push('N'); CAVE.push(row); }
  (function buildCave(){
    const CW = 9, CH = 6;                        // 9 x 6 rooms (2x2 tiles each, 1-tile walls)
    let seed = 20240607;                         // fixed seed: the same cave every time
    const rnd = ()=>{ seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const at = (i,j)=>[3+3*i, 3+3*j];
    const carve = (x0,y0,x1,y1,ch)=>{ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) CAVE[y][x]=ch; };
    const DIRS = { N:[0,-1], S:[0,1], E:[1,0], W:[-1,0] };
    const OPP = { N:'S', S:'N', E:'W', W:'E' };
    const inside = (i,j)=> i>=0 && j>=0 && i<CW && j<CH;
    const adj = [], seen = [], dist = [];
    for(let i=0;i<CW;i++){
      adj.push([]); seen.push([]); dist.push([]);
      for(let j=0;j<CH;j++){ adj[i].push([]); seen[i].push(false); dist[i].push(-1); const [x,y]=at(i,j); carve(x,y,x+1,y+1,'0'); }
    }
    function link(i,j,d){
      const [dx,dy] = DIRS[d], ni = i+dx, nj = j+dy, [x,y] = at(i,j);
      if(d==='E') carve(x+2,y,x+2,y+1,'0');
      else if(d==='W') carve(x-1,y,x-1,y+1,'0');
      else if(d==='S') carve(x,y+2,x+1,y+2,'0');
      else carve(x,y-1,x+1,y-1,'0');
      if(!adj[i][j].includes(d)) adj[i][j].push(d);
      if(!adj[ni][nj].includes(OPP[d])) adj[ni][nj].push(OPP[d]);
    }
    // Depth-first maze, starting from the entrance room
    const EI = 4, EJ = 5;
    const stack = [[EI,EJ]]; seen[EI][EJ] = true;
    while(stack.length){
      const [i,j] = stack[stack.length-1];
      const opts = Object.keys(DIRS).filter(d=>{ const ni=i+DIRS[d][0], nj=j+DIRS[d][1]; return inside(ni,nj) && !seen[ni][nj]; });
      if(!opts.length){ stack.pop(); continue; }
      const d = opts[Math.floor(rnd()*opts.length)];
      const ni = i+DIRS[d][0], nj = j+DIRS[d][1];
      link(i,j,d); seen[ni][nj] = true; stack.push([ni,nj]);
    }
    // A few extra openings so there are loops as well as dead ends
    for(let n=0;n<10;n++){
      const i = Math.floor(rnd()*CW), j = Math.floor(rnd()*CH);
      const ds = Object.keys(DIRS).filter(d=> inside(i+DIRS[d][0], j+DIRS[d][1]) && !adj[i][j].includes(d));
      if(ds.length) link(i,j,ds[Math.floor(rnd()*ds.length)]);
    }
    // Distance from the entrance
    dist[EI][EJ] = 0;
    const q = [[EI,EJ]];
    while(q.length){
      const [i,j] = q.shift();
      for(const d of adj[i][j]){ const ni=i+DIRS[d][0], nj=j+DIRS[d][1]; if(dist[ni][nj]<0){ dist[ni][nj] = dist[i][j]+1; q.push([ni,nj]); } }
    }
    const cells = [];
    for(let i=0;i<CW;i++) for(let j=0;j<CH;j++) if(!(i===EI && j===EJ)) cells.push({ i, j, deg: adj[i][j].length, d: dist[i][j], gold:false });
    // Stairs down to the dungeon: the room farthest from the entrance. Gold ore: the next-deepest rooms.
    const deadEnds = cells.filter(c=>c.deg===1).sort((a,b)=>b.d-a.d);
    const others = cells.filter(c=>c.deg>1).sort((a,b)=>b.d-a.d);
    const FAR = { N:[1,1], S:[0,0], E:[0,1], W:[1,0] };   // the tile farthest from the room's only opening
    deadEnds.concat(others).slice(0,15).forEach((c,idx)=>{
      const [x,y] = at(c.i,c.j);
      const off = c.deg===1 ? FAR[adj[c.i][c.j][0]] : [1,1];
      CAVE[y+off[1]][x+off[0]] = idx===0 ? 'D' : 'A';
      c.gold = true;
      if(idx===0){ CAVE_STAIRS.x = x+off[0]; CAVE_STAIRS.y = y+off[1]; CAVE_STAIRS.spawnX = x+1-off[0]; CAVE_STAIRS.spawnY = y+1-off[1]; }
    });
    // Ordinary rocks: one corner tile in about half of the rooms (never blocks a passage)
    for(const c of cells){
      if(c.gold || rnd()>0.55) continue;
      const [x,y] = at(c.i,c.j);
      const ox = rnd()<0.5 ? 0 : 1, oy = rnd()<0.5 ? 0 : 1;
      if(CAVE[y+oy][x+ox]==='0') CAVE[y+oy][x+ox] = 'g';
    }
    // Enchanting table: in the closest room to the dungeon stairs that has nothing else in it
    (function placeTable(){
      const sc = deadEnds.concat(others)[0];
      const seenB = new Set([sc.i+','+sc.j]), qq = [[sc.i,sc.j]];
      while(qq.length){
        const [i,j] = qq.shift();
        if(!(i===sc.i && j===sc.j) && !(i===EI && j===EJ)){
          const [x,y] = at(i,j);
          const ts = [[0,0],[1,0],[0,1],[1,1]].map(o=>[x+o[0], y+o[1]]);
          if(ts.every(p=>CAVE[p[1]][p[0]]==='0')){
            ts.sort((a,b)=>Math.hypot(b[0]-CAVE_STAIRS.x,b[1]-CAVE_STAIRS.y)-Math.hypot(a[0]-CAVE_STAIRS.x,a[1]-CAVE_STAIRS.y));
            CAVE[ts[0][1]][ts[0][0]] = 'O'; CAVE_TABLE.x = ts[0][0]; CAVE_TABLE.y = ts[0][1];
            return;
          }
        }
        for(const d of adj[i][j]){ const ni=i+DIRS[d][0], nj=j+DIRS[d][1], k=ni+','+nj; if(!seenB.has(k)){ seenB.add(k); qq.push([ni,nj]); } }
      }
    })();
    // Cave well: inside the stairs room itself, on the tile next to the stairs (the room stays connected)
    {
      const sc = deadEnds.concat(others)[0], [rx,ry] = at(sc.i,sc.j);
      if(sc.deg===1){
        const WOFF = { N:[0,1], S:[1,0], E:[0,0], W:[1,1] }[adj[sc.i][sc.j][0]];
        CAVE_WELL.x = rx+WOFF[0]; CAVE_WELL.y = ry+WOFF[1];
      } else { CAVE_WELL.x = 15; CAVE_WELL.y = 18; }          // fallback: corner of the entrance room
      CAVE[CAVE_WELL.y][CAVE_WELL.x] = 'k';
    }
    // Entrance tunnel from the south edge (leads back to the mountain)
    carve(15,20,16,21,'0'); carve(15,22,16,22,'3');
    CAVE[23][15]='Q'; CAVE[23][16]='Q';
  })();
