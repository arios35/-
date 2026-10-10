/* sound.js - WebAudioで作る効果音とBGM（音声ファイル不要）*/
(function(){
  let ac=null, master=null, muted=false, bgmTimer=null, scene='', step=0;
  try{ muted = localStorage.getItem('nonbiri-mute')==='1'; }catch(e){}

  function ensure(){
    if(ac) return ac;
    const AC = window.AudioContext||window.webkitAudioContext;
    if(!AC) return null;
    try{ ac=new AC(); master=ac.createGain(); master.gain.value=muted?0:0.5; master.connect(ac.destination); }catch(e){ ac=null; }
    return ac;
  }
  function unlock(){
    if(!ensure()) return;
    if(ac.state!=='running') ac.resume();
    startBgm();
  }
  ['pointerdown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,unlock,{passive:true}));
  document.addEventListener('visibilitychange',()=>{
    if(!ac) return;
    if(document.hidden) ac.suspend(); else ac.resume();
  });

  function tone(f,t0,dur,type,vol,slide){
    if(!ac) return;
    const o=ac.createOscillator(), g=ac.createGain();
    o.type=type||'square'; o.frequency.setValueAtTime(f,t0);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t0+dur);
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(vol,t0+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0+dur+0.02);
  }
  function noise(t0,dur,vol,freq){
    if(!ac) return;
    const n=Math.floor(ac.sampleRate*dur), b=ac.createBuffer(1,n,ac.sampleRate), d=b.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
    const s=ac.createBufferSource(); s.buffer=b;
    const f=ac.createBiquadFilter(); f.type='bandpass'; f.frequency.value=freq||1500;
    const g=ac.createGain(); g.gain.value=vol;
    s.connect(f); f.connect(g); g.connect(master); s.start(t0);
  }
  const last={};
  function sfx(name){
    if(muted||!ensure()||ac.state!=='running') return;
    const t=ac.currentTime;
    if(last[name]&&t-last[name]<0.06) return; last[name]=t;
    switch(name){
      case 'chop': noise(t,0.12,0.5,900); tone(180,t,0.1,'triangle',0.3,90); break;
      case 'mine': noise(t,0.08,0.4,3000); tone(900,t,0.08,'square',0.12,500); break;
      case 'pick': tone(660,t,0.08,'sine',0.25); tone(990,t+0.07,0.1,'sine',0.25); break;
      case 'coin': tone(988,t,0.07,'square',0.15); tone(1319,t+0.07,0.18,'square',0.15); break;
      case 'chest': [523,659,784,1047].forEach((f,i)=>tone(f,t+i*0.08,0.18,'triangle',0.3)); break;
      case 'splash': noise(t,0.25,0.35,600); tone(400,t,0.2,'sine',0.15,200); break;
      case 'fish': [523,784,1047].forEach((f,i)=>tone(f,t+i*0.07,0.15,'sine',0.3)); break;
      case 'slash': noise(t,0.1,0.4,2500); tone(500,t,0.1,'sawtooth',0.1,200); break;
      case 'hit': noise(t,0.1,0.5,700); tone(220,t,0.12,'square',0.2,110); break;
      case 'hurt': tone(300,t,0.25,'sawtooth',0.3,80); break;
      case 'die': [392,330,262,196].forEach((f,i)=>tone(f,t+i*0.18,0.3,'triangle',0.3)); break;
      case 'warp': tone(300,t,0.4,'sine',0.25,1200); tone(450,t+0.05,0.4,'sine',0.15,1800); break;
      case 'stairs': tone(500,t,0.08,'square',0.15); tone(400,t+0.08,0.08,'square',0.15); tone(300,t+0.16,0.12,'square',0.15); break;
      case 'upgrade': [523,659,784,1047,1319].forEach((f,i)=>tone(f,t+i*0.07,0.2,'square',0.15)); break;
      case 'sleep': [392,330,262].forEach((f,i)=>tone(f,t+i*0.25,0.5,'sine',0.25)); break;
      case 'boss': tone(110,t,0.6,'sawtooth',0.3,70); tone(116,t,0.6,'sawtooth',0.2,73); break;
      case 'tap': tone(700,t,0.04,'sine',0.1); break;
    }
  }
  window.sfx=sfx;

  // ---- BGM ----
  const SCALES={
    village:{root:262,notes:[0,2,4,7,9,12],tempo:0.42,type:'triangle',bass:[0,0,7,5]},
    north:  {root:247,notes:[0,3,5,7,10,12],tempo:0.5,type:'sine',bass:[0,3,5,3]},
    river:  {root:294,notes:[0,2,4,7,9,12],tempo:0.38,type:'sine',bass:[0,4,5,4]},
    coast:  {root:330,notes:[0,2,4,7,9,12],tempo:0.4,type:'triangle',bass:[0,5,7,5]},
    port:   {root:262,notes:[0,2,4,5,7,9],tempo:0.34,type:'square',bass:[0,7,5,7],vol:0.5},
    cave:   {root:196,notes:[0,3,5,6,7,10],tempo:0.6,type:'sine',bass:[0,0,3,-2]},
    dungeon:{root:175,notes:[0,1,5,7,8,12],tempo:0.45,type:'triangle',bass:[0,0,-2,1]},
    boss:   {root:147,notes:[0,1,3,6,7,8],tempo:0.22,type:'sawtooth',bass:[0,0,1,0],vol:0.4}
  };
  function sceneNow(){
    try{
      const m=state.map;
      if(m==='dungeon'){
        const f=state.floor||(typeof floorNo!=='undefined'?floorNo:0);
        if(f && f%3===0) return 'boss';
        return 'dungeon';
      }
      return SCALES[m]?m:'village';
    }catch(e){ return 'village'; }
  }
  const hz=(root,s)=>root*Math.pow(2,s/12);
  function bgmTick(){
    if(muted||!ac||ac.state!=='running') return;
    const sc=SCALES[scene]; if(!sc) return;
    const t=ac.currentTime+0.05, v=(sc.vol||0.35)*0.35;
    const beat=step%8, bar=Math.floor(step/8)%4;
    if(beat%2===0){
      const n=sc.notes[(Math.random()*sc.notes.length)|0];
      if(Math.random()<0.75) tone(hz(sc.root*2,n),t,sc.tempo*1.6,sc.type,v);
    }
    if(beat===0||beat===4) tone(hz(sc.root/2,sc.bass[bar]),t,sc.tempo*3,'sine',v*1.6);
    step++;
  }
  function startBgm(){
    const s=sceneNow();
    if(bgmTimer && s===scene) return;
    scene=s; step=0;
    if(bgmTimer) clearInterval(bgmTimer);
    bgmTimer=setInterval(()=>{
      const n=sceneNow();
      if(n!==scene){ scene=n; step=0; clearInterval(bgmTimer); bgmTimer=null; startBgm(); return; }
      bgmTick();
    }, (SCALES[scene]||SCALES.village).tempo*1000);
  }

  // ---- ミュートボタン ----
  function setMute(m){
    muted=m;
    try{ localStorage.setItem('nonbiri-mute',m?'1':'0'); }catch(e){}
    if(master) master.gain.value=m?0:0.5;
    const b=document.getElementById('btnSound'); if(b) b.textContent=m?'🔇':'🔊';
  }
  const sb=document.getElementById('btnSound');
  if(sb){
    sb.textContent=muted?'🔇':'🔊';
    sb.addEventListener('click',()=>{ setMute(!muted); if(!muted){ unlock(); sfx('coin'); } });
  }

  // ---- 既存関数にフック ----
  function wrap(name,snd,when){
    const f=window[name];
    if(typeof f!=='function') return;
    window[name]=function(){
      const r=f.apply(this,arguments);
      try{ if(!when||when(r,arguments)) sfx(typeof snd==='function'?snd(arguments):snd); }catch(e){}
      return r;
    };
  }
  wrap('treeAction','chop'); wrap('rockAction','mine'); wrap('goldAction','mine');
  wrap('mushroomAction','pick'); wrap('chestAction','chest');
  wrap('fishAction','splash');
  wrap('attackAction','slash');
  wrap('damageEnemy','hit');
  wrap('hurtPlayer','hurt');
  wrap('playerDied','die');
  wrap('startWellTravel','warp');
  wrap('changeFloor',a=>a[0]>=0?'stairs':'stairs');
  wrap('sleep','sleep');
  wrap('upgradeTool','upgrade'); wrap('upgradeSword','upgrade'); wrap('craftSword','upgrade'); wrap('applyEnchant','upgrade');
  wrap('goMap','stairs');
  wrap('startWind','boss');
  // お金が増えた/減った時のコイン音
  let lastG=null;
  setInterval(()=>{
    try{ const g=state.gold; if(lastG!==null && g!==lastG) sfx('coin'); lastG=g; }catch(e){}
  },200);
})();
