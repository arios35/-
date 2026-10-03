  // ===== Dungeon (underground): 15 floors, each one a big winding maze =====
  const DCOLS = 56, DROWS = 38;
  const DUNGEON = [];
  for(let y=0;y<DROWS;y++){ const row=[]; for(let x=0;x<DCOLS;x++) row.push('N'); DUNGEON.push(row); }
  const DUNGEON_START = {}, DUNGEON_STAIRS = {}, DUNGEON_ARENA = { active:false };
  const DUNGEON_ROOMS = [];
  function buildFloor(n){
    for(let y=0;y<DROWS;y++) for(let x=0;x<DCOLS;x++) DUNGEON[y][x] = 'N';
    DUNGEON_ROOMS.length = 0;
    DUNGEON_ARENA.active = false;
    if(BOSS_FLOORS[n]){
      // Boss floor: one big hall with four pillars. Stairs up at the bottom, stairs down (after the fight) at the far end.
      const w = 28, h = 18, x0 = 14, y0 = 10, cx = x0 + w/2;
      for(let y=y0;y<y0+h;y++) for(let x=x0;x<x0+w;x++) DUNGEON[y][x] = 'E';
      for(const p of [[x0+6,y0+4],[x0+w-8,y0+4],[x0+6,y0+h-7],[x0+w-8,y0+h-7]])
        for(let dy=0;dy<2;dy++) for(let dx=0;dx<2;dx++) DUNGEON[p[1]+dy][p[0]+dx] = 'N';
      DUNGEON[y0+h-1][cx] = 'L';
      DUNGEON_START.spawnX = cx; DUNGEON_START.spawnY = y0+h-2;
      Object.assign(DUNGEON_ARENA, { active:true, x0, y0, w, h, cx, cy:y0+3 });
      Object.assign(DUNGEON_STAIRS, { x:cx, y:y0, spawnX:cx, spawnY:y0+1 });
      if(bossDefeated(n) && n<MAX_FLOOR) DUNGEON[y0][cx] = 'K';
      return;
    }
    const CW = 17, CH = 11;                      // 17 x 11 rooms
    let seed = (Math.imul(n, 2654435761) ^ 987654321) >>> 0;   // every floor has its own fixed layout
    const rnd = ()=>{ seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const at = (i,j)=>[3+3*i, 3+3*j];
    const carve = (x0,y0,x1,y1,ch)=>{ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) DUNGEON[y][x]=ch; };
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
    const EI = 2 + Math.floor(rnd()*(CW-4)), EJ = CH-1;   // start room: somewhere along the bottom
    const stack = [[EI,EJ]]; seen[EI][EJ] = true;
    while(stack.length){
      const [i,j] = stack[stack.length-1];
      const opts = Object.keys(DIRS).filter(d=>{ const ni=i+DIRS[d][0], nj=j+DIRS[d][1]; return inside(ni,nj) && !seen[ni][nj]; });
      if(!opts.length){ stack.pop(); continue; }
      const d = opts[Math.floor(rnd()*opts.length)];
      const ni = i+DIRS[d][0], nj = j+DIRS[d][1];
      link(i,j,d); seen[ni][nj] = true; stack.push([ni,nj]);
    }
    for(let k=0;k<45;k++){                        // extra openings: loops and shortcuts
      const i = Math.floor(rnd()*CW), j = Math.floor(rnd()*CH);
      const ds = Object.keys(DIRS).filter(d=> inside(i+DIRS[d][0], j+DIRS[d][1]) && !adj[i][j].includes(d));
      if(ds.length) link(i,j,ds[Math.floor(rnd()*ds.length)]);
    }
    dist[EI][EJ] = 0;
    const q = [[EI,EJ]];
    while(q.length){
      const [i,j] = q.shift();
      for(const d of adj[i][j]){ const ni=i+DIRS[d][0], nj=j+DIRS[d][1]; if(dist[ni][nj]<0){ dist[ni][nj] = dist[i][j]+1; q.push([ni,nj]); } }
    }
    const [sx,sy] = at(EI,EJ);
    DUNGEON[sy+1][sx] = 'L';                      // stairs up
    DUNGEON_START.spawnX = sx+1; DUNGEON_START.spawnY = sy;
    const cells = [];
    for(let i=0;i<CW;i++) for(let j=0;j<CH;j++){
      if(i===EI && j===EJ) continue;
      cells.push({ i, j, deg:adj[i][j].length, d:dist[i][j], man:Math.abs(i-EI)+Math.abs(j-EJ) });
    }
    const far = cells.filter(c=>c.man>=8).sort((a,b)=>b.d-a.d);
    const target = far.length ? far[0] : cells.slice().sort((a,b)=>b.d-a.d)[0];
    const FAR = { N:[1,1], S:[0,0], E:[0,1], W:[1,0] };
    let arena = null;
    if(BOSS_FLOORS[n]){
      // Boss floor: a big arena room at the far end. The stairs down appear once the boss is beaten.
      const [tx,ty] = at(target.i,target.j);
      const w = 9, h = 7;
      const x0 = Math.max(3, Math.min(53-w, tx+1-Math.floor(w/2)));
      const y0 = Math.max(3, Math.min(35-h, ty+1-Math.floor(h/2)));
      carve(x0,y0,x0+w-1,y0+h-1,'E');
      arena = { x0, y0, w, h };
      Object.assign(DUNGEON_ARENA, { active:true, x0, y0, w, h, cx:x0+Math.floor(w/2), cy:y0+Math.floor(h/2) });
      const kx = x0+w-1, ky = y0;
      Object.assign(DUNGEON_STAIRS, { x:kx, y:ky, spawnX:kx-1, spawnY:ky });
      if(bossDefeated(n) && n<MAX_FLOOR) DUNGEON[ky][kx] = 'K';
    } else {
      const [x,y] = at(target.i,target.j);
      const off = target.deg===1 ? FAR[adj[target.i][target.j][0]] : [1,1];
      DUNGEON[y+off[1]][x+off[0]] = 'K';          // stairs down
      Object.assign(DUNGEON_STAIRS, { x:x+off[0], y:y+off[1], spawnX:x+1-off[0], spawnY:y+1-off[1] });
    }
    for(const c of cells){
      if(c===target) continue;
      const [x,y] = at(c.i,c.j);
      if(arena && x+1>=arena.x0-1 && x<=arena.x0+arena.w && y+1>=arena.y0-1 && y<=arena.y0+arena.h) continue;
      DUNGEON_ROOMS.push({ cx:x+0.5, cy:y+0.5, d:c.d });
    }
  }
