  document.addEventListener('gesturestart', (e)=>e.preventDefault());
  document.addEventListener('selectstart', (e)=>e.preventDefault());     // no text selection / copy popup on long-press
  document.addEventListener('contextmenu', (e)=>e.preventDefault());   // iOS pinch zoom only (no tap swallowing)

  const TILE = 30;
  let VIEW_COLS = 14, VIEW_ROWS = 10;
  let COLS = 32, ROWS = 24; // world size of the current map (the dungeon is bigger)
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let displayW = TILE*VIEW_COLS;

  // 画面サイズに合わせてゲーム画面を拡大(タイルも大きくなる)
  function resizeCanvas(){
    const landscape = window.innerWidth > window.innerHeight && window.innerHeight <= 500;
    const top = canvas.getBoundingClientRect().top + window.scrollY;
    let availW, availH, ts;
    if(landscape){
      availW = window.innerWidth - 16 - 190 - 14 - 6;
      availH = window.innerHeight - top - 14;
      ts = Math.min(availW/12, availH/8, 48);
    } else {
      availW = Math.min(document.documentElement.clientWidth - 16, 760) - 6;
      availH = window.innerHeight - top - 140;
      ts = Math.min(availW/11, 48);
    }
    ts = Math.max(ts, 24);
    const cols = Math.min(COLS, Math.max(8, Math.floor(availW/ts + 0.001)));
    const rows = Math.min(ROWS, Math.max(6, availH/ts)); // 縦は端数も使って余白なく広げる
    VIEW_COLS = cols; VIEW_ROWS = rows;
    displayW = TILE*cols;
    const scale = ts/TILE;
    canvas.style.width = (cols*ts) + 'px';
    canvas.style.height = (rows*ts) + 'px';
    canvas.width = Math.round(cols*ts*DPR);
    canvas.height = Math.round(rows*ts*DPR);
    ctx.setTransform(DPR*scale, 0, 0, DPR*scale, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', ()=>setTimeout(resizeCanvas, 150));
  setTimeout(resizeCanvas, 120);

  const SAVE_KEY = 'nonbiri-farm-save-v1';
