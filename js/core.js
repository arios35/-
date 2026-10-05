  document.addEventListener('gesturestart', (e)=>e.preventDefault());
  // Safariの「ダブルタップで拡大」を止める(CSSの touch-action でも止めているが、念のため)。ボタン・メニューは素早い連打ができるよう対象外
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e)=>{
    const now = Date.now();
    const onUi = e.target && e.target.closest && e.target.closest('button, .seed, .shop');
    if(now - lastTouchEnd <= 350 && !onUi) e.preventDefault();
    lastTouchEnd = now;
  }, { passive:false });
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
      const retBtn = document.getElementById('btnReturn');
      const retH = (retBtn && retBtn.style.display !== 'none') ? 66 : 0;                 // ダンジョンで「帰還」ボタンが出ている間だけ、そのぶん空ける
      const safeB = (typeof getComputedStyle === 'function' ? parseFloat(getComputedStyle(document.documentElement).paddingBottom) : 0) || 0;
      availH = window.innerHeight - top - (84 + retH + safeB);                            // 84 = メッセージ欄(2行)+余白。アクションボタンがなくなったぶん、画面が広い
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
