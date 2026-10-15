import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { projects } from './projects';
import { createRoom } from './room';
import { rooms } from './house-world';
import './style.css';

function MemoryGame() {
  const symbols=['◈','✳','⌘','◉','◈','✳','⌘','◉'];
  const shuffle=()=>symbols.map((s)=>({s,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(x=>x.s);
  const [cards,setCards]=useState(shuffle),[open,setOpen]=useState([]),[matched,setMatched]=useState([]),[moves,setMoves]=useState(0);
  useEffect(()=>{if(open.length!==2)return;const [a,b]=open;const timer=setTimeout(()=>{if(cards[a]===cards[b])setMatched(m=>[...m,a,b]);setOpen([]);},650);return()=>clearTimeout(timer);},[open,cards]);
  const restart=()=>{setCards(shuffle());setOpen([]);setMatched([]);setMoves(0);};
  return <><p className="eyebrow">A LITTLE BREAK / 01</p><h2>작은 기억 게임</h2><p>같은 모양의 카드를 찾아보세요.</p><div className="game-grid">{cards.map((s,i)=><button key={i} className={matched.includes(i)?'matched':''} aria-label={open.includes(i)||matched.includes(i)?`카드 ${i+1}: ${s}`:`카드 ${i+1} 뒤집기`} disabled={matched.includes(i)||open.includes(i)||open.length===2} onClick={()=>{setOpen(o=>[...o,i]);if(open.length===1)setMoves(m=>m+1);}}>{open.includes(i)||matched.includes(i)?s:'?'}</button>)}</div><p aria-live="polite">{matched.length===8?'모두 찾았어요! 잠깐의 휴식 완료.':`${moves}번 시도 · ${matched.length/2}/4쌍`}</p><button className="action secondary" onClick={restart}>다시 하기 ↻</button></>;
}
function App() {
  const host=useRef(null),room=useRef(null),dialog=useRef(null),previousFocus=useRef(null);
  const [selected,setSelected]=useState(null),[hover,setHover]=useState(null),[failed,setFailed]=useState(false);
  const [night,setNight]=useState(false),[view,setView]=useState('all');
  const [player,setPlayer]=useState({room:'living',x:.5,z:1.7,nearby:null});
  useEffect(()=>{room.current=createRoom(host.current,projects,setSelected,setHover,()=>setFailed(true),setPlayer);return()=>room.current.dispose();},[]);
  useEffect(()=>{if(selected){previousFocus.current=document.activeElement;dialog.current.showModal();}else if(dialog.current?.open){dialog.current.close();previousFocus.current?.focus();}},[selected]);
  useEffect(()=>{room.current?.setPaused(Boolean(selected));},[selected]);
  useEffect(()=>{room.current?.setNight(night);},[night]);
  const currentRoom=rooms.find(r=>r.id===player.room);
  const nearbyName=projects.find(p=>p.id===player.nearby)?.name || (player.nearby==='game'?'작은 기억 게임':'');
  function changeRoom(id){setView(id);if(id==='all')room.current.reset();else room.current.setRoom(id);}
  function padDown(e,x,z){e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);room.current.setDirection(x,z);}
  function padUp(){room.current?.setDirection(0,0);}
  const p=projects.find(p=>p.id===selected);
  return <main className={night?'app night':'app'}>
    <header><a className="wordmark" href={import.meta.env.BASE_URL}>e<span> / </span>studio</a><nav aria-label="바로가기"><a href="https://github.com/ersione" target="_blank" rel="noreferrer">GitHub ↗</a><button onClick={()=>setNight(v=>!v)} aria-label={night?'밝은 배경으로 전환':'어두운 배경으로 전환'}>{night?'☀':'☾'}</button></nav></header>
    <section className="intro"><div><p className="eyebrow"><span className="live-dot"/> A SMALL HOUSE OF IDEAS · ERSIONE</p><h1>만들고, 쉬고,<br className="mobile-break"/> <em>다시 상상하는 집.</em></h1></div><p className="intro-copy">안녕하세요, 개발자 <b>Ersione</b>입니다.<br/>방마다 담긴 프로젝트와 작은 즐거움을 만나보세요.</p></section>
    <section className="scene-section" aria-label="나의 3D 작업실">
      <div className="house-toolbar"><div><span className="eyebrow">THE HOUSE / 01</span><span className="house-description">조금씩 채워가는 나만의 공간</span></div><nav className="room-nav" aria-label="집 안 이동"><button aria-pressed={view==='all'} onClick={()=>changeRoom('all')}>집 전체</button>{rooms.map(r=><button key={r.id} aria-label={r.name+(r.id==='living'?'로':'으로')+' 이동'} aria-pressed={view===r.id} onClick={()=>changeRoom(r.id)}>{r.name}</button>)}</nav></div>
      <div ref={host} className="room"/>
      <><div className="player-hud"><span className="live-dot"/><output aria-label="캐릭터 위치" data-player-x={player.x} data-player-z={player.z}>{currentRoom?.name}</output><span>· 검은 모자를 찾아보세요</span></div><div className="movement-pad" aria-label="캐릭터 이동"><button className="pad-up" aria-label="캐릭터 앞으로 이동" onPointerDown={e=>padDown(e,0,-1)} onPointerUp={padUp} onPointerCancel={padUp} onLostPointerCapture={padUp} onBlur={padUp}>↑</button><button className="pad-left" aria-label="캐릭터 왼쪽으로 이동" onPointerDown={e=>padDown(e,-1,0)} onPointerUp={padUp} onPointerCancel={padUp} onLostPointerCapture={padUp} onBlur={padUp}>←</button><button className="pad-down" aria-label="캐릭터 뒤로 이동" onPointerDown={e=>padDown(e,0,1)} onPointerUp={padUp} onPointerCancel={padUp} onLostPointerCapture={padUp} onBlur={padUp}>↓</button><button className="pad-right" aria-label="캐릭터 오른쪽으로 이동" onPointerDown={e=>padDown(e,1,0)} onPointerUp={padUp} onPointerCancel={padUp} onLostPointerCapture={padUp} onBlur={padUp}>→</button></div><button className="reset" onClick={()=>changeRoom('all')} aria-label="처음 시점으로 돌아가기">↺</button></>
      <div className="house-controls"><span><kbd>WASD</kbd> / <kbd>↑↓←→</kbd> 이동 <span className="desktop-hint">{failed?'· 가벼운 모드':'· 드래그 회전 · 스크롤 확대'}</span></span>{player.nearby?<button className="interact" onClick={()=>room.current.interact()}><kbd>E</kbd> {nearbyName} 열기 ↗</button>:<span className="nearby-hint">사물은 눌러서 바로 열 수도 있어요</span>}</div>
      {hover&&<div className="room-hint">{(projects.find(p=>p.id===hover)?.name || '작은 기억 게임')+' · 눌러서 열기'}</div>}
    </section>
    <section className="collection" aria-labelledby="collection-title"><div className="collection-heading"><h2 id="collection-title">방 안의 프로젝트 <span>{String(projects.length).padStart(2,'0')}</span></h2><p>사물을 눌러도, 아래에서 골라도 좋아요.</p></div><div className="project-list">{projects.map((p,i)=><button key={p.id} onClick={()=>setSelected(p.id)} onMouseEnter={()=>setHover(p.id)} onMouseLeave={()=>setHover(null)} className="project" style={{'--accent':p.color}}><span className="project-number">0{i+1}</span><span><small>{p.category}</small><strong>{p.name}</strong><span className="project-subtitle">{p.subtitle}</span></span><span className="project-arrow">↗</span></button>)}<button className="project game-entry" onClick={()=>setSelected('game')}><span className="project-number">✳</span><span><small>JUST FOR FUN</small><strong>잠깐, 쉬어가기</strong><span className="project-subtitle">게임기 전원 켜기</span></span><span className="project-arrow">→</span></button></div></section>
    <footer><span>만들고, 다듬고, 다시 만들기.</span><span>© {new Date().getFullYear()} Ersione · 계속 자라는 작업실</span></footer>
    <dialog ref={dialog} onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===dialog.current)setSelected(null);}} onClose={()=>{if(!dialog.current?.open)setSelected(null);}}><button className="close" onClick={()=>setSelected(null)} aria-label="닫기">×</button>{selected==='game'?<MemoryGame/>:p&&<><p className="eyebrow" style={{color:p.color}}>{p.category}</p><h2>{p.name}</h2><p className="dialog-subtitle">{p.subtitle}</p><p>{p.description}</p><div className="dialog-actions"><a className="action" href={p.url} target="_blank" rel="noreferrer">프로젝트 둘러보기 ↗</a><a className="action secondary" href={p.repo} target="_blank" rel="noreferrer">소스 코드 ↗</a></div></>}</dialog>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
