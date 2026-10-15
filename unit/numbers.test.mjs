import test from 'node:test';
import assert from 'node:assert/strict';
import {slide,addTile,isOver,newNumbers} from '../src/number-game.js';
const board=row=>[row,...Array.from({length:3},()=>[0,0,0,0])];
test('2048 merges each tile once, collapses gaps, and scores all pairs',()=>{
  const input=board([2,2,2,2]),result=slide(input,'left');
  assert.deepEqual(result.board[0],[4,4,0,0]);assert.equal(result.gained,8);
  assert.deepEqual(input[0],[2,2,2,2]);
  assert.deepEqual(slide(board([2,0,2,4]),'right').board[0],[0,0,4,4]);
  assert.equal(slide(board([4,0,0,0]),'left').changed,false);
});
test('2048 handles vertical moves in both directions',()=>{
  const input=[[2,0,0,0],[2,0,0,0],[4,0,0,0],[4,0,0,0]];
  assert.deepEqual(slide(input,'up').board.map(r=>r[0]),[4,8,0,0]);
  assert.deepEqual(slide(input,'down').board.map(r=>r[0]),[0,0,4,8]);
});
test('2048 detects blocked boards but permits a full board with a merge',()=>{
  const full=[[2,4,2,4],[4,2,4,2],[2,4,2,4],[4,2,4,2]];
  assert.equal(isOver(full),true);assert.equal(addTile(full),full);
  full[0][0]=4;assert.equal(isOver(full),false);
});
test('new game starts with two tiles and adding a tile never replaces one',()=>{
  const state=newNumbers();assert.equal(state.board.flat().filter(Boolean).length,2);
  const next=addTile(state.board);assert.equal(next.flat().filter(Boolean).length,3);
  state.board.forEach((row,r)=>row.forEach((v,c)=>{if(v)assert.equal(next[r][c],v);}));
});
