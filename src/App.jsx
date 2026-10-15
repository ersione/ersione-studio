import React, { useEffect, useRef, useState } from 'react';
import { projects } from './projects';
import { createRoom } from './room';
import { rooms } from './house-world';
import BlockGame from './BlockGame';
import ActionGame from './ActionGame';
import {MinesGame,SokoGame,MoleGame} from './PuzzleGames';
import {games} from './games';
import './style.css';
import './mini-games.css';
import './studio-layout.css';
import {GameAudioProvider,SoundToggle,useGameSound,useGameFeedback} from './game-audio';

import {personalLinks} from './site';

function MemoryGame() {
  const {play:playSound}=useGameSound();
  const symbols=['◈','✳','⌘','◉','◈','✳','⌘','◉'];
  const shuffle=()=>symbols.map((s)=>({s,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(x=>x.s);
  const [cards,setCards]=useState(shuffle),[open,setOpen]=useState([]),[matched,setMatched]=useState([]),[moves,setMoves]=useState(0);
  useGameFeedback({won:matched.length===8});
  useEffect(()=>{if(open.length!==2)return;playSound(cards[open[0]]===cards[open[1]]?'hit':'miss');const [a,b]=open;const timer=setTimeout(()=>{if(cards[a]===cards[b])setMatched(m=>[...m,a,b]);setOpen([]);},650);return()=>clearTimeout(timer);},[open,cards]);
  const restart=()=>{playSound('start');setCards(shuffle());setOpen([]);setMatched([]);setMoves(0);};
  return <section className="memory-game"><p className="eyebrow">A LITTLE BREAK / 01</p><h2>작은 기억 게임</h2><p>같은 모양의 카드를 찾아보세요.</p><div className="game-grid">{cards.map((s,i)=><button key={i} className={matched.includes(i)?'matched':''} aria-label={open.includes(i)||matched.includes(i)?`카드 ${i+1}: ${s}`:`카드 ${i+1} 뒤집기`} disabled={matched.includes(i)||open.includes(i)||open.length===2} onClick={()=>{playSound('move');setOpen(o=>[...o,i]);if(open.length===1)setMoves(m=>m+1);}}>{open.includes(i)||matched.includes(i)?s:'?'}</button>)}</div><p aria-live="polite">{matched.length===8?'모두 찾았어요! 잠깐의 휴식 완료.':`${moves}번 시도 · ${matched.length/2}/4쌍`}</p><div className="mini-actions memory-actions"><button className="action secondary" onClick={restart}>다시 하기 ↻</button><SoundToggle/></div></section>;
}
function Arcade(){return <GameAudioProvider><ArcadeContent/></GameAudioProvider>;}
function ArcadeContent() {
  const {play:playSound,stop:stopSound}=useGameSound();
  const [game,setGame]=useState(null),[page,setPage]=useState(0),content=useRef(null),lastGame=useRef(null);
  const pages=Math.ceil(games.length/6),visibleGames=games.slice(page*6,page*6+6);
  useEffect(()=>{if(game)content.current?.querySelector('.number-board,.block-overlay button,.mini-overlay button,.soko-board,.mine-board button,.game-grid button')?.focus();else if(lastGame.current)content.current?.querySelector(`[data-game="${lastGame.current}"]`)?.focus();},[game]);
  useEffect(()=>{if(!game){const first=content.current?.querySelector('.arcade-card');first?.focus();}},[page]);
  function menuKey(e){
    if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setPage(p=>(p+(e.key==='ArrowRight'?1:-1)+pages)%pages);return;}
    if(!['ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();const buttons=[...content.current.querySelectorAll('.arcade-card')],index=buttons.indexOf(document.activeElement);
    const next=index<0?(e.key==='ArrowDown'?0:buttons.length-1):(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next]?.focus();
  }
  return <div className={game?'arcade':'arcade arcade-hub'} ref={content} tabIndex={-1}>{game?<><div className="arcade-toolbar"><button className="arcade-back" onClick={()=>{stopSound();setGame(null);}}>← 게임 목록</button></div>{game==='memory'?<MemoryGame/>:game==='blocks'?<BlockGame/>:game==='mines'?<MinesGame/>:game==='soko'?<SokoGame/>:game==='moles'?<MoleGame/>:<ActionGame key={game} kind={game}/>}</>:<>
    <div className="game-pack" aria-label="12가지 게임이 담긴 멀티게임팩"><span>MULTI GAME PACK</span><strong>12 <i>IN</i> 1</strong><span className="pack-grip"/></div>
    <div className="console-shell"><div className="console-top"><span><span className="console-led"/> POWER ON</span><span>e / pocket</span></div>
      <div className="console-screen"><div className="screen-top"><span>◆ PACK LOADED</span><span>12 GAMES</span></div><p className="eyebrow">ERSIONE GAME COLLECTION</p><h2>오늘은 무슨 게임 할까요?</h2><p className="screen-instruction">게임을 골라 START!</p>
        <div className="arcade-library" aria-label="미니게임 목록" onKeyDown={menuKey}>{visibleGames.map((item,i)=><button key={item.id} data-game={item.id} onClick={()=>{playSound('select');lastGame.current=item.id;setGame(item.id);}} className="arcade-card"><span className="arcade-cover" style={{'--game-color':item.color}}>{item.icon}</span><span><small>{String(page*6+i+1).padStart(2,'0')} / {item.tag}</small><strong>{item.name}</strong><span>{item.description}</span></span><span className="arcade-play">▶</span></button>)}</div>
        <div className="pack-pages"><button aria-label="이전 게임 목록" disabled={page===0} onClick={()=>setPage(p=>p-1)}>◀</button><span>{page+1} / {pages} PAGE</span><button aria-label="다음 게임 목록" disabled={page===pages-1} onClick={()=>setPage(p=>p+1)}>▶</button></div><div className="screen-bottom"><span>↑ ↓ SELECT · ← → PAGE</span><span>ENTER / TOUCH ▶</span></div>
      </div>
      <div className="console-bottom" aria-hidden="true"><span className="console-dpad"><i/><i/></span><div className="console-speaker"><i/><i/><i/></div><span className="console-buttons"><i>B</i><i>A</i></span></div>
      <p className="console-caption">팩 하나에 담은 열두 가지 작은 즐거움</p><div className="library-sound"><SoundToggle/></div>
    </div>
  </>}</div>;
}
export default function App() {
  const host=useRef(null),room=useRef(null),dialog=useRef(null),previousFocus=useRef(null);
  const [ready,setReady]=useState(false);
  const [selected,setSelected]=useState(null),[hover,setHover]=useState(null),[failed,setFailed]=useState(false);
  const [night,setNight]=useState(false),[view,setView]=useState('all');
  const [player,setPlayer]=useState({room:'living',x:.5,z:1.7,nearby:null});
  useEffect(()=>{room.current=createRoom(host.current,projects,setSelected,setHover,()=>setFailed(true),setPlayer);setReady(true);return()=>room.current.dispose();},[]);
  useEffect(()=>{if(selected){previousFocus.current=document.activeElement;dialog.current.showModal();}else if(dialog.current?.open){dialog.current.close();previousFocus.current?.focus();}},[selected]);
  useEffect(()=>{room.current?.setPaused(Boolean(selected));},[selected]);
  useEffect(()=>{room.current?.setNight(night);},[night]);
  const currentRoom=rooms.find(r=>r.id===player.room);
  const nearbyName=projects.find(p=>p.id===player.nearby)?.name || (player.nearby==='game'?'미니게임':'');
  function changeRoom(id){setView(id);if(id==='all')room.current.reset();else room.current.setRoom(id);}
  function padDown(e,x,z){e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);room.current.setDirection(x,z);}
  function padUp(){room.current?.setDirection(0,0);}
  const p=projects.find(p=>p.id===selected);
  return <main className={night?'app night':'app'}>
    <header><a className="wordmark" href={import.meta.env.BASE_URL}>e<span> / </span>studio</a><nav className="header-links" aria-label="바로가기">{personalLinks.map((link,i)=><a key={link.url} className={i===1||i===2?'desktop-shortcut':''} href={link.url} target="_blank" rel="noreferrer" aria-label={`${link.name} ↗`}>{link.short?<><span className="link-full">{link.name}</span><span className="link-short">{link.short}</span></>:link.name} ↗</a>)}<button onClick={()=>setNight(v=>!v)} aria-label={night?'밝은 배경으로 전환':'어두운 배경으로 전환'}>{night?'☀':'☾'}</button></nav></header>
    <section className="intro"><div><p className="eyebrow"><span className="live-dot"/> A SMALL HOUSE OF IDEAS · ERSIONE</p><h1>만들고, 쉬고,<br className="mobile-break"/> <em>다시 상상하는 집.</em></h1></div><p className="intro-copy"><b>Louis Kim</b>이 만드는 작은 작업실,<br/><strong>Ersione’s Studio</strong>입니다.<br/>방마다 담긴 프로젝트와 작은 즐거움을 만나보세요.</p></section>
    <section className="scene-section" aria-label="나의 3D 작업실">
      <div className="house-toolbar"><div><span className="eyebrow">THE HOUSE / 01</span><span className="house-description">조금씩 채워가는 나만의 공간</span></div><nav className="room-nav" aria-label="집 안 이동"><button aria-pressed={view==='all'} onClick={()=>changeRoom('all')}>집 전체</button>{rooms.map(r=><button key={r.id} aria-label={r.name+(r.id==='living'?'로':'으로')+' 이동'} aria-pressed={view===r.id} onClick={()=>changeRoom(r.id)}>{r.name}</button>)}</nav></div>
      <div ref={host} className="room">{!ready&&<img className="initial-house-preview" src="/room-preview.png" width="1080" height="680" alt="거실, 작업방, 주방, 휴식방으로 이어지는 Ersione의 작은 집"/>}</div>
      <><div className="player-hud"><span className="live-dot"/><output aria-label="캐릭터 위치" data-player-x={player.x} data-player-z={player.z}>{currentRoom?.name}</output><span>· 검은 모자를 찾아보세요</span></div><div className="movement-pad" aria-label="캐릭터 이동"><button className="pad-up" aria-label="캐릭터 앞으로 이동" onPointerDown={e=>padDown(e,0,-1)} onPointerUp={padUp} onPointerCancel={padUp} onLostPointerCapture={padUp} onBlur={padUp}>↑</button><button className="pad-left" aria-label="캐릭터 왼쪽으로 이동" onPointerDown={e=>padDown(e,-1,0)} onPointerUp={padUp} onPointerCancel={padUp} onLostPointerCapture={padUp} onBlur={padUp}>←</button><button className="pad-down" aria-label="캐릭터 뒤로 이동" onPointerDown={e=>padDown(e,0,1)} onPointerUp={padUp} onPointerCancel={padUp} onLostPointerCapture={padUp} onBlur={padUp}>↓</button><button className="pad-right" aria-label="캐릭터 오른쪽으로 이동" onPointerDown={e=>padDown(e,1,0)} onPointerUp={padUp} onPointerCancel={padUp} onLostPointerCapture={padUp} onBlur={padUp}>→</button></div><button className="reset" onClick={()=>changeRoom('all')} aria-label="처음 시점으로 돌아가기">↺</button></>
      <div className="house-controls"><span><kbd>WASD</kbd> / <kbd>↑↓←→</kbd> 이동 <span className="desktop-hint">{failed?'· 가벼운 모드':'· 드래그 회전 · 스크롤 확대'}</span></span>{player.nearby?<button className="interact" onClick={()=>room.current.interact()}><kbd>E</kbd> {nearbyName} 열기 ↗</button>:<span className="nearby-hint">사물은 눌러서 바로 열 수도 있어요</span>}</div>
      {hover&&<div className="room-hint">{(projects.find(p=>p.id===hover)?.name || '미니게임')+' · 눌러서 열기'}</div>}
    </section>
    <section className="collection" aria-labelledby="collection-title"><div className="collection-heading"><h2 id="collection-title">방 안의 프로젝트 <span>{String(projects.length).padStart(2,'0')}</span></h2><p>사물을 눌러도, 아래에서 골라도 좋아요.</p></div><div className="project-list">{projects.map((p,i)=><button key={p.id} onClick={()=>setSelected(p.id)} onMouseEnter={()=>setHover(p.id)} onMouseLeave={()=>setHover(null)} className="project" style={{'--accent':p.color}}><span className="project-number">0{i+1}</span><span><small>{p.category}</small><strong>{p.name}</strong><span className="project-subtitle">{p.subtitle}</span></span><span className="project-arrow">↗</span></button>)}<button className="project game-entry" onClick={()=>setSelected('game')}><span className="project-number">✳</span><span><small>JUST FOR FUN</small><strong>잠깐, 쉬어가기</strong><span className="project-subtitle">게임 콘솔 · 12가지 미니게임</span></span><span className="project-arrow">→</span></button></div></section>
    <section className="studio-about" aria-labelledby="studio-about-title"><details><summary id="studio-about-title">작업실과 프로젝트 소개</summary><div className="studio-about-content"><p>개발자 Louis Kim의 인터랙티브 포트폴리오입니다. Ersione이라는 이름으로 만드는 웹 서비스와 공통 UI를 소개하고, 집 안을 돌아다니며 12가지 미니게임을 즐길 수 있습니다.</p><div className="project-descriptions">{projects.map(project=><article key={project.id}><h3>{project.name}</h3><p>{project.description}</p><a href={project.url} target="_blank" rel="noreferrer">{project.name} 서비스 둘러보기 ↗</a>{project.repo&&<a href={project.repo} target="_blank" rel="noreferrer">{project.name} 공개 소스 ↗</a>}</article>)}</div><p className="games-description">게임 콘솔에서 {games.map(game=>game.name).join(' · ')}를 만나보세요.</p></div></details></section>
    <footer><div className="footer-credit"><span>만들고, 다듬고, 다시 만들기.</span><span>© {new Date().getFullYear()} Louis Kim · Ersione’s Studio</span></div><nav className="footer-links" aria-label="Louis Kim 바로가기">{personalLinks.map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.name} ↗</a>)}</nav></footer>
    <dialog ref={dialog} onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===dialog.current)setSelected(null);}} onClose={()=>{if(!dialog.current?.open)setSelected(null);}}><button className="close" onClick={()=>setSelected(null)} aria-label="닫기">×</button>{selected==='game'?<Arcade/>:p&&<><p className="eyebrow" style={{color:p.color}}>{p.category}</p><h2>{p.name}</h2><p className="dialog-subtitle">{p.subtitle}</p><p>{p.description}</p><div className="dialog-actions"><a className="action" href={p.url} target="_blank" rel="noreferrer">프로젝트 둘러보기 ↗</a>{p.repo&&<a className="action secondary" href={p.repo} target="_blank" rel="noreferrer">소스 코드 ↗</a>}</div></>}</dialog>
  </main>;
}
