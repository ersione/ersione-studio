import React,{useRef,useState} from 'react';
import {slide,addTile,newNumbers,isOver} from './number-game';

export default function NumberGame(){
  const [game,setGame]=useState(newNumbers),boardRef=useRef(null),touch=useRef(null);
  const over=isOver(game.board),won=game.board.some(row=>row.some(v=>v>=2048));
  function move(direction){setGame(current=>{const result=slide(current.board,direction);return result.changed?{board:addTile(result.board),score:current.score+result.gained}:current;});}
  function keydown(e){
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    const direction={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key];
    if(direction){e.preventDefault();move(direction);}
  }
  function endTouch(e){
    if(!touch.current)return;
    const [x,y]=touch.current;touch.current=null;
    const dx=e.clientX-x,dy=e.clientY-y;
    if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;
    move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');
  }
  return <section className="number-game" aria-label="2048 게임" onKeyDown={keydown}>
    <p className="eyebrow">A LITTLE BREAK / 03</p><div className="number-heading"><h2>2048</h2><div><small>점수</small><strong data-number-score={game.score}>{game.score.toLocaleString()}</strong></div></div>
    <p>같은 숫자를 합쳐서 2048을 만들어보세요.</p>
    <div className="number-board" ref={boardRef} tabIndex={0} role="img" aria-label={`2048 게임판: ${game.board.flat().map(v=>v||'빈칸').join(', ')}. 방향키 또는 스와이프로 조작.`} onPointerDown={e=>{touch.current=[e.clientX,e.clientY];e.currentTarget.setPointerCapture(e.pointerId);}} onPointerUp={endTouch} onPointerCancel={()=>{touch.current=null;}}>
      {game.board.flat().map((value,i)=><span key={i} className={`number-tile tile-${Math.min(value,2048)}`} data-value={value}>{value||''}</span>)}
    </div>
    <p role="status">{over?'더 움직일 수 없어요. 다시 도전해볼까요?':won?'2048 완성! 더 큰 숫자에 도전해도 좋아요.':'한 번에 한 쌍씩, 같은 숫자가 만나면 두 배!'}</p>
    <div className="number-controls" aria-label="2048 조작">{[['left','←','왼쪽'],['up','↑','위쪽'],['down','↓','아래쪽'],['right','→','오른쪽']].map(([direction,label,name])=><button key={direction} aria-label={`숫자 ${name}으로 밀기`} disabled={over} onClick={()=>move(direction)}>{label}</button>)}</div>
    <p className="block-help">방향키 · 화면 스와이프 · 아래 방향 버튼</p><button className="action secondary" onClick={()=>{setGame(newNumbers());boardRef.current?.focus();}}>다시 하기 ↻</button>
  </section>;
}
