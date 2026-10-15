import test from 'node:test';
import assert from 'node:assert/strict';
import {HEIGHT,WIDTH,newGame,spawn,fits,step,lockPiece,landing} from '../src/block-game.js';

test('pieces cannot pass walls, floor or occupied cells',()=>{
  const {board}=newGame(),piece=spawn(1);
  assert.equal(fits(board,{...piece,x:-1}),false);
  assert.equal(fits(board,{...piece,x:WIDTH-1}),false);
  assert.equal(fits(board,{...piece,y:HEIGHT-1}),false);
  board[0][piece.x]=1;
  assert.equal(fits(board,piece),false);
});
test('hard drop lands above occupied cells and locks, without mutating the old board',()=>{
  const state={...newGame(),piece:{...spawn(1),x:0}};
  state.board[HEIGHT-1][0]=3;
  assert.equal(landing(state.board,state.piece).y,HEIGHT-3);
  const next=step(state,'drop');
  assert.equal(next.board[HEIGHT-2][0],2);
  assert.equal(next.board[HEIGHT-1][0],3);
  assert.equal(state.board[HEIGHT-2][0],0);
  assert.equal(next.score,(HEIGHT-3)*2);
});
test('two full rows clear together, update score, and preserve board dimensions',()=>{
  const state={...newGame(),piece:{...spawn(1),x:0,y:HEIGHT-2}};
  state.board[HEIGHT-1].fill(1,2);state.board[HEIGHT-2].fill(1,2);
  const next=lockPiece(state);
  assert.equal(next.lines,2);assert.equal(next.score,300);
  assert.equal(next.board.length,HEIGHT);
  assert.ok(next.board.every(row=>row.length===WIDTH&&row.every(v=>!v)));
});
test('rotation shifts a vertical piece away from a wall',()=>{
  let state={...newGame(),piece:spawn(0)};
  state=step(state,'rotate');state={...state,piece:{...state.piece,x:WIDTH-1}};
  const rotated=step(state,'rotate');
  assert.equal(rotated.piece.shape[0].length,4);
  assert.equal(fits(rotated.board,rotated.piece),true);
});
test('blocked spawn ends the game and further inputs cannot change it',()=>{
  const state={...newGame(),piece:{...spawn(1),x:0,y:HEIGHT-2},next:1};
  state.board[0][4]=1;
  const next=lockPiece(state);
  assert.equal(next.over,true);assert.equal(step(next,'drop'),next);
});
