export function slide(board,direction){
  const next=Array.from({length:4},()=>Array(4).fill(0));let gained=0;
  const position=(line,index)=>direction==='left'?[line,index]:direction==='right'?[line,3-index]:direction==='up'?[index,line]:[3-index,line];
  for(let line=0;line<4;line++){
    const values=Array.from({length:4},(_,i)=>{const [r,c]=position(line,i);return board[r][c];}).filter(Boolean),merged=[];
    for(let i=0;i<values.length;i++){
      if(values[i]===values[i+1]){const value=values[i]*2;merged.push(value);gained+=value;i++;}
      else merged.push(values[i]);
    }
    for(let i=0;i<4;i++){const [r,c]=position(line,i);next[r][c]=merged[i]||0;}
  }
  return {board:next,gained,changed:next.some((row,r)=>row.some((v,c)=>v!==board[r][c]))};
}
export function addTile(board){
  const empty=board.flatMap((row,r)=>row.flatMap((v,c)=>v?[]:[[r,c]]));
  if(!empty.length)return board;
  const [r,c]=empty[Math.floor(Math.random()*empty.length)],next=board.map(row=>[...row]);
  next[r][c]=Math.random()<.9?2:4;return next;
}
export function newNumbers(){return {board:addTile(addTile(Array.from({length:4},()=>Array(4).fill(0)))),score:0};}
export function isOver(board){return ['left','right','up','down'].every(d=>!slide(board,d).changed);}
