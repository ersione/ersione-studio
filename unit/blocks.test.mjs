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

function finishCascade(state){let next=state;for(let i=0;next.cascade&&i<400;i++)next=step(next,'tick');assert.equal(next.cascade,null);return next;}
test('a clear makes unsupported fragments fall and causes a scored second chain',()=>{
 const state={...newGame(),piece:{type:0,shape:[[1]],x:9,y:HEIGHT-1}};
 state.board[HEIGHT-1].fill(2,0,9);
 for(let x=0;x<5;x++)state.board[HEIGHT-3][x]=3;
 for(let x=5;x<10;x++)state.board[HEIGHT-4][x]=4;
 const clearing=lockPiece(state);assert.equal(clearing.lines,1);assert.equal(clearing.cascade.chain,1);
 assert.equal(step(clearing,'left'),clearing);assert.equal(step(clearing,'drop'),clearing);
 const next=finishCascade(clearing);assert.equal(next.lines,2);assert.equal(next.lastChain,2);assert.equal(next.score,300);
 assert.ok(next.board.every(row=>row.every(v=>!v)));assert.equal(next.over,false);assert.equal(state.board[HEIGHT-3][0],3);
});
test('same-piece fragments stay connected, while separate same-color pieces fall independently',()=>{
 const state={...newGame(),cascade:{chain:1}};
 state.board[HEIGHT-1][0]=2;state.groups[HEIGHT-1][0]=1;
 state.board[HEIGHT-2][0]=4;state.groups[HEIGHT-2][0]=2;
 state.board[HEIGHT-2][1]=4;state.groups[HEIGHT-2][1]=3;
 state.board[HEIGHT-4][3]=5;state.groups[HEIGHT-4][3]=4;
 state.board[HEIGHT-4][4]=5;state.groups[HEIGHT-4][4]=4;
 const next=finishCascade(state);assert.equal(next.board[HEIGHT-2][0],4);assert.equal(next.board[HEIGHT-1][1],4);
 assert.equal(next.board[HEIGHT-1][3],5);assert.equal(next.board[HEIGHT-1][4],5);
});
test('a connected fragment can bridge a gap, but a severed fragment falls',()=>{
 const state={...newGame(),cascade:{chain:1}};
 state.board[HEIGHT-1][0]=2;state.groups[HEIGHT-1][0]=1;
 for(const x of [0,1]){state.board[HEIGHT-2][x]=4;state.groups[HEIGHT-2][x]=2;}
 state.board[HEIGHT-4][7]=4;state.groups[HEIGHT-4][7]=2;
 const next=finishCascade(state);assert.equal(next.board[HEIGHT-2][1],4);assert.equal(next.board[HEIGHT-1][1],0);assert.equal(next.board[HEIGHT-1][7],4);
});
test('large cascade line clears award a finite score and spawn only after settling',()=>{
 const state={...newGame(),piece:{type:0,shape:[[1]],x:0,y:HEIGHT-6},next:1};
 for(let y=HEIGHT-5;y<HEIGHT;y++)state.board[y].fill(2);
 const clearing=lockPiece(state);assert.equal(clearing.lines,5);assert.equal(clearing.score,1200);assert.ok(clearing.cascade);
 const next=finishCascade(clearing);assert.equal(next.piece.type,1);assert.ok(Number.isFinite(next.score));assert.ok(fits(next.board,next.piece));
});
