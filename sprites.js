  // 16x16 pixel-art humanoid sprite (chibi villager), reused for player & NPCs
  const PERSON_SPRITE = [
    "................",
    "......HHHH......",
    ".....HHHHHH.....",
    ".....HSSSSH.....",
    ".....HSSSSH.....",
    ".....SSEESS.....",
    "......SSSS......",
    ".......SS.......",
    "......BBBB......",
    ".....BBBBBB.....",
    ".....BBBBBB.....",
    ".....BB..BB.....",
    "......BBBB......",
    "......PPPP......",
    ".....PP..PP.....",
    ".....OO..OO.....",
  ];
  // Back-facing (up): hide the eyes so it reads as the back of the head
  const BACK_SPRITE = [
    "................",
    "......HHHH......",
    ".....HHHHHH.....",
    ".....HHHHHH.....",
    ".....HHHHHH.....",
    ".....HHHHHH.....",
    "......SSSS......",
    ".......SS.......",
    "......BBBB......",
    ".....BBBBBB.....",
    ".....BBBBBB.....",
    ".....BB..BB.....",
    "......BBBB......",
    "......PPPP......",
    ".....PP..PP.....",
    ".....OO..OO.....",
  ];
  // Side-facing (right; mirrored for left): single visible eye, arm forward
  const SIDE_SPRITE = [
    "................",
    ".......HHHH.....",
    "......HHHHHH....",
    "......HSSSSH....",
    "......HSSSSH....",
    ".......SSES.....",
    "......SSSSS.....",
    ".......SSS......",
    ".....BBBBB......",
    "....BBBBBBB.....",
    "....BBBBBBBB....",
    "....BB...BB.....",
    ".....BBBBB......",
    ".....PPPP.......",
    "....PP..PP......",
    "....OO..OO......",
  ];
  // Wheat growth-stage sprites: mature stage uses 2x2 (4-block) grain heads
  const SPROUT_SPRITE = [
    "................","................","................","................",
    "................","................","................","................",
    "................","................","................","................",
    "................","......GG........",".......G........",".......G........",
  ];
  const GROWING_SPRITE = [
    "................","................","................","................",
    "................","................","................","................",
    "......G..G......","......G..G......","......G..G......","......G..G......",
    "......G..G......","......G..G......","......G..G......","......G..G......",
  ];
  const MATURE_SPRITE = [
    "................",
    "................",
    ".....WW..WW.....",
    "....WWW..WWW....",
    ".....Ww..wW.....",
    "......G..G......",
    ".....LG..GL.....",
    "......G..G......",
    "......G..G......",
    "......G..G......",
    "......G..G......",
    "......G..G......",
    "......G..G......",
    "......G..G......",
    "......G..G......",
    ".....LG..GL.....",
  ];
  const WHEAT_PALETTE = { G:'#5fa85f', W:'#f0c14e' };
  const WHEAT_RIPE_PALETTE = { G:'#8a9b3f', W:'#f4d06a', w:'#f7e6a3', L:'#b5c25a' };

  const TOMATO_SPRITE = [
    "................","................",
    "....RR....RR....","...RRRR..RRRR...",
    "....RR....RR....","......G..G......",
    ".....LG..GL.....","......G..G......",
    "......G..G......","......G..G......",
    "......G..G......","......G..G......",
    "......G..G......","......G..G......",
    "......G..G......",".....LG..GL.....",
  ];
  const TOMATO_PALETTE = { R:'#d9432f', G:'#5fa85f', L:'#3f8f3f' };

  const CORN_SPRITE = [
    "................","................",
    ".......CC.......","......CCCC......",
    "......CCCC......",".......CC.......",
    ".......GG.......",".......GG.......",
    "......LGG.......",".......GG.......",
    ".......GG.......",".......GG.L.....",
    ".......GG.......",".......GG.......",
    "......LGG.......",".......GG.......",
  ];
  const CORN_PALETTE = { C:'#f0c14e', G:'#5fa85f', L:'#3f8f3f' };

  const SEED_SPRITE = [
    "................","................","................","................",
    "................","................","................","................",
    "................","................","................","................",
    "................","................",".......SS.......",".......SS.......",
  ];
  const SEED_PALETTE = { S:'#3d2a1a' };

  const CROPS = {
    wheat:  { label:'小麦',       emoji:'🌾', seedCost:5, sellPrice:10, sprite:MATURE_SPRITE,  palette:WHEAT_RIPE_PALETTE },
    tomato: { label:'トマト',     emoji:'🍅', seedCost:8, sellPrice:16, sprite:TOMATO_SPRITE,  palette:TOMATO_PALETTE },
    corn:   { label:'とうもろこし', emoji:'🌽', seedCost:8, sellPrice:15, sprite:CORN_SPRITE,    palette:CORN_PALETTE },
  };

  // Detailed tree sprite (layered canopy over a trunk)
  const TREE_SPRITE = [
    "................",
    "......LLLL......",
    ".....LLLLLL.....",
    "....LALLLLAL....",
    "...LLLLLLLLLL...",
    "..MMLLLLLLLLMM..",
    "...LLLLLLLLLL...",
    "....LLALLALL....",
    ".....LLLLLL.....",
    "......LLLL......",
    ".......TT.......",
    ".......TT.......",
    ".......TT.......",
    "......TTTT......",
    "................",
    "................",
  ];
  const TREE_PALETTE = { L:'#4a8f4a', M:'#3a7a3a', T:'#6b4a2a', A:'#e08030' };
  const ROCK_SPRITE = makeRows(16,(x,y)=>{
    const dx=(x-7.5)/7.3, dy=(y-9.5)/5.8, d=dx*dx+dy*dy;
    if(d>1) return '.';
    if(dx*0.6+dy*0.8>0.55) return 'D';
    if(dx+dy<-0.85) return 'H';
    return 'G';
  });
  const ROCK_PALETTE = { G:'#8c9098', H:'#b8bdc6', D:'#666a72' };
  const GOLD_SPRITE = ROCK_SPRITE.map((row,y)=>row.split('').map((c,x)=>(c!=='.' && (x*3+y*5)%5===0) ? 'Y' : c).join(''));
  const GOLD_PALETTE = { G:'#8c9098', H:'#b8bdc6', D:'#666a72', Y:'#f2c230' };
  const TREE_NOFRUIT = TREE_SPRITE.map(r=>r.replace(/A/g,'L'));

  // Detailed house/shop sprite (roof, windows, door)
  const HOUSE_SPRITE = [
    "................",
    ".......RR.......",
    "......RRRR......",
    ".....RRRRRR.....",
    "....RRRRRRRR....",
    "...RRRRRRRRRR...",
    "..RRRRRRRRRRRR..",
    "..FFFFFFFFFFFF..",
    "..FKKFFFFKKFFF..",
    "..FKKFFFFKKFFF..",
    "..FFFFFFFFFFFF..",
    "..FFFFFDDFFFFF..",
    "..FFFFFDDFFFFF..",
    "..FFFFFFFFFFFF..",
    "................",
    "................",
  ];
  const HOUSE_PALETTE = { R:'#a5503a', F:'#e8dcb8', K:'#6ea8d8', D:'#6b3f26' };

  // Finely textured building pieces (16x16 grid, generated) so the shop
  // building isn't just flat colored blocks
  function makeRows(n, fn){
    const rows = [];
    for(let y=0;y<n;y++){ let row=''; for(let x=0;x<n;x++) row+=fn(x,y); rows.push(row); }
    return rows;
  }
  const ROOF_TEX = makeRows(16, (x,y)=> (y%5===4 ? 'H' : 'R'));
  const ROOF_MID_TEX = makeRows(16, (x,y)=> (y<3 ? 'H' : (y%5===4 ? 'H' : 'R')));
  function wallCell(x,y,hasWindow,hasDoor){
    if(y===0) return 't';
    if(hasWindow && y>=4 && y<=9 && x>=5 && x<=10){
      return (y===4||y===9||x===5||x===10) ? 'k' : 'K';
    }
    if(hasDoor && y>=5 && y<=14 && x>=6 && x<=9){
      if(x===6||x===9||y===5||x===7) return 'd';
      return 'D';
    }
    return (x%4===3) ? 'w' : 'W';
  }
  const WALL_WINDOW = makeRows(16,(x,y)=>wallCell(x,y,true,false));
  const WALL_DOOR = makeRows(16,(x,y)=>wallCell(x,y,false,true));
  const BUILDING_PALETTE = {
    R:'#2d3548', H:'#3f4c68', t:'#7a2f26', W:'#b0453a', w:'#8a352b',
    K:'#6ea8d8', k:'#3d3220', D:'#4a2a1a', d:'#2a1810'
  };
  function drawSprite(px, py, sprite, palette, scale, flip){
    ctx.save();
    if(flip){ ctx.translate(px + sprite[0].length*scale, py); ctx.scale(-1,1); px = 0; py = 0; }
    for(let ry=0; ry<sprite.length; ry++){
      const row = sprite[ry];
      for(let rx=0; rx<row.length; rx++){
        const c = row[rx];
        if(c==='.') continue;
        ctx.fillStyle = palette[c];
        ctx.fillRect(px + rx*scale, py + ry*scale, scale, scale);
      }
    }
    ctx.restore();
  }
  // Boy player: red cap, blue T-shirt, khaki shorts, bare legs and sneakers
  const PLAYER_PALETTE = { C:'#d64b3c', H:'#5b3a29', S:'#f2c58a', E:'#2a2118', M:'#c9776b', B:'#4c8fd6', P:'#b08a54', O:'#4a3a2a' };
  const BOY_LOWER = [
    "....BBBBBBBB....",
    "...SBBBBBBBBS...",
    "....PPPPPPPP....",
    "....PPP..PPP....",
    "....SS....SS....",
    "...OOO....OOO...",
  ];
  const BOY_FRONT = [
    "................",
    "................",
    "................",
    "................",
    "......CCCC......",
    ".....CCCCCC.....",
    ".....CCCCCC.....",
    "....CCCCCCCC....",
    "....HSESSESH....",
    "......SMMS......",
  ].concat(BOY_LOWER);
  const BOY_BACK = [
    "................",
    "................",
    "................",
    "................",
    "......CCCC......",
    ".....CCCCCC.....",
    ".....CCCCCC.....",
    "....CCCCCCCC....",
    "....HHHHHHHH....",
    "......HHHH......",
  ].concat(BOY_LOWER);
  const BOY_SIDE = [
    "................",
    "................",
    "................",
    "................",
    ".......CCCC.....",
    "......CCCCCC....",
    "......CCCCCCCC..",
    "......HSSSSS....",
    "......HSSSES....",
    ".......SSMS.....",
    ".....BBBBB......",
    "....BBBBBBSS....",
    ".....PPPPP......",
    ".....PPP.PP.....",
    ".....SS..SS.....",
    "....OOO..OOO....",
  ];
  const NPC_PALETTE    = { H:'#8a4a3a', S:'#f2c58a', E:'#2a2118', B:'#6fa86f', P:'#4a3a2a', O:'#2a2118' };
