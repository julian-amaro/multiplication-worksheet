const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../public/model.js');
const stroke=(id,tool='pen')=>({id,tool,points:[{x:.2,y:.3},{x:.4,y:.7}]});
test('exact original eight problems and calculated answers',()=>{
  const s=M.fresh();assert.equal(s.problems.length,8);
  assert.deepEqual(s.problems.map(p=>p.a*p.b),[3000,5882,7488,11800,27004,14532,33810,22656]);
});
test('new worksheets stay 3-digit by 2-digit and avoid duplicates and previous problems',()=>{
  let previous=M.fresh().problems;
  for(let i=0;i<50;i++) {
    const next=M.newProblems(previous),keys=next.map(p=>p.a+':'+p.b);
    assert.equal(next.length,8);assert.equal(new Set(keys).size,8);
    for(const p of next){assert.ok(p.a>=120&&p.a<=899&&p.b>=12&&p.b<=79);assert.ok(!previous.some(q=>q.a===p.a&&q.b===p.b));}
    previous=next;
  }
});
test('generator also terminates with constant random source',()=>assert.equal(new Set(M.newProblems([],()=>0).map(p=>p.a+':'+p.b)).size,8));
test('global Undo follows chronology across problems, including eraser',()=>{
  const s=M.fresh();s.strokes[7].push(stroke(1));s.strokes[0].push(stroke(2),stroke(3,'eraser'));
  assert.equal(M.undo(s),0);assert.equal(s.strokes[0].length,1);
  assert.equal(M.undo(s),0);assert.equal(M.undo(s),7);assert.equal(M.undo(s),-1);
});
test('enlarged Undo is restricted to the selected problem',()=>{
  const s=M.fresh();s.strokes[2].push(stroke(1));s.strokes[4].push(stroke(2));
  assert.equal(M.undo(s,2),2);assert.equal(s.strokes[4].length,1);assert.equal(M.undo(s,2),-1);
});
test('reload round-trip preserves ink coordinates, erasures, answers, and local fields',()=>{
  const s=M.fresh();s.strokes[0]=[stroke(1),stroke(2,'eraser')];s.nextId=3;s.studentName='Test';s.showingAnswers=true;s.sheetNumber=3;
  assert.deepEqual(M.decode(JSON.stringify(s)),s);
});
test('legacy prototype records load and acquire stroke IDs',()=>{
  const s=M.fresh();delete s.version;s.strokes[0]=[{tool:'pen',points:[{x:.2,y:.2}]}];
  const loaded=M.decode(JSON.stringify(s));assert.equal(loaded.strokes[0][0].id,1);assert.equal(loaded.nextId,2);
});
test('invalid storage is rejected rather than partly loaded',()=>{
  for(const raw of ['null','{}','not json'])assert.throws(()=>M.decode(raw));
  for(const change of [s=>s.problems[0].a='<script>',s=>s.strokes[0]=null,s=>s.strokes[1]=[{tool:'bad',points:[]}],s=>s.strokes[0]=[{tool:'pen',points:[{x:2,y:0}]}]]){
    const s=M.fresh();change(s);assert.throws(()=>M.decode(JSON.stringify(s)));
  }
});
test('new state has separate ink arrays and no shared problems',()=>{
  const a=M.fresh(),b=M.fresh();a.strokes[0].push(stroke(1));a.problems[0].a=999;
  assert.equal(a.strokes[1].length,0);assert.equal(b.strokes[0].length,0);assert.equal(b.problems[0].a,125);
});
