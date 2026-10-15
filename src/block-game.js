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
  return {board: Array.from({length:HEIGHT},()=>Array(WIDTH).fill(0)), piece:spawn(randomType()), next:randomType(), score:0, lines:0, over:false, groups:emptyBoard(), nextGroup:1, cascade:null, lastChain:0};
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
const emptyBoard=()=>Array.from({length:HEIGHT},()=>Array(WIDTH).fill(0));
const linePoints=n=>n<=4?[0,100,300,500,800][n]:800+(n-4)*400;
function clearLines(state,chain){
  const rows=state.board.flatMap((row,y)=>row.every(Boolean)?[y]:[]);if(!rows.length)return null;
  const board=state.board.map((row,y)=>rows.includes(y)?Array(WIDTH).fill(0):[...row]);
  const groups=state.groups.map((row,y)=>rows.includes(y)?Array(WIDTH).fill(0):[...row]);
  return {...state,board,groups,lines:state.lines+rows.length,score:state.score+linePoints(rows.length)*(1+Math.floor(state.lines/10))*chain,cascade:{chain},lastChain:chain};
}
function spawnNext(state){const piece=spawn(state.next);return {...state,piece,next:randomType(),cascade:null,over:!fits(state.board,piece)};}
// A cleared line can split a placed piece. Each remaining connected fragment
// falls together; separate pieces of the same color never become glued together.
export function cascadeStep(state){
  if(!state.cascade)return state;
  const labels=emptyBoard().map(row=>row.map(()=>-1)),parts=[];
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
    if(!state.board[y][x]||labels[y][x]>=0)continue;
    const index=parts.length,id=state.groups[y][x],cells=[[x,y]];labels[y][x]=index;
    for(let i=0;i<cells.length;i++)for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
      const xx=cells[i][0]+dx,yy=cells[i][1]+dy;
      if(xx>=0&&xx<WIDTH&&yy>=0&&yy<HEIGHT&&labels[yy][xx]<0&&state.board[yy][xx]&&state.groups[yy][xx]===id){labels[yy][xx]=index;cells.push([xx,yy]);}
    }
    parts.push(cells);
  }
  const blocked=new Set();parts.forEach((cells,i)=>{if(cells.some(([,y])=>y===HEIGHT-1))blocked.add(i);});
  // Support propagates upward; unsupported stacks can descend simultaneously.
  let changed=true;while(changed){changed=false;parts.forEach((cells,i)=>{if(blocked.has(i))return;if(cells.some(([x,y])=>labels[y+1]?.[x]!==i&&blocked.has(labels[y+1]?.[x]))){blocked.add(i);changed=true;}});}
  if(parts.some((_,i)=>!blocked.has(i))){
    const board=emptyBoard(),groups=emptyBoard();parts.forEach((cells,i)=>cells.forEach(([x,y])=>{const yy=y+(blocked.has(i)?0:1);board[yy][x]=state.board[y][x];groups[yy][x]=state.groups[y][x];}));
    return {...state,board,groups};
  }
  return clearLines(state,state.cascade.chain+1)||spawnNext(state);
}
export function lockPiece(state) {
  const board=state.board.map(row=>[...row]),groups=(state.groups||emptyBoard()).map(row=>[...row]);let nextGroup=Math.max(state.nextGroup||1,1+Math.max(...groups.flat()));
  // Older boards/fixtures without piece identities remain usable.
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++)if(board[y][x]&&!groups[y][x])groups[y][x]=nextGroup++;
  const group=nextGroup++;
  state.piece.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v){board[state.piece.y+y][state.piece.x+x]=state.piece.type+1;groups[state.piece.y+y][state.piece.x+x]=group;}}));
  const placed={...state,board,groups,nextGroup,lastChain:0};return clearLines(placed,1)||spawnNext(placed);
}
export function step(state,action) {
  if(state.over)return state;
  if(state.cascade)return action==='tick'?cascadeStep(state):state;
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
