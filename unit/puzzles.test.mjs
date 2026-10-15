import test from 'node:test';
import assert from 'node:assert/strict';
import {newMines,revealMine,flagMine,neighbors,mineCount,newSoko,moveSoko,newMoles,tickMoles,hitMole} from '../src/puzzle-games.js';

test('first mine reveal protects the clicked cell and all neighboring cells',()=>{
  for(const cell of [0,7,27,56,63]){const s=revealMine(newMines(),cell,()=>.36);assert.equal(s.mines.length,10);assert.equal(new Set(s.mines).size,10);assert.ok([cell,...neighbors(cell)].every(i=>!s.mines.includes(i)));assert.equal(s.over,false);assert.ok(s.open.includes(cell));assert.equal(mineCount(s.mines,cell),0);}
});
test('flags block reveals, stay limited to ten, and can be removed',()=>{
  let s=newMines();for(let i=0;i<12;i++)s=flagMine(s,i);assert.equal(s.flags.length,10);assert.equal(revealMine(s,0),s);s=flagMine(s,0);assert.equal(s.flags.length,9);assert.ok(revealMine(s,0).mines);
});
test('mine hit loses and all safe cells win without mutating the old state',()=>{
  const first=revealMine({...newMines(),mines:[0,7,16,23,32,39,48,55,62,63]},1),lost=revealMine(first,first.mines[0]);assert.equal(lost.over,true);assert.equal(first.over,false);assert.equal(revealMine(lost,4),lost);
  let s=first;for(let i=0;i<64;i++)if(!s.mines.includes(i))s=revealMine(s,i);assert.equal(s.won,true);assert.equal(s.open.length,54);
});
const solutions=[
  'up',
  'left up right down right up',
  'up right right left up up',
  'left left up right right left up up right up right right down down left up',
  'left up right up left down down right right up left up right down down left left down right down left right up up right down left down right',
];
test('every authored Sokoban stage has a playable solution',()=>{
  solutions.forEach((path,level)=>{let state=newSoko(level);for(const d of path.split(' '))state=moveSoko(state,d);assert.equal(state.won,true,`stage ${level+1}`);assert.equal(moveSoko(state,'down'),state);});
});
test('Sokoban blocks walls and stacked boxes and does not mutate history',()=>{
  let s=newSoko(0);for(let i=0;i<3;i++)s=moveSoko(s,'left');const before=s;assert.equal(moveSoko(s,'left'),s);
  const initial=newSoko(0),next=moveSoko(initial,'up');assert.equal(initial.moves,0);assert.equal(next.moves,1);assert.notDeepEqual(initial.boxes,next.boxes);
  const stacked={...newSoko(0),player:31,boxes:[24,17],won:false};assert.equal(moveSoko(stacked,'up'),stacked);assert.equal(before.moves,2);
});
test('mole can be scored only once per appearance and ends after thirty seconds',()=>{
  const s=newMoles(()=>0),hit=hitMole(s,0);assert.equal(hit.score,10);assert.equal(hitMole(hit,0),hit);assert.equal(hitMole(s,1),s);
  const next=tickMoles(hit,.2,()=>0);assert.equal(next.hole,0);
  const end=tickMoles(next,30);assert.equal(end.time,0);assert.equal(end.over,true);assert.equal(hitMole(end,end.hole),end);assert.equal(tickMoles(end,1),end);
});
