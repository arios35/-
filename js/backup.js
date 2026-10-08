  // ===== データのバックアップ(書き出し・読み込み) =====
  // セーブはこのブラウザの中だけにある。ブラウザのデータが消えたときのために、文字列にして書き出し・読み込みできるようにする。
  //   書き出し: セーブ → 「NONBIRI1:チェックサム:Base64」の1本の文字列(コピーして、メモなどに保管する)
  //   読み込み: 貼り付けた文字列を検査 → 中身を見せて確認 → セーブを書き換えてリロード。直前のデータは1つだけ取っておく
  const BK_PREV_KEY = SAVE_KEY + '-prev';
  const bkEl = id => document.getElementById(id);
  function bkChecksum(str){ let h = 5381; for(let i=0;i<str.length;i++) h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0; return h.toString(36); }
  function bkToB64(s){
    const bytes = new TextEncoder().encode(s); let bin = '';
    for(let i=0;i<bytes.length;i+=0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i+0x8000));
    return btoa(bin);
  }
  function bkFromB64(b){ const bin = atob(b), bytes = new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i); return new TextDecoder().decode(bytes); }
  function bkEncode(json){ return 'NONBIRI1:' + bkChecksum(json) + ':' + bkToB64(json); }
  function bkDecode(text){                                          // 成功 → { data, json } / 失敗 → { error }
    const t = String(text||'').replace(/\s+/g, '');
    const m = t.match(/^NONBIRI1:([0-9a-z]+):([A-Za-z0-9+\/=]+)$/);
    if(!m) return { error:'形式が違います。「書き出す」で出た文字列を、そのまま貼り付けてください。' };
    let json; try{ json = bkFromB64(m[2]); }catch(e){ return { error:'文字列が壊れています(途中で切れていませんか?)' }; }
    if(bkChecksum(json) !== m[1]) return { error:'文字列が壊れています(途中で切れていませんか?)' };
    let data; try{ data = JSON.parse(json); }catch(e){ return { error:'データを読み取れませんでした。' }; }
    if(!data || typeof data!=='object' || typeof data.gold!=='number' || typeof data.day!=='number' || typeof data.map!=='string' || !MAP_LAYOUTS[data.map]) return { error:'このゲームのデータではないようです。' };
    return { data, json };
  }
  function bkSnapshot(){                                            // 書き出すデータ。手つかずの畑マスは、あとで自動で作られるので省いて小さくする
    const copy = JSON.parse(JSON.stringify(state));
    for(const k of Object.keys(copy.tiles||{})){ const t = copy.tiles[k]; if(!t.tilled && !t.planted && !t.watered) delete copy.tiles[k]; }
    return copy;
  }
  function bkSummary(d){ return `${d.day}日目・所持金${d.gold}G・${MAP_NAMES[d.map]||d.map}`; }
  function bkApplyRaw(raw){                                         // セーブを raw に書き換えてリロード。入れ替えた「いまのデータ」は、元に戻す用に取っておく
    save(); saveLocked = true;                                      // いまのデータを保存してから、自動セーブを止める(止めないと、リロード前に上書きされる)
    try{ const cur = localStorage.getItem(SAVE_KEY); if(cur) localStorage.setItem(BK_PREV_KEY, cur); localStorage.setItem(SAVE_KEY, raw); }
    catch(e){ saveLocked = false; return false; }
    location.reload(); return true;
  }

  // ---- 画面 ----
  let bkArmed = null;                                               // 'import' / 'undo':もう一度押すと実行する状態
  const bkMsg = t => { bkEl('bkMsg').textContent = t; };
  function bkReset(){ bkArmed = null; bkEl('bkImport').textContent = '読み込む'; bkEl('bkUndo').textContent = '元に戻す'; }
  function bkRefresh(){
    bkEl('bkUndoRow').style.display = localStorage.getItem(BK_PREV_KEY) ? '' : 'none';
    bkEl('bkInfo').textContent = state.backupDay ? `最後に書き出した日: ${state.backupDay}日目(いまは${state.day}日目)` : 'まだ書き出していません';
  }
  function openBackup(){
    const ta = bkEl('bkText'); ta.value = ''; ta.readOnly = false;
    bkReset(); bkRefresh(); bkMsg(''); bkEl('backupModal').classList.add('open');
  }
  bkEl('btnBackup').addEventListener('click', openBackup);
  bkEl('closeBackup').onclick = ()=>bkEl('backupModal').classList.remove('open');
  bkEl('bkText').addEventListener('input', bkReset);               // 貼り付け直したら、確認待ちは解除

  bkEl('bkExport').onclick = ()=>{
    state.backupDay = state.day; save();
    const code = bkEncode(JSON.stringify(bkSnapshot())), ta = bkEl('bkText');
    ta.readOnly = true; ta.value = code; bkReset(); bkRefresh();                                     // 読み取り専用にして、キーボードを出さない
    const size = Math.max(1, Math.round(code.length/1024)) + 'KB';
    const manual = ()=>{
      let done = false;
      try{ ta.focus(); ta.select(); if(ta.setSelectionRange) ta.setSelectionRange(0, code.length); done = (typeof document.execCommand==='function') && document.execCommand('copy'); }catch(e){}
      bkMsg(done ? `書き出してコピーしました✅(${size})。メモなどに貼って保管してください。`
                 : `書き出しました(${size})。コピーできなかったので、枠の中を長押しして「すべてを選択」→「コピー」してください。`);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(code).then(()=>bkMsg(`書き出してコピーしました✅(${size})。メモなどに貼って保管してください。`), manual);
    } else manual();
  };
  bkEl('bkImport').onclick = ()=>{
    const ta = bkEl('bkText');
    if(ta.readOnly){ ta.readOnly = false; ta.value = ''; }          // 書き出した文字列が出たままなら、いったん空にして、貼り付けを待つ
    const text = ta.value.trim();
    if(!text){ bkReset(); bkMsg('上の枠に、書き出した文字列を貼り付けてから、もう一度押してください。'); try{ ta.focus(); }catch(e){} return; }
    const r = bkDecode(text);
    if(r.error){ bkReset(); bkMsg(r.error); return; }
    if(bkArmed !== 'import'){
      bkArmed = 'import'; bkEl('bkImport').textContent = 'この内容で上書きする';
      bkMsg(`読み込む内容: ${bkSummary(r.data)}\nいまのデータ(${bkSummary(state)})は上書きされます。直前のデータは「元に戻す」で復元できます。よければ、もう一度押してください。`);
      return;
    }
    if(!bkApplyRaw(r.json)){ bkReset(); bkMsg('読み込めませんでした(保存領域がいっぱいかもしれません)。'); }
  };
  bkEl('bkUndo').onclick = ()=>{
    const prev = localStorage.getItem(BK_PREV_KEY); if(!prev){ bkRefresh(); return; }
    let d = null; try{ d = JSON.parse(prev); }catch(e){}
    if(!d){ bkMsg('戻せるデータが壊れていました。'); return; }
    if(bkArmed !== 'undo'){
      bkArmed = 'undo'; bkEl('bkUndo').textContent = 'もう一度押すと戻す';
      bkMsg(`戻すデータ: ${bkSummary(d)}\nいまのデータは、入れ替えで取っておきます。よければ、もう一度押してください。`); return;
    }
    bkApplyRaw(prev);
  };
