import React,{useEffect,useRef,useState} from 'react';
import {newMines,revealMine,flagMine,mineCount,newSoko,moveSoko,SOKO_LEVELS,newMoles,tickMoles,hitMole} from './puzzle-games';
import {directionKey,useAutoPause} from './game-hooks';

export function DirectionButtons({onMove,disabled=false,label='게임'}){
  return <div className="mini-directions" aria-label={`${label} 방향 조작`}>{[['left','←','왼쪽'],['up','↑','위쪽'],['down','↓','아래쪽'],['right','→','오른쪽']].map(([direction,icon,name])=><button key={direction} disabled={disabled} aria-label={`${label} ${name} 이동`} onClick={()=>onMove(direction)}>{icon}</button>)}</div>;
}
export function MinesGame(){
  const [game,setGame]=useState(newMines),[flagging,setFlagging]=useState(false);
  const play=i=>setGame(g=>flagging?flagMine(g,i):revealMine(g,i));
  return <section className="mini-game" aria-label="지뢰찾기 게임"><p className="eyebrow">POCKET PUZZLE / 06</p><h2>지뢰찾기</h2><p>숫자는 주변 지뢰의 수예요. 첫 칸은 안전해요.</p>
    <div className="mini-stats"><span>남은 깃발 <b>{10-game.flags.length}</b></span><span>안전한 칸 <b>{game.open.filter(i=>!game.mines?.includes(i)).length}/54</b></span></div>
    <div className="mine-board" aria-label="지뢰찾기 게임판">{Array.from({length:64},(_,i)=>{const opened=game.open.includes(i),mine=game.mines?.includes(i)&&(game.over||game.won),flag=game.flags.includes(i),count=opened&&game.mines?mineCount(game.mines,i):0;return <button key={i} data-cell={i} className={`${opened?'opened ':''}${mine?'mine ':''}${flag?'flagged':''}`} data-count={count} aria-label={`${Math.floor(i/8)+1}행 ${i%8+1}열 ${mine?'지뢰':opened?count?`주변 지뢰 ${count}개`:'빈칸':flag?'깃발':'닫힌 칸'}`} disabled={game.over||game.won||opened} onClick={()=>play(i)} onContextMenu={e=>{e.preventDefault();setGame(g=>flagMine(g,i));}}>{mine?'✹':flag?'⚑':opened&&count?count:''}</button>;})}</div>
    <p role="status">{game.over?'지뢰를 만났어요. 새 판에서 다시 도전!':game.won?'모든 안전한 칸을 찾았어요!':'빈칸을 열고, 의심스러운 칸에는 깃발을 꽂아요.'}</p>
    <div className="mini-actions"><button className="action secondary" aria-pressed={flagging} disabled={game.over||game.won} onClick={()=>setFlagging(v=>!v)}>{flagging?'⚑ 깃발 모드':'칸 열기 모드'}</button><button className="action secondary" onClick={()=>{setGame(newMines());setFlagging(false);}}>다시 하기 ↻</button></div><p className="block-help">모바일은 모드 전환 · 마우스 오른쪽 클릭은 깃발</p>
  </section>;
}
export function SokoGame(){
  const [level,setLevel]=useState(0),[game,setGame]=useState(()=>newSoko()),[history,setHistory]=useState([]),board=useRef(null);
  function move(direction){const next=moveSoko(game,direction);if(next!==game){setHistory(h=>[...h,game]);setGame(next);}}
  function load(index){setLevel(index);setGame(newSoko(index));setHistory([]);board.current?.focus();}
  function keydown(e){if(e.altKey||e.ctrlKey||e.metaKey)return;const direction=directionKey(e.key);if(direction){e.preventDefault();move(direction);}}
  return <section className="mini-game" aria-label="소코반 게임" onKeyDown={keydown}><p className="eyebrow">POCKET PUZZLE / 07</p><h2>소코반</h2><p>상자를 밀어서 동그란 목표 칸에 놓아주세요.</p><div className="mini-stats"><span>스테이지 <b>{level+1}/{SOKO_LEVELS.length}</b></span><span>이동 <b data-soko-moves={game.moves}>{game.moves}</b></span></div>
    <div className="soko-board" ref={board} tabIndex={0} role="img" aria-label="소코반 게임판. 방향키 또는 WASD로 상자를 밀기.">{Array.from({length:49},(_,i)=><span key={i} className={`soko-tile ${game.walls.includes(i)?'wall':''} ${game.goals.includes(i)?'goal':''} ${game.boxes.includes(i)?'box':''} ${game.player===i?'player':''}`} data-soko-cell={i}>{game.player===i?'●':game.boxes.includes(i)?'▣':game.goals.includes(i)?'○':''}</span>)}</div>
    <p role="status">{game.won?level===SOKO_LEVELS.length-1?'모든 스테이지 완료! 정리의 달인이네요.':'정리 완료! 다음 방으로 가볼까요?':'상자는 당길 수 없어요. 막히면 한 수 되돌려보세요.'}</p>
    <DirectionButtons label="소코반" onMove={move} disabled={game.won}/><div className="mini-actions"><button className="action secondary" disabled={!history.length} onClick={()=>{setGame(history.at(-1));setHistory(h=>h.slice(0,-1));}}>한 수 되돌리기</button><button className="action secondary" onClick={()=>load(level)}>이 판 다시 ↻</button>{game.won&&level<SOKO_LEVELS.length-1&&<button className="action" onClick={()=>load(level+1)}>다음 스테이지 →</button>}</div>
  </section>;
}
export function MoleGame(){
  const [game,setGame]=useState(newMoles),[started,setStarted]=useState(false),[paused,setPaused]=useAutoPause(),root=useRef(null);
  const active=started&&!paused&&!game.over;
  useEffect(()=>{if(!active)return;let last=performance.now();const timer=setInterval(()=>{const now=performance.now(),dt=Math.min((now-last)/1000,.2);last=now;setGame(g=>tickMoles(g,dt));},80);return()=>clearInterval(timer);},[active]);
  function start(){setGame(newMoles());setStarted(true);setPaused(false);root.current?.querySelector('.mole-hole')?.focus();}
  return <section ref={root} className="mini-game" aria-label="두더지 잡기 게임" onKeyDown={e=>{if(e.key.toLowerCase()==='p'&&started&&!game.over&&!e.repeat&&!e.ctrlKey&&!e.metaKey){e.preventDefault();setPaused(p=>!p);}}}><p className="eyebrow">QUICK PLAY / 08</p><h2>두더지 잡기</h2><p>빼꼼! 30초 동안 두더지를 얼마나 잡을까요?</p><div className="mini-stats"><span>점수 <b data-mole-score={game.score}>{game.score}</b></span><span>남은 시간 <b data-mole-time={Math.ceil(game.time)}>{Math.ceil(game.time)}초</b></span></div>
    <div className="mini-board-wrap"><div className="mole-board">{Array.from({length:9},(_,i)=><button key={i} className={`mole-hole ${active&&game.hole===i?'show':''}`} aria-label={`두더지 구멍 ${i+1}${active&&game.hole===i?' 나옴':''}`} disabled={!active} onClick={()=>setGame(g=>hitMole(g,i))}><span className="mole-earth"/><span className="mole-character" aria-hidden="true"><i/><i/><b>•ᴗ•</b></span></button>)}</div>{(!started||paused||game.over)&&<div className="mini-overlay"><strong>{game.over?`${game.hits}마리 잡았어요!`:!started?'준비, 두더지 나와라!':'잠깐 쉬는 중'}</strong><span>{game.over?`${game.score}점 · 한 판 더 도전해볼까요?`:'나타난 두더지를 눌러주세요.'}</span><button className="action" onClick={game.over||!started?start:()=>setPaused(false)}>{game.over?'다시 시작':!started?'게임 시작':'계속하기'}</button></div>}</div><p role="status">{game.over?'게임 종료':!started?'시작 버튼을 눌러주세요':paused?'일시정지':`${game.hits}마리 · 두더지를 눌러요!`}</p><div className="mini-actions"><button className="action secondary" disabled={!started||game.over} onClick={()=>setPaused(p=>!p)}>{paused?'계속하기':'일시정지'}</button><button className="action secondary" onClick={start}>처음부터 ↻</button></div><p className="block-help">두더지 터치 · 키보드 Tab / Enter · P 일시정지</p></section>;
}
