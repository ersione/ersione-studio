export const DIRECTIONS={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
export function newMines(){return {mines:null,open:[],flags:[],over:false,won:false,moves:0};}
export function neighbors(cell){const x=cell%8,y=Math.floor(cell/8),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&x+dx>=0&&x+dx<8&&y+dy>=0&&y+dy<8)out.push((y+dy)*8+x+dx);return out;}
export const mineCount=(mines,cell)=>neighbors(cell).filter(i=>mines.includes(i)).length;
export function revealMine(state,cell,rng=Math.random){
  if(state.over||state.won||state.flags.includes(cell)||state.open.includes(cell))return state;
  let mines=state.mines;
  if(!mines){const safe=new Set([cell,...neighbors(cell)]),available=Array.from({length:64},(_,i)=>i).filter(i=>!safe.has(i));mines=[];for(let i=0;i<10;i++)mines.push(available.splice(Math.floor(rng()*available.length),1)[0]);}
  if(mines.includes(cell))return {...state,mines,open:[...state.open,cell],over:true,moves:state.moves+1};
  const open=new Set(state.open),pending=[cell];
  while(pending.length){const current=pending.pop();if(open.has(current)||state.flags.includes(current)||mines.includes(current))continue;open.add(current);if(!mineCount(mines,current))pending.push(...neighbors(current));}
  return {...state,mines,open:[...open],won:open.size===54,moves:state.moves+1};
}
export function flagMine(state,cell){
  if(state.over||state.won||state.open.includes(cell))return state;
  if(state.flags.includes(cell))return {...state,flags:state.flags.filter(i=>i!==cell)};
  return state.flags.length<10?{...state,flags:[...state.flags,cell]}:state;
}
export const SOKO_LEVELS=[
  ['#######','#     #','#  .  #','#  $  #','#  @  #','#     #','#######'],
  ['#######','#     #','# . . #','# $ $ #','#  @  #','#     #','#######'],
  ['#######','#  .  #','#  $  #','# # # #','#  $ .#','# @   #','#######'],
  ['#######','# . . #','# $ $ #','#  #  #','# $ . #','#  @  #','#######'],
  ['#######','#.   .#','# $ $ #','#  @  #','# $ $ #','#.   .#','#######'],
];
export function newSoko(level=0){
  const map=SOKO_LEVELS[level],walls=[],goals=[],boxes=[];let player=0;
  map.forEach((row,y)=>[...row].forEach((v,x)=>{const cell=y*7+x;if(v==='#')walls.push(cell);if('.+*'.includes(v))goals.push(cell);if('$*'.includes(v))boxes.push(cell);if('@+'.includes(v))player=cell;}));
  return {walls,goals,boxes,player,moves:0,won:false};
}
export function moveSoko(state,direction){
  if(state.won)return state;
  const [dx,dy]=DIRECTIONS[direction],x=state.player%7+dx,y=Math.floor(state.player/7)+dy,next=y*7+x;
  if(x<0||x>=7||y<0||y>=7||state.walls.includes(next))return state;
  let boxes=state.boxes;
  if(boxes.includes(next)){
    const bx=x+dx,by=y+dy,beyond=by*7+bx;
    if(bx<0||bx>=7||by<0||by>=7||state.walls.includes(beyond)||boxes.includes(beyond))return state;
    boxes=boxes.map(i=>i===next?beyond:i);
  }
  return {...state,boxes,player:next,moves:state.moves+1,won:state.goals.every(i=>boxes.includes(i))};
}
export function newMoles(rng=Math.random){return {time:30,score:0,hits:0,hole:Math.floor(rng()*9),wait:.85,over:false};}
export function tickMoles(state,dt,rng=Math.random){
  if(state.over)return state;
  const time=Math.max(0,state.time-dt);let hole=state.hole,wait=state.wait-dt;
  if(wait<=0){const next=Math.floor(rng()*(state.hole===null?9:8));hole=state.hole===null?next:next>=state.hole?next+1:next;wait=Math.max(.45,.85-state.hits*.01);}
  return {...state,time,hole,wait,over:time===0};
}
export function hitMole(state,hole){return !state.over&&hole===state.hole?{...state,hits:state.hits+1,score:state.score+10,hole:null,wait:.13}:state;}
