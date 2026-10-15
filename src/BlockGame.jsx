import React,{useEffect,useRef,useState} from 'react';
import {COLORS,SHAPES,newGame,step,landing} from './block-game';

export default function BlockGame(){
  const [game,setGame]=useState(newGame),[started,setStarted]=useState(false),[paused,setPaused]=useState(false);
  const boardRef=useRef(null);
  const level=1+Math.floor(game.lines/10),active=started&&!paused&&!game.over;
  useEffect(()=>{
    if(!active)return;
    const timer=setInterval(()=>setGame(g=>step(g,'tick')),Math.max(120,750-(level-1)*65));
    return()=>clearInterval(timer);
  },[active,level]);
  useEffect(()=>{
    const pause=()=>setPaused(true);
    const visibility=()=>{if(document.hidden)pause();};
    window.addEventListener('blur',pause);document.addEventListener('visibilitychange',visibility);
    return()=>{window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  const play=action=>{if(active)setGame(g=>step(g,action));};
  const restart=()=>{setGame(newGame());setStarted(true);setPaused(false);boardRef.current?.focus();};
  function keydown(e){
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    if(e.key===' '&&e.target.tagName==='BUTTON')return;
    const action={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rotate',' ':'drop'}[e.key];
    if(action){e.preventDefault();if(!e.repeat||!['drop','rotate'].includes(action))play(action);}
    if(e.key.toLowerCase()==='p'&&started&&!game.over){e.preventDefault();if(!e.repeat)setPaused(p=>!p);}
  }
  const cells=game.board.map(row=>row.map(value=>({value})));
  if(!game.over){
    const ghost=landing(game.board,game.piece);
    ghost.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v)cells[ghost.y+y][ghost.x+x]={value:ghost.type+1,ghost:true};}));
    game.piece.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v)cells[game.piece.y+y][game.piece.x+x]={value:game.piece.type+1};}));
  }
  return <section className="block-game" onKeyDown={keydown} aria-label="블록 쌓기 게임">
    <p className="eyebrow">A LITTLE BREAK / 02</p><h2>블록 쌓기</h2><p>차곡차곡, 한 줄을 채우면 사라져요.</p>
    <div className="block-layout">
      <div className="block-board-wrap"><div className="block-board" ref={boardRef} tabIndex={0} role="img" aria-label="블록 게임판. 방향키로 이동과 회전, 스페이스로 바로 내리기, P로 일시정지." data-score={game.score} data-lines={game.lines}>
        {cells.flat().map((cell,i)=><span key={i} className={`block-cell${cell.value?' filled':''}${cell.ghost?' ghost':''}`} style={cell.value?{'--block':COLORS[cell.value-1]}:undefined}/>)}
      </div>{(!started||paused||game.over)&&<div className="block-overlay"><strong>{game.over?'다시 쌓아볼까요?':!started?'작은 블록, 작은 휴식':'잠깐 쉬는 중'}</strong><span>{game.over?`${game.score}점 · ${game.lines}줄 완성`:!started?'빈틈없이 한 줄을 채워보세요.':'준비되면 이어서 해요.'}</span><button className="action" onClick={game.over||!started?restart:()=>{setPaused(false);boardRef.current?.focus();}}>{game.over?'다시 시작':!started?'게임 시작':'계속하기'}</button></div>}</div>
      <aside className="block-sidebar"><div><small>점수</small><strong>{game.score.toLocaleString()}</strong></div><div><small>완성한 줄</small><strong>{game.lines}</strong></div><div><small>레벨</small><strong>{level}</strong></div><div><small>다음 블록</small><div className="block-next" aria-label="다음 블록 미리보기">{Array.from({length:16},(_,i)=>{const filled=SHAPES[game.next][Math.floor(i/4)]?.[i%4];return <span key={i} className={filled?'block-cell filled':'block-cell'} style={filled?{'--block':COLORS[game.next]}:undefined}/>;})}</div></div></aside>
    </div>
    <p className="block-status" role="status">{game.over?'게임 종료':!started?'시작 버튼을 눌러주세요':paused?'일시정지':`${game.lines}줄 완성 · 레벨 ${level}`}</p>
    <div className="block-controls" aria-label="블록 조작">{[['left','←','블록 왼쪽 이동'],['rotate','↻','블록 회전'],['right','→','블록 오른쪽 이동'],['down','↓','블록 한 칸 내리기'],['drop','⤓','블록 바로 내리기']].map(([action,label,name])=><button key={action} aria-label={name} disabled={!active} onClick={()=>play(action)}>{label}</button>)}</div>
    <p className="block-help">← → 이동 · ↑ 회전 · ↓ 내리기<br/>Space 바로 내리기 · P 일시정지</p>
    <div className="block-actions"><button className="action secondary" disabled={!started||game.over} onClick={()=>setPaused(p=>!p)}>{paused?'계속하기':'일시정지'}</button><button className="action secondary" onClick={restart}>처음부터 ↻</button></div>
  </section>;
}
