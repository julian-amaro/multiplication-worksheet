/* Pure worksheet state; no network, accounts, or browser dependencies. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WorksheetModel = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const W = 1000, H = 800, STORAGE = 'multiplication-worksheet-v1';
  const initialProblems = [{a:125,b:24},{a:346,b:17},{a:208,b:36},{a:472,b:25},{a:628,b:43},{a:519,b:28},{a:735,b:46},{a:384,b:59}];
  const blankInk = () => Array.from({length:8}, () => []);
  function fresh() {
    return {version:2, problems:initialProblems.map(p=>({...p})), strokes:blankInk(), showingAnswers:false,
      sheetNumber:1, studentName:'', date:new Date().toLocaleDateString('en-US'), nextId:1};
  }
  function decode(raw) {
    const d = JSON.parse(raw);
    if (!d || !Array.isArray(d.problems) || d.problems.length!==8 ||
      !d.problems.every(p=>p && Number.isInteger(p.a) && p.a>=100 && p.a<=999 && Number.isInteger(p.b) && p.b>=10 && p.b<=99) ||
      !Array.isArray(d.strokes) || d.strokes.length!==8) throw Error('Invalid worksheet');
    let nextId=1;
    const strokes=d.strokes.map(list=>{
      if(!Array.isArray(list)) throw Error('Invalid ink');
      return list.map(s=>{
        if(!s || !['pen','eraser'].includes(s.tool) || !Array.isArray(s.points) || !s.points.length ||
          !s.points.every(p=>p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x>=0 && p.x<=1 && p.y>=0 && p.y<=1)) throw Error('Invalid stroke');
        const id=Number.isSafeInteger(s.id) && s.id>0 ? s.id : nextId;
        nextId=Math.max(nextId,id+1);
        return {id, tool:s.tool, points:s.points.map(p=>({x:p.x,y:p.y}))};
      });
    });
    return {...fresh(), problems:d.problems.map(p=>({a:p.a,b:p.b})), strokes,
      showingAnswers:d.showingAnswers===true, sheetNumber:Number.isSafeInteger(d.sheetNumber)&&d.sheetNumber>0?d.sheetNumber:1,
      studentName:typeof d.studentName==='string'?d.studentName.slice(0,100):'',
      date:typeof d.date==='string'?d.date.slice(0,40):fresh().date, nextId};
  }
  function newProblems(previous=[], random=Math.random) {
    // A bounded shuffle guarantees eight unique problems, none repeated from the old sheet.
    const used=new Set(previous.map(p=>p.a+':'+p.b)), pool=[];
    for(let a=120;a<=899;a++) for(let b=12;b<=79;b++) if(!used.has(a+':'+b)) pool.push({a,b});
    for(let i=0;i<8;i++) { const j=i+Math.floor(random()*(pool.length-i)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    return pool.slice(0,8);
  }
  function lastWrittenIndex(state) {
    let idx=-1, latest=-1;
    state.strokes.forEach((list,i)=>{ const last=list.at(-1); if(last && last.id>latest) {idx=i;latest=last.id;} });
    return idx;
  }
  function undo(state, index=null) {
    const i=index===null?lastWrittenIndex(state):index;
    if(i<0 || !state.strokes[i].length) return -1;
    state.strokes[i].pop(); return i;
  }
  function hasInk(state,index=null) { return index===null?state.strokes.some(s=>s.length):state.strokes[index].length>0; }
  return {W,H,STORAGE,fresh,decode,newProblems,blankInk,lastWrittenIndex,undo,hasInk};
});
