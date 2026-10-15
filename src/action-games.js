import {newExtra,extraInput,tickExtra} from './extra-games.js';
// Fixed 320 × 400 playfield. Engines mutate one local state for animation;
// no timers, DOM access or global listeners live here.
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const opposite={left:'right',right:'left',up:'down',down:'up'};
const vectors={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
function foodFor(snake,rng){const empty=[];for(let y=0;y<20;y++)for(let x=0;x<16;x++)if(!snake.some(p=>p.x===x&&p.y===y))empty.push({x,y});return empty.length?empty[Math.floor(rng()*empty.length)]:null;}
function bricksFor(level){return Array.from({length:24},(_,i)=>({x:18+(i%6)*48,y:44+Math.floor(i/6)*23,w:44,h:16,color:(Math.floor(i/6)+level)%4}));}
function newWave(wave){return Array.from({length:12},(_,i)=>({x:38+(i%6)*48,y:38+Math.floor(i/6)*38,hp:1,id:i}));}
export function newAction(kind,rng=Math.random){
  const base={kind,score:0,lives:3,level:1,status:'running',time:0};
  if(['pong','flappy','rhythm'].includes(kind))return {...base,...newExtra(kind)};
  if(kind==='snake'){const snake=[{x:8,y:10},{x:7,y:10},{x:6,y:10}];return {...base,snake,food:foodFor(snake,rng),dir:'right',nextDir:'right',elapsed:0};}
  if(kind==='breakout')return {...base,paddle:160,ball:{x:160,y:325,vx:95,vy:-160},bricks:bricksFor(1),serve:.6};
  if(kind==='shooter')return {...base,x:160,shots:[],enemies:newWave(1),bullets:[],shotWait:0,enemyWait:1.2,enemyTurn:0,invincible:0,waveTime:0};
  return {...base,lane:1,cars:[],spawnWait:1.1,invincible:0,distance:0,nextId:0,waves:0,laneBag:[],safeBag:[],lastSafe:null,dodged:0,speed:144};
}
export function actionInput(state,action){
  if(state.status!=='running')return;
  if(['pong','flappy','rhythm'].includes(state.kind))extraInput(state,action);
  if(state.kind==='snake'&&vectors[action]&&action!==opposite[state.dir])state.nextDir=action;
  if(state.kind==='racer'&&['left','right'].includes(action))state.lane=clamp(state.lane+(action==='left'?-1:1),0,2);
}
export function snakeTick(state,rng=Math.random){
  state.dir=state.nextDir;const [dx,dy]=vectors[state.dir],head={x:state.snake[0].x+dx,y:state.snake[0].y+dy};
  const eats=head.x===state.food?.x&&head.y===state.food?.y,body=eats?state.snake:state.snake.slice(0,-1);
  if(head.x<0||head.x>=16||head.y<0||head.y>=20||body.some(p=>p.x===head.x&&p.y===head.y)){state.status='over';return;}
  state.snake.unshift(head);if(!eats)state.snake.pop();else{state.score+=10;state.level=1+Math.floor(state.score/50);state.food=foodFor(state.snake,rng);if(!state.food)state.status='won';}
}
function breakoutTick(s,dt,input){
  s.paddle=clamp(input.targetX??s.paddle+((input.right?1:0)-(input.left?1:0))*280*dt,36,284);
  if(s.serve>0){s.serve-=dt;s.ball.x=s.paddle;s.ball.y=325;return;}
  const b=s.ball,previous={x:b.x,y:b.y};b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<6){b.x=6;b.vx=Math.abs(b.vx);}if(b.x>314){b.x=314;b.vx=-Math.abs(b.vx);}if(b.y<6){b.y=6;b.vy=Math.abs(b.vy);}
  if(b.vy>0&&previous.y+6<=365&&b.y+6>=365&&Math.abs(b.x-s.paddle)<40){const offset=(b.x-s.paddle)/34;b.y=359;b.vx=offset*180;b.vy=-Math.sqrt((205+s.level*15)**2-b.vx**2);}
  const hit=s.bricks.findIndex(r=>b.x+6>r.x&&b.x-6<r.x+r.w&&b.y+6>r.y&&b.y-6<r.y+r.h);
  if(hit>=0){const brick=s.bricks[hit];if(previous.x+6<=brick.x||previous.x-6>=brick.x+brick.w)b.vx*=-1;else b.vy*=-1;s.bricks.splice(hit,1);s.score+=20;}
  if(b.y>410){s.lives--;if(!s.lives)s.status='over';else{s.serve=1;b.vx=95;b.vy=-160;}}
  if(!s.bricks.length){if(s.level>=3)s.status='won';else{s.level++;s.bricks=bricksFor(s.level);s.serve=1;b.vx=95;b.vy=-160;}}
}
function shooterTick(s,dt,input){
  s.x=clamp(input.targetX??s.x+((input.right?1:0)-(input.left?1:0))*230*dt,16,304);s.invincible=Math.max(0,s.invincible-dt);s.waveTime+=dt;
  s.shotWait-=dt;if(s.shotWait<=0){s.shots.push({x:s.x,y:345});s.shotWait=.23;}
  for(const shot of s.shots)shot.y-=330*dt;
  const drift=Math.sin(s.waveTime*1.3)*13;
  for(const enemy of s.enemies)enemy.y+=(4+s.level*2)*dt;
  for(const shot of s.shots){if(shot.hit)continue;const enemy=s.enemies.find(e=>e.hp>0&&Math.abs(shot.x-(e.x+drift))<17&&Math.abs(shot.y-e.y)<14);if(enemy){enemy.hp=0;shot.hit=true;s.score+=100;}}
  s.shots=s.shots.filter(shot=>shot.y>-10&&!shot.hit);s.enemies=s.enemies.filter(e=>e.hp>0);
  s.enemyWait-=dt;
  if(s.enemyWait<=0&&s.enemies.length){const e=s.enemies[s.enemyTurn++%s.enemies.length];s.bullets.push({x:e.x+drift,y:e.y+15});s.enemyWait=Math.max(.42,1.1-s.level*.16);}
  for(const bullet of s.bullets)bullet.y+=(125+s.level*22)*dt;
  const hit=s.bullets.find(b=>Math.abs(b.x-s.x)<18&&Math.abs(b.y-355)<18);
  if(hit&&s.invincible<=0){s.lives--;s.invincible=1.4;s.bullets=s.bullets.filter(b=>b!==hit);if(!s.lives)s.status='over';}
  s.bullets=s.bullets.filter(b=>b.y<420);
  if(s.enemies.some(e=>e.y>325))s.status='over';
  if(!s.enemies.length&&s.status==='running'){if(s.level>=3)s.status='won';else{s.level++;s.enemies=newWave(s.level);s.bullets=[];s.waveTime=0;s.enemyWait=1;}}
}
export function racerDifficulty(time){
  const progress=clamp(time,0,60);
  return {speed:144+progress*3.4,interval:1.6-progress*.014,level:Math.min(6,1+Math.floor(progress/10))};
}
function drawLane(s,key,rng){
  if(!s[key].length){
    s[key]=[0,1,2];
    for(let i=2;i>0;i--){const j=Math.floor(rng()*(i+1));[s[key][i],s[key][j]]=[s[key][j],s[key][i]];}
    // Pair waves always change their escape lane, including at bag boundaries.
    if(key==='safeBag'&&s[key].at(-1)===s.lastSafe)[s[key][0],s[key][2]]=[s[key][2],s[key][0]];
  }
  return s[key].pop();
}
function racerTick(s,dt,rng){
  const difficulty=racerDifficulty(s.time);s.speed=difficulty.speed;s.level=difficulty.level;
  s.invincible=Math.max(0,s.invincible-dt);s.distance+=s.speed*dt;s.spawnWait-=dt;
  if(s.spawnWait<=0){
    const pair=s.time>=40||(s.time>=20&&s.waves%3===2);
    let lanes;
    if(pair){const safe=drawLane(s,'safeBag',rng);s.lastSafe=safe;lanes=[0,1,2].filter(lane=>lane!==safe);}
    else lanes=[drawLane(s,'laneBag',rng)];
    for(const lane of lanes)s.cars.push({lane,y:-60,id:s.nextId++,wave:s.waves,passed:false});
    s.waves++;s.spawnWait+=difficulty.interval;
  }
  for(const car of s.cars)car.y+=s.speed*dt;
  const hit=s.cars.find(car=>car.lane===s.lane&&Math.abs(car.y-335)<45);
  if(hit&&s.invincible<=0){s.lives--;s.invincible=1.05;s.cars=s.cars.filter(car=>car!==hit);if(!s.lives)s.status='over';}
  for(const car of s.cars)if(car.y>380&&!car.passed){car.passed=true;s.dodged++;}
  s.score=Math.floor(s.distance/10)+s.dodged*25;
  s.cars=s.cars.filter(car=>car.y<460);if(s.time>=60&&s.status==='running')s.status='won';
}
export function tickAction(state,dt,input={},rng=Math.random){
  if(state.status!=='running')return state;
  dt=clamp(dt,0,.05);state.time+=dt;
  if(state.kind==='snake'){state.elapsed+=dt;const speed=Math.max(.08,.18-(state.level-1)*.012);while(state.elapsed>=speed&&state.status==='running'){state.elapsed-=speed;snakeTick(state,rng);}}
  else if(state.kind==='breakout')breakoutTick(state,dt,input);
  else if(state.kind==='shooter')shooterTick(state,dt,input);
  else if(['pong','flappy','rhythm'].includes(state.kind))tickExtra(state,dt,input,rng);
  else racerTick(state,dt,rng);
  return state;
}
