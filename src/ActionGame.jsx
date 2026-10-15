import React,{useEffect,useRef,useState} from 'react';
import {newAction,actionInput,tickAction} from './action-games';
import {drawAction} from './action-draw';
import {directionKey,useAutoPause} from './game-hooks';
import {useGameSound,useGameFeedback} from './game-audio';

const DETAILS={
  pong:{name:'포켓 퐁',tag:'11',copy:'상대보다 먼저 7점! 각도를 바꿔 공을 보내요.',help:'← → / A D · 버튼 길게 누르기 · 게임판 드래그',end:'7점 먼저 달성! 멋진 승리예요.'},
  flappy:{name:'플래피 산책',tag:'12',copy:'톡톡 날갯짓하며 틈 사이로! 점점 빨라지는 60초 산책.',help:'Space / ↑ · 게임판 터치 · 날갯짓 버튼',end:'60초 비행 성공! 무사히 도착했어요.'},
  rhythm:{name:'리듬 탭',tag:'02',copy:'노트가 아래 판정선에 닿을 때 톡! 45초 동안 리듬을 이어가요.',help:'A S D · 게임판 세 구역 터치 · 아래 버튼',end:'45초 완주! 리듬을 끝까지 이어갔어요.'},
  snake:{name:'스네이크',tag:'04',copy:'사과를 먹고 길어져요. 벽과 내 몸은 조심!',help:'방향키 / WASD · 방향 버튼 · 화면 스와이프',end:'사과를 충분히 먹었어요!'},
  breakout:{name:'벽돌 깨기',tag:'05',copy:'공을 튕겨 벽돌을 모두 깨보세요. 총 3스테이지!',help:'← → / A D · 버튼 길게 누르기 · 게임판 드래그',end:'세 스테이지 모두 깨뜨렸어요!'},
  shooter:{name:'별빛 슈팅',tag:'09',copy:'자동 발사! 적을 피하며 세 웨이브를 지켜내요.',help:'← → / A D · 버튼 길게 누르기 · 게임판 드래그',end:'세 웨이브 방어 성공!'},
  racer:{name:'포켓 레이싱',tag:'10',copy:'점점 빨라지고 붐비는 도로! 차선을 바꿔 60초 완주.',help:'← → / A D · 방향 버튼 · 좌우 스와이프',end:'60초 완주! 무사히 도착했어요.'},
};
export default function ActionGame({kind}){
  const detail=DETAILS[kind],state=useRef(null),input=useRef({}),canvas=useRef(null),touch=useRef(null);
  const {play:playSound}=useGameSound();
  const tone=lane=>playSound('note',lane);
  if(!state.current)state.current=newAction(kind);
  const [hud,setHud]=useState(()=>({...state.current})),[started,setStarted]=useState(false),[paused,setPaused]=useAutoPause();
  useGameFeedback({score:kind==='racer'?hud.dodged:kind==='rhythm'?hud.hits:hud.score,lives:hud.lives,won:hud.status==='won',over:hud.status==='over',paused});
  const active=started&&!paused&&hud.status==='running',continuous=['breakout','shooter','pong'].includes(kind);
  const clearInput=()=>{input.current={};touch.current=null;};
  useEffect(()=>{if(!active){clearInput();return;}let raf,last=performance.now(),report=last;
    function frame(now){const dt=Math.min((now-last)/1000,.033);last=now;const previous=state.current.time;tickAction(state.current,dt,input.current);if(kind==='rhythm')for(const note of state.current.notes)if(note.at>previous&&note.at<=state.current.time)tone(note.lane);const ctx=canvas.current?.getContext('2d');if(ctx)drawAction(ctx,state.current);if(now-report>100||state.current.status!=='running'){setHud({...state.current});report=now;}if(state.current.status==='running')raf=requestAnimationFrame(frame);}
    raf=requestAnimationFrame(frame);return()=>{cancelAnimationFrame(raf);clearInput();};
  },[active,kind]);
  useEffect(()=>{const ctx=canvas.current?.getContext('2d');if(ctx)drawAction(ctx,state.current);},[kind,started]);
  function start(){playSound('start');state.current=newAction(kind);input.current={};setHud({...state.current});setPaused(false);setStarted(true);canvas.current?.focus();const ctx=canvas.current?.getContext('2d');if(ctx)drawAction(ctx,state.current);}
  function release(direction){input.current[direction]=false;setHud({...state.current});}
  function move(direction){if(!active)return;actionInput(state.current,direction);if(kind==='rhythm'&&direction.startsWith('hit'))tone(Number(direction.at(-1)));if(kind==='racer'){setHud({...state.current});const ctx=canvas.current?.getContext('2d');if(ctx)drawAction(ctx,state.current);}}
  function keydown(e){
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(kind==='rhythm'&&['a','s','d'].includes(e.key.toLowerCase())){e.preventDefault();if(!e.repeat)move('hit'+['a','s','d'].indexOf(e.key.toLowerCase()));return;}
    if(kind==='flappy'&&active&&[' ','ArrowUp','w'].includes(e.key)){e.preventDefault();if(!e.repeat)move('flap');return;}
    const direction=directionKey(e.key);
    if(direction){e.preventDefault();if(!active)return;if(continuous){input.current[direction]=true;delete input.current.targetX;}else if(!e.repeat)move(direction);}
    if(e.key.toLowerCase()==='p'&&!e.repeat&&started&&hud.status==='running'){e.preventDefault();setPaused(p=>!p);}
  }
  function steer(e){if(!continuous||!active||!touch.current)return;const rect=canvas.current.getBoundingClientRect();input.current.targetX=(e.clientX-rect.left)/rect.width*320;}
  function pointerDown(e){if(!active)return;if(kind==='flappy')move('flap');if(kind==='rhythm'){const r=canvas.current.getBoundingClientRect();move('hit'+Math.min(2,Math.max(0,Math.floor((e.clientX-r.left)/r.width*3))));}touch.current=[e.clientX,e.clientY];e.currentTarget.setPointerCapture(e.pointerId);steer(e);canvas.current.focus();}
  function pointerUp(e){if(!touch.current)return;const [x,y]=touch.current,dx=e.clientX-x,dy=e.clientY-y;touch.current=null;if(!continuous&&Math.max(Math.abs(dx),Math.abs(dy))>16)move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');}
  const directions=kind==='snake'?['left','up','down','right']:kind==='flappy'?['flap']:kind==='rhythm'?['hit0','hit1','hit2']:['left','right'],names={left:'왼쪽',right:'오른쪽',up:'위쪽',down:'아래쪽',flap:'날갯짓',hit0:'왼쪽 노트',hit1:'가운데 노트',hit2:'오른쪽 노트'},icons={left:'←',right:'→',up:'↑',down:'↓',flap:'↑ 날갯짓',hit0:'A',hit1:'S',hit2:'D'};
  const ended=hud.status!=='running';
  return <section className={`mini-game action-game${kind==='racer'?' racing-game':''}`} aria-label={`${detail.name} 게임`} onKeyDown={keydown} onKeyUp={e=>{const direction=directionKey(e.key);if(direction)input.current[direction]=false;}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))clearInput();}}>
    <p className="eyebrow">POCKET ARCADE / {detail.tag}</p><h2>{detail.name}</h2><p className="game-instructions">{detail.copy}</p>
    <div className="mini-stats"><span>점수 <b data-action-score={hud.score}>{hud.score}</b></span><span>{kind==='racer'?'남은 시간':kind==='snake'?'길이':kind==='pong'?'상대 점수':'기회'} <b>{kind==='racer'?`${Math.max(0,60-Math.floor(hud.time))}초`:kind==='snake'?hud.snake.length:kind==='pong'?hud.opponentScore:`♥ ${hud.lives}`}</b></span><span>{kind==='shooter'?'웨이브':kind==='rhythm'?'콤보':'레벨'} <b>{kind==='rhythm'?hud.combo:hud.level}</b></span></div>
    {kind==='racer'&&<div className="race-progress"><div className="race-details"><span aria-label="레이싱 남은 기회">♥ {hud.lives}</span><span aria-label="레이싱 속도">속도 {(hud.speed/144).toFixed(1)}×</span><span>회피 {hud.dodged}대</span></div><progress aria-label="레이싱 완주 진행률" max={60} value={hud.time}/></div>}
    <div className="mini-board-wrap"><canvas ref={canvas} width={640} height={800} className="action-board" tabIndex={0} role="img" aria-label={`${detail.name} 게임판. ${detail.help}. P 일시정지.`} data-action-kind={kind} data-action-hits={hud.hits} data-action-combo={hud.combo} data-racer-lives={kind==='racer'?hud.lives:undefined} data-racer-speed={kind==='racer'?hud.speed.toFixed(1):undefined} data-action-status={hud.status} data-action-time={hud.time.toFixed(1)} data-action-position={kind==='snake'?`${hud.snake[0].x},${hud.snake[0].y}`:kind==='racer'?hud.lane:kind==='shooter'?Math.round(hud.x):kind==='flappy'?Math.round(hud.y):Math.round(hud.paddle??0)} onPointerDown={pointerDown} onPointerMove={steer} onPointerUp={pointerUp} onPointerCancel={clearInput}/>
      {(!started||paused||ended)&&<div className="mini-overlay"><strong>{ended?hud.status==='won'?detail.end:'다시 도전해볼까요?':!started?'작은 모험을 시작해요':'잠깐 쉬는 중'}</strong><span>{ended?`${hud.score}점 · ${kind==='racer'?`${Math.floor(hud.time)}초 주행`:`레벨 ${hud.level}`}`:!started?detail.copy:'준비되면 이어서 해요.'}</span><button className="action" onClick={ended||!started?start:()=>{setPaused(false);canvas.current?.focus();}}>{ended?'다시 시작':!started?'게임 시작':'계속하기'}</button></div>}
    </div><p role="status">{ended?hud.status==='won'?'클리어!':'게임 종료':!started?'시작 버튼을 눌러주세요':paused?'일시정지':kind==='racer'&&hud.invincible>0?`접촉! 남은 기회 ${hud.lives}번 · 차선을 바꿔요`:`${hud.score}점 · 플레이 중`}</p>
    <div className="mini-directions" style={{gridTemplateColumns:`repeat(${directions.length},1fr)`}}>{directions.map(direction=><button key={direction} disabled={!active} aria-label={`${detail.name} ${names[direction]}${['flappy','rhythm'].includes(kind)?'':' 이동'}`} onClick={e=>{if(!continuous)move(direction);else if(e.detail===0){delete input.current.targetX;const key=kind==='shooter'?'x':'paddle';state.current[key]=Math.max(36,Math.min(284,state.current[key]+(direction==='left'?-20:20)));}}} onPointerDown={e=>{if(!continuous)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);delete input.current.targetX;input.current[direction]=true;}} onPointerUp={()=>release(direction)} onPointerCancel={()=>release(direction)} onLostPointerCapture={()=>release(direction)} onBlur={()=>{input.current[direction]=false;}}>{icons[direction]}</button>)}</div>
    <p className="block-help">{detail.help} · P 일시정지</p><div className="mini-actions"><button className="action secondary" disabled={!started||ended} onClick={()=>{setPaused(p=>!p);canvas.current?.focus();}}>{paused?'계속하기':'일시정지'}</button><button className="action secondary" onClick={start}>처음부터 ↻</button></div>
  </section>;
}
