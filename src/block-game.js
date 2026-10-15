export const WIDTH = 10;
export const HEIGHT = 18;
export const SHAPES = [
  [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]],
  [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]],
  [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]],
];
export const COLORS = ['#82c7c5','#e6c678','#bb9dcc','#a8c691','#e79b93','#8faed6','#dca579'];
const randomType = () => Math.floor(Math.random() * SHAPES.length);
export const spawn = type => ({type, shape: SHAPES[type], x: Math.floor((WIDTH-SHAPES[type][0].length)/2), y: 0});
export function newGame() {
  return {board: Array.from({length:HEIGHT},()=>Array(WIDTH).fill(0)), piece:spawn(randomType()), next:randomType(), score:0, lines:0, over:false};
}
export function fits(board,piece) {
  return piece.shape.every((row,y)=>row.every((v,x)=>!v || (
    piece.x+x>=0 && piece.x+x<WIDTH && piece.y+y>=0 && piece.y+y<HEIGHT && !board[piece.y+y][piece.x+x]
  )));
}
export function landing(board,piece) {
  let ghost=piece;
  while(fits(board,{...ghost,y:ghost.y+1}))ghost={...ghost,y:ghost.y+1};
  return ghost;
}
export function lockPiece(state) {
  const board=state.board.map(row=>[...row]);
  state.piece.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v)board[state.piece.y+y][state.piece.x+x]=state.piece.type+1;}));
  const remaining=board.filter(row=>row.some(v=>!v)), cleared=HEIGHT-remaining.length;
  while(remaining.length<HEIGHT)remaining.unshift(Array(WIDTH).fill(0));
  const piece=spawn(state.next);
  return {...state,board:remaining,piece,next:randomType(),lines:state.lines+cleared,
    score:state.score+[0,100,300,500,800][cleared]*(1+Math.floor(state.lines/10)),over:!fits(remaining,piece)};
}
export function step(state,action) {
  if(state.over)return state;
  const {piece,board}=state;
  if(action==='drop'){
    const target=landing(board,piece);
    return lockPiece({...state,piece:target,score:state.score+(target.y-piece.y)*2});
  }
  if(action==='rotate'){
    const shape=piece.shape[0].map((_,x)=>piece.shape.map(row=>row[x]).reverse());
    for(const offset of [0,-1,1,-2,2,-3,3]){
      const rotated={...piece,shape,x:piece.x+offset};
      if(fits(board,rotated))return {...state,piece:rotated};
    }
    return state;
  }
  const next={...piece,x:piece.x+(action==='left'?-1:action==='right'?1:0),y:piece.y+(['tick','down'].includes(action)?1:0)};
  if(fits(board,next))return {...state,piece:next,score:state.score+(action==='down'?1:0)};
  return ['tick','down'].includes(action)?lockPiece(state):state;
}
