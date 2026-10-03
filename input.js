  // Floating drag control: touch anywhere on the canvas, drag to move, quick tap = action
  const inputVec = { x:0, y:0 };
  const stickVec = { x:0, y:0 };
  const keyVec = { up:false, down:false, left:false, right:false };
  const drag = { active:false, id:null, sx:0, sy:0, kx:0, ky:0, moved:false };
  (function setupDrag(){
    const RADIUS = 55, DEADZONE = 10;
    let downTime = 0, maxDist = 0, sx = 0, sy = 0;
    function scaleK(){ const r = canvas.getBoundingClientRect(); return { r, k: displayW / r.width }; }

    function onDown(e){
      if(drag.active) return;
      e.preventDefault();
      const {r, k} = scaleK();
      drag.active = true; drag.id = e.pointerId; drag.moved = false;
      sx = e.clientX; sy = e.clientY;
      drag.sx = (sx - r.left) * k; drag.sy = (sy - r.top) * k;
      drag.kx = 0; drag.ky = 0;
      downTime = performance.now(); maxDist = 0;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    }
    function onMove(e){
      if(!drag.active || e.pointerId !== drag.id) return;
      const {k} = scaleK();
      const dx = e.clientX - sx, dy = e.clientY - sy;
      const dist = Math.hypot(dx, dy);
      if(dist > maxDist) maxDist = dist;
      const clamped = Math.min(dist, RADIUS), ang = Math.atan2(dy, dx);
      const px = Math.cos(ang) * clamped, py = Math.sin(ang) * clamped;
      drag.kx = px * k; drag.ky = py * k;
      drag.moved = maxDist >= 14;
      if(dist < DEADZONE){ stickVec.x = 0; stickVec.y = 0; }
      else { stickVec.x = px / RADIUS; stickVec.y = py / RADIUS; }
    }
    function onUp(e){
      if(!drag.active || e.pointerId !== drag.id) return;
      drag.active = false; drag.moved = false;
      stickVec.x = 0; stickVec.y = 0;
      // Quick tap without dragging = action
      if(performance.now() - downTime < 300 && maxDist < 14){ action(); }
    }
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
  })();

  function drawDragGuide(){
    if(!drag.active || !drag.moved) return;
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(drag.sx, drag.sy, 34, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(drag.sx + drag.kx*0.6, drag.sy + drag.ky*0.6, 15, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  window.addEventListener('keydown', (e)=>{
    switch(e.key){
      case 'ArrowUp': case 'w': case 'W': keyVec.up=true; break;
      case 'ArrowDown': case 's': case 'S': keyVec.down=true; break;
      case 'ArrowLeft': case 'a': case 'A': keyVec.left=true; break;
      case 'ArrowRight': case 'd': case 'D': keyVec.right=true; break;
      case ' ': case 'Enter': case 'e': case 'E': action(); break;
    }
  });
  window.addEventListener('keyup', (e)=>{
    switch(e.key){
      case 'ArrowUp': case 'w': case 'W': keyVec.up=false; break;
      case 'ArrowDown': case 's': case 'S': keyVec.down=false; break;
      case 'ArrowLeft': case 'a': case 'A': keyVec.left=false; break;
      case 'ArrowRight': case 'd': case 'D': keyVec.right=false; break;
    }
  });
