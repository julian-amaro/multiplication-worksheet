const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const M=require('../public/model.js');
// A small DOM/event double exercises real app handlers; browser rendering is checked separately.
function boot({raw=null,failSave=false}={}) {
  let doc,stored=raw,confirmResult=false,confirmCount=0;
  class El {
    constructor(tag='div',cls='') {this.tagName=tag.toUpperCase();this.className=cls;this.children=[];this.events={};this.style={};this.attrs={};this.disabled=false;this.textContent='';this.captured=new Set();
      this.classList={toggle:(c,on)=>{const a=new Set(this.className.split(' '));on?a.add(c):a.delete(c);this.className=[...a].join(' ');},add:c=>this.classList.toggle(c,true),remove:c=>this.classList.toggle(c,false)};
    }
    setAttribute(k,v){this.attrs[k]=v;}
    appendChild(e){this.children.push(e);}
    replaceChildren(){this.children=[];}
    set innerHTML(s){this.children=[];if(s.includes('class="answer"')){const a=new El('span','answer');a.hidden=s.includes('class="answer" hidden');this.children.push(a);}if(s.includes('<canvas'))this.children.push(new El('canvas','draw-canvas'));if(s.includes('class="expand"'))this.children.push(new El('button','expand'));}
    querySelectorAll(selector){const parts=selector.split(':');return this.children.flatMap(c=>[...(selector.startsWith('.')?c.className.split(' ').includes(parts[0].slice(1)):c.tagName.toLowerCase()===parts[0]) && (!selector.includes(':not(:disabled)')||!c.disabled)?[c]:[],...c.querySelectorAll(selector)]);}
    querySelector(s){return this.querySelectorAll(s)[0]||null;}
    addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
    fire(k,data={}){const e={target:this,preventDefault(){},...data};for(const f of this.events[k]||[])f(e);}
    focus(){doc.activeElement=this;}
    getBoundingClientRect(){return {left:0,top:0,width:1000,height:800};}
    setPointerCapture(id){this.captured.add(id);}
    hasPointerCapture(id){return this.captured.has(id);}
    releasePointerCapture(id){this.captured.delete(id);this.fire('lostpointercapture',{pointerId:id});}
    getContext(){return {clearRect(){},beginPath(){},arc(){},fill(){},moveTo(){},lineTo(){},stroke(){}};}
  }
  const ids={},body=new El('body'),header=new El('header'),main=new El('main');body.children.push(header,main);
  for(const id of ['problems','saveStatus','pageNumber','studentName','dateField']){ids[id]=new El(id.includes('Name')||id==='dateField'?'input':'div');main.children.push(ids[id]);}
  for(const [id,cls] of [['penButton','pen-btn'],['eraserButton','erase-btn'],['moveButton','move-btn'],['undoButton',''],['clearButton',''],['answersButton','answer-btn'],['newButton','']]){ids[id]=new El('button',cls);header.children.push(ids[id]);}
  ids.zoomModal=new El('div','modal');body.children.push(ids.zoomModal);
  ids.zoomWorkspace=new El();ids.zoomTitle=new El('h2');ids.zoomModal.children.push(ids.zoomTitle,ids.zoomWorkspace);
  for(const [id,cls] of [['closeZoom',''],['zoomPen','pen-btn'],['zoomEraser','erase-btn'],['zoomMove','move-btn'],['zoomUndo',''],['zoomClear',''],['zoomAnswers','answer-btn'],['zoomDone','']]){ids[id]=new El('button',cls);ids.zoomModal.children.push(ids[id]);}
  doc=new El();doc.children=[body];doc.body=body;doc.activeElement=body;doc.getElementById=id=>ids[id];doc.createElement=tag=>new El(tag);
  const win=new El();win.scrollY=0;win.scrollTo=()=>{};
  vm.runInNewContext(fs.readFileSync(require.resolve('../public/app.js'),'utf8'),{WorksheetModel:M,document:doc,window:win,localStorage:{getItem:()=>stored,setItem:(k,v)=>{if(failSave)throw Error('quota');stored=v;}},confirm:()=>{confirmCount++;return confirmResult;}});
  const canvas=i=>ids.problems.children[i].querySelector('canvas');
  const pointer=(c,event,id,x=100,y=200,type='touch',isPrimary=true)=>c.fire(event,{pointerId:id,clientX:x,clientY:y,pointerType:type,isPrimary,button:0});
  const draw=(i,id)=>{pointer(canvas(i),'pointerdown',id);pointer(canvas(i),'pointerup',id,200,300);};
  return {ids,doc,win,canvas,pointer,draw,click:id=>ids[id].fire('click'),state:()=>JSON.parse(stored),raw:()=>stored,allowConfirm:()=>confirmResult=true,confirmCount:()=>confirmCount};
}
test('pointer ID isolation ignores secondary touch and unrelated pointerup',()=>{
  const a=boot(),c=a.canvas(0);a.pointer(c,'pointerdown',1);a.pointer(c,'pointerdown',2,300,400,'touch',false);a.pointer(c,'pointermove',2,400,500,'touch',false);a.pointer(c,'pointerup',2);
  a.pointer(c,'pointermove',1,200,300);a.pointer(c,'pointerup',1,250,350);
  const strokes=a.state().strokes[0];assert.equal(strokes.length,1);assert.equal(strokes[0].points.length,3);assert.equal(strokes[0].points.at(-1).x,.25);
});
test('Pencil supersedes an in-progress palm touch; palm cannot change Pencil stroke',()=>{
  const a=boot();a.pointer(a.canvas(0),'pointerdown',1);a.pointer(a.canvas(1),'pointerdown',2,300,400,'pen');a.pointer(a.canvas(0),'pointermove',1,900,700);a.pointer(a.canvas(1),'pointerup',2,400,500,'pen');
  assert.equal(a.state().strokes[0].length,0);assert.equal(a.state().strokes[1].length,1);
});
test('cancelled pointer is saved, released, and next stroke works',()=>{
  const a=boot(),c=a.canvas(0);a.pointer(c,'pointerdown',1);a.pointer(c,'pointercancel',1);a.draw(0,2);assert.equal(a.state().strokes[0].length,2);assert.equal(c.captured.size,0);
});
test('Move page adds no ink; switching back allows drawing',()=>{
  const a=boot();a.click('moveButton');a.draw(0,1);assert.equal(a.state().strokes[0].length,0);a.click('penButton');a.draw(0,2);assert.equal(a.state().strokes[0].length,1);
});
test('New Worksheet cancellation preserves work; approval resets with fresh problems',()=>{
  const a=boot();a.draw(0,1);const before=a.raw();a.click('newButton');assert.equal(a.raw(),before);assert.equal(a.confirmCount(),1);
  a.allowConfirm();a.click('newButton');assert.equal(a.state().sheetNumber,2);assert.ok(a.state().strokes.every(s=>s.length===0));assert.notDeepEqual(a.state().problems,JSON.parse(before).problems);
});
test('clear confirms both full sheet and enlarged problem',()=>{
  const a=boot();a.draw(0,1);a.click('clearButton');assert.equal(a.state().strokes[0].length,1);
  a.ids.problems.children[0].querySelector('.expand').fire('click');a.click('zoomClear');assert.equal(a.state().strokes[0].length,1);
  a.allowConfirm();a.click('zoomClear');assert.equal(a.state().strokes[0].length,0);assert.equal(a.confirmCount(),3);
});
test('storage failure is visible rather than falsely reporting saved',()=>{
  const a=boot({failSave:true});a.draw(0,1);assert.match(a.ids.saveStatus.textContent,/Unable to save/);assert.equal(a.raw(),null);
});
test('invalid stored work is not overwritten without confirmed reset',()=>{
  const a=boot({raw:'broken'});assert.equal(a.raw(),'broken');a.draw(0,1);assert.equal(a.raw(),'broken');a.click('newButton');assert.equal(a.raw(),'broken');a.allowConfirm();a.click('newButton');assert.equal(a.state().sheetNumber,2);
});
test('ink and answer visibility persist across zoom and back',()=>{
  const a=boot();a.draw(0,1);a.ids.problems.children[0].querySelector('.expand').fire('click');a.click('zoomAnswers');a.pointer(a.ids.zoomWorkspace.querySelector('canvas'),'pointerdown',2);a.pointer(a.ids.zoomWorkspace.querySelector('canvas'),'pointerup',2,400,500);a.click('zoomDone');
  assert.equal(a.state().strokes[0].length,2);assert.equal(a.state().showingAnswers,true);assert.equal(a.ids.problems.children[0].querySelector('.answer').hidden,false);
});
test('another-tab update pauses saving to prevent silent overwrite',()=>{
  const a=boot();const before=a.raw();a.win.fire('storage',{key:M.STORAGE});a.draw(0,1);assert.equal(a.raw(),before);assert.match(a.ids.saveStatus.textContent,/another tab/);
});
