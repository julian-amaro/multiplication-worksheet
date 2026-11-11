(() => {
  'use strict';
  const M=WorksheetModel, {W,H,STORAGE}=M, $=id=>document.getElementById(id);
  let state=M.fresh(), tool='pen', zoomIndex=null, active=null, blockedSave=false, loadWarning='';
  const root=$('problems'), zoomModal=$('zoomModal'), zoomWorkspace=$('zoomWorkspace');
  try {
    const raw=localStorage.getItem(STORAGE);
    if(raw) state=M.decode(raw);
  } catch(err) {
    // Preserve unreadable storage until an explicit new-sheet action; don't silently overwrite it.
    blockedSave=true;
    loadWarning='Previous work could not be loaded. It has not been overwritten. Start a New Worksheet to reset, or keep this page open while you work.';
  }
  function status(message,warning=false) {
    $('saveStatus').textContent=message; $('saveStatus').classList.toggle('warning',warning);
  }
  function save() {
    if(blockedSave) {status(loadWarning,true);return;}
    try { localStorage.setItem(STORAGE,JSON.stringify(state)); status('Saved in this browser.'); }
    catch(err) {status('Unable to save in this browser. Keep this page open or print a copy before leaving.',true);}
  }
  function formulaHtml(p,i) {
    // Same SVG viewBox as the ink canvas: carrying marks never drift when enlarging or rotating.
    return `<svg class="equation" viewBox="0 0 ${W} ${H}" aria-hidden="true"><text x="20" y="72" font-size="40" fill="#56564e">${i+1}.</text><g font-size="76" text-anchor="end" style="font-variant-numeric:tabular-nums"><text x="790" y="145">${p.a}</text><text x="790" y="225">${p.b}</text><text x="650" y="225">×</text></g><path d="M 580 249 H 805" stroke="#343633" stroke-width="4"/></svg><span class="answer" ${state.showingAnswers?'':'hidden'}>Answer: ${p.a*p.b}</span>`;
  }
  function renderSheet() {
    root.replaceChildren();
    state.problems.forEach((p,i)=>{
      const el=document.createElement('article'); el.className='problem';
      el.setAttribute('aria-label',`Problem ${i+1}: ${p.a} times ${p.b}`);
      el.innerHTML=formulaHtml(p,i)+`<canvas class="draw-canvas" width="${W}" height="${H}" aria-label="Write on problem ${i+1} with stylus or finger"></canvas><button class="expand" type="button" aria-label="Enlarge problem ${i+1}">Enlarge ↗</button>`;
      bindCanvas(el.querySelector('canvas'),i); el.querySelector('.expand').addEventListener('click',()=>openZoom(i));
      root.appendChild(el); paintCanvas(el.querySelector('canvas'),i);
    });
    $('pageNumber').textContent=`Worksheet ${state.sheetNumber}`;
    $('studentName').value=state.studentName; $('dateField').value=state.date; refreshControls();
  }
  function pointAt(canvas,evt) {
    const b=canvas.getBoundingClientRect();
    return {x:Math.max(0,Math.min(1,(evt.clientX-b.left)/b.width)),y:Math.max(0,Math.min(1,(evt.clientY-b.top)/b.height))};
  }
  function drawStroke(ctx,stroke) {
    ctx.globalCompositeOperation=stroke.tool==='eraser'?'destination-out':'source-over';
    ctx.strokeStyle='#245eab';ctx.fillStyle='#245eab';ctx.lineWidth=stroke.tool==='eraser'?35:5;
    ctx.beginPath(); const pts=stroke.points;
    if(pts.length===1) {ctx.arc(pts[0].x*W,pts[0].y*H,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}
    else {ctx.moveTo(pts[0].x*W,pts[0].y*H);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x*W,pts[i].y*H);ctx.stroke();}
  }
  function paintCanvas(canvas,index) {
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,W,H);ctx.lineCap='round';ctx.lineJoin='round';
    for(const s of state.strokes[index])drawStroke(ctx,s);
    ctx.globalCompositeOperation='source-over';
  }
  function refreshAllCanvas(index) {
    root.querySelectorAll('canvas').forEach((c,i)=>{if(index===undefined || index===i)paintCanvas(c,i);});
    const c=zoomWorkspace.querySelector('canvas');
    if(c && zoomIndex!==null && (index===undefined || zoomIndex===index))paintCanvas(c,zoomIndex);
  }
  function finishActive(evt) {
    if(!active || (evt && evt.pointerId!==active.pointerId))return;
    const a=active; active=null;
    if(a.canvas.hasPointerCapture(a.pointerId))a.canvas.releasePointerCapture(a.pointerId);
    save();refreshAllCanvas(a.index);refreshControls();
  }
  function bindCanvas(canvas,index) {
    canvas.addEventListener('pointerdown',evt=>{
      if(tool==='move' || (evt.pointerType==='mouse' && evt.button!==0))return;
      if(active) {
        if(evt.pointerType!=='pen' || active.pointerType==='pen')return;
        // A Pencil arriving after a palm touch replaces the accidental in-progress touch.
        const old=active; active=null; state.strokes[old.index].pop();
        if(old.canvas.hasPointerCapture(old.pointerId))old.canvas.releasePointerCapture(old.pointerId);
        refreshAllCanvas(old.index);
      }
      if(evt.pointerType==='touch' && !evt.isPrimary)return;
      evt.preventDefault();
      const stroke={id:state.nextId++,tool,points:[pointAt(canvas,evt)]}; state.strokes[index].push(stroke);
      active={stroke,canvas,index,pointerId:evt.pointerId,pointerType:evt.pointerType};
      canvas.setPointerCapture(evt.pointerId);paintCanvas(canvas,index);refreshControls();
    });
    canvas.addEventListener('pointermove',evt=>{
      if(!active || active.canvas!==canvas || evt.pointerId!==active.pointerId)return;
      evt.preventDefault();
      const samples=typeof evt.getCoalescedEvents==='function'?evt.getCoalescedEvents():[];
      for(const e of samples.length?samples:[evt]) {
        const p=pointAt(canvas,e),last=active.stroke.points.at(-1);
        if(Math.abs(p.x-last.x)+Math.abs(p.y-last.y)>0.0005)active.stroke.points.push(p);
      }
      paintCanvas(canvas,index);
    });
    canvas.addEventListener('pointerup',evt=>{
      if(active && active.canvas===canvas && active.pointerId===evt.pointerId) {
        active.stroke.points.push(pointAt(canvas,evt));finishActive(evt);
      }
    });
    canvas.addEventListener('pointercancel',finishActive);
    canvas.addEventListener('lostpointercapture',finishActive);
  }
  function refreshControls() {
    for(const [cls,t] of [['pen-btn','pen'],['erase-btn','eraser'],['move-btn','move']]) {
      document.querySelectorAll('.'+cls).forEach(b=>{b.classList.toggle('active',tool===t);b.setAttribute('aria-pressed',String(tool===t));});
    }
    document.body.classList.toggle('move-mode',tool==='move');
    document.querySelectorAll('.answer-btn').forEach(b=>{b.textContent=state.showingAnswers?'Hide Answers':'Show Answers';b.setAttribute('aria-pressed',String(state.showingAnswers));});
    $('undoButton').disabled=!M.hasInk(state);$('clearButton').disabled=!M.hasInk(state);
    $('zoomUndo').disabled=zoomIndex===null || !M.hasInk(state,zoomIndex);
    $('zoomClear').disabled=$('zoomUndo').disabled;
  }
  function setTool(t){finishActive();tool=t;refreshControls();}
  for(const [cls,t] of [['pen-btn','pen'],['erase-btn','eraser'],['move-btn','move']])document.querySelectorAll('.'+cls).forEach(b=>b.addEventListener('click',()=>setTool(t)));
  function undo() {finishActive();const index=M.undo(state,zoomIndex);if(index<0)return;refreshAllCanvas(index);save();refreshControls();}
  function clearInk() {
    finishActive();if(!M.hasInk(state,zoomIndex))return;
    if(!confirm(zoomIndex===null?'Erase all handwriting on this worksheet?':'Erase all handwriting on this problem?'))return;
    if(zoomIndex===null)state.strokes=M.blankInk();else state.strokes[zoomIndex]=[];
    refreshAllCanvas();save();refreshControls();
  }
  for(const id of ['undoButton','zoomUndo'])$(id).addEventListener('click',undo);
  for(const id of ['clearButton','zoomClear'])$(id).addEventListener('click',clearInk);
  document.querySelectorAll('.answer-btn').forEach(b=>b.addEventListener('click',()=>{
    state.showingAnswers=!state.showingAnswers;
    document.querySelectorAll('.answer').forEach(a=>a.hidden=!state.showingAnswers);refreshControls();save();
  }));
  $('newButton').addEventListener('click',()=>{
    finishActive();
    if((M.hasInk(state) || blockedSave) && !confirm('Create a new worksheet? This will replace the current handwriting and saved worksheet.'))return;
    state.problems=M.newProblems(state.problems);state.strokes=M.blankInk();state.nextId=1;
    state.showingAnswers=false;state.sheetNumber++;state.date=new Date().toLocaleDateString('en-US');
    blockedSave=false;setTool('pen');save();renderSheet();window.scrollTo({top:0,behavior:'smooth'});
  });
  $('studentName').addEventListener('input',e=>{state.studentName=e.target.value;save();});
  $('dateField').addEventListener('input',e=>{state.date=e.target.value;save();});
  let previousFocus, scrollY=0;
  function openZoom(index) {
    finishActive();previousFocus=document.activeElement;zoomIndex=index;const p=state.problems[index];
    $('zoomTitle').textContent=`Problem ${index+1} · ${p.a} × ${p.b}`;
    zoomWorkspace.innerHTML=formulaHtml(p,index)+`<canvas class="draw-canvas" width="${W}" height="${H}" aria-label="Enlarged writing space for problem ${index+1}"></canvas>`;
    const canvas=zoomWorkspace.querySelector('canvas');bindCanvas(canvas,index);paintCanvas(canvas,index);
    zoomModal.classList.add('open');scrollY=window.scrollY;
    document.body.style.position='fixed';document.body.style.top=`-${scrollY}px`;document.body.style.width='100%';
    document.querySelector('header').inert=true;document.querySelector('main').inert=true;
    $('closeZoom').focus();refreshControls();
  }
  function closeZoom() {
    if(zoomIndex===null)return;finishActive();const index=zoomIndex;zoomIndex=null;
    zoomModal.classList.remove('open');zoomWorkspace.replaceChildren();
    document.body.style.position='';document.body.style.top='';document.body.style.width='';
    document.querySelector('header').inert=false;document.querySelector('main').inert=false;
    window.scrollTo(0,scrollY);refreshAllCanvas(index);save();refreshControls();previousFocus?.focus({preventScroll:true});
  }
  $('closeZoom').addEventListener('click',closeZoom);$('zoomDone').addEventListener('click',closeZoom);
  document.addEventListener('keydown',evt=>{
    if(evt.key==='Escape' && zoomIndex!==null)closeZoom();
    if(evt.key==='Tab' && zoomIndex!==null) {
      const buttons=[...zoomModal.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);
      if(evt.shiftKey && document.activeElement===first){evt.preventDefault();last.focus();}
      else if(!evt.shiftKey && document.activeElement===last){evt.preventDefault();first.focus();}
    }
    if((evt.ctrlKey||evt.metaKey) && evt.key.toLowerCase()==='z' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){evt.preventDefault();undo();}
  });
  window.addEventListener('pagehide',()=>{finishActive();save();});
  window.addEventListener('blur',()=>finishActive());
  document.addEventListener('visibilitychange',()=>{if(document.hidden){finishActive();save();}});
  // Prevent a second tab from silently overwriting the first tab's latest work.
  window.addEventListener('storage',e=>{if(e.key===STORAGE){blockedSave=true;loadWarning='This worksheet changed in another tab. Reload to use that version. Work here is not saving until you reload or start a New Worksheet.';status(loadWarning,true);}});
  renderSheet();save();
})();
