const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function newExtra(kind){
 if(kind==='pong')return {paddle:160,opponent:160,opponentScore:0,points:0,ball:{x:160,y:200,vx:90,vy:170},serve:1};
 if(kind==='flappy')return {y:190,vy:0,pipes:[],spawnWait:1,lives:1};
 return {notes:[],nextNote:2,noteId:0,combo:0,bestCombo:0,hits:0,missed:0,lives:5};
}
export function extraInput(s,action){
 if(s.kind==='flappy'&&action==='flap')s.vy=-175;
 if(s.kind==='rhythm'&&/^hit[012]$/.test(action)){
  const lane=Number(action.at(-1));const note=s.notes.filter(n=>n.lane===lane).sort((a,b)=>Math.abs(a.at-s.time)-Math.abs(b.at-s.time))[0];
  if(note&&Math.abs(note.at-s.time)<=.2){s.notes=s.notes.filter(n=>n!==note);s.hits++;s.combo++;s.bestCombo=Math.max(s.combo,s.bestCombo);s.score+=Math.abs(note.at-s.time)<=.09?100:60;}
  else rhythmMiss(s);
 }
}
function rhythmMiss(s){s.missed++;s.combo=0;s.lives--;if(s.lives<=0)s.status='over';}
function servePong(s,direction){s.ball={x:160,y:200,vx:(s.points%2?-1:1)*90,vy:direction*170};s.serve=.9;}
export function tickExtra(s,dt,input,rng){
 if(s.kind==='pong'){
  s.paddle=clamp(input.targetX??s.paddle+((input.right?1:0)-(input.left?1:0))*280*dt,36,284);
  s.opponent+=clamp(s.ball.x-s.opponent,-(100+s.level*12)*dt,(100+s.level*12)*dt);s.opponent=clamp(s.opponent,36,284);
  if(s.serve>0){s.serve-=dt;return;}
  const b=s.ball,oldY=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<7){b.x=7;b.vx=Math.abs(b.vx);}if(b.x>313){b.x=313;b.vx=-Math.abs(b.vx);}
  if(b.vy>0&&oldY+7<=365&&b.y+7>=365&&Math.abs(b.x-s.paddle)<41){b.y=358;b.vx=(b.x-s.paddle)*5;b.vy=-Math.min(290,185+s.level*15);}
  if(b.vy<0&&oldY-7>=35&&b.y-7<=35&&Math.abs(b.x-s.opponent)<41){b.y=42;b.vx=(b.x-s.opponent)*4.6;b.vy=Math.min(290,185+s.level*15);}
  if(b.y< -10){s.points++;s.score=s.points;s.level=1+Math.floor(s.points/2);servePong(s,1);}
  if(b.y>410){s.opponentScore++;s.lives=7-s.opponentScore;servePong(s,-1);}
  if(s.points>=7)s.status='won';else if(s.opponentScore>=7)s.status='over';
 }else if(s.kind==='flappy'){
  s.vy+=480*dt;s.y+=s.vy*dt;s.spawnWait-=dt;
  if(s.spawnWait<=0){s.pipes.push({x:340,center:100+rng()*180,gap:Math.max(100,136-s.level*4),passed:false});s.spawnWait=1.85;}
  for(const pipe of s.pipes){pipe.x-=(100+Math.min(5,s.level)*8)*dt;if(!pipe.passed&&pipe.x+44<72){pipe.passed=true;s.score++;s.level=1+Math.floor(s.score/4);}
   if(pipe.x<92&&pipe.x+44>72&&(s.y-10<pipe.center-pipe.gap/2||s.y+10>pipe.center+pipe.gap/2))s.status='over';}
  s.pipes=s.pipes.filter(p=>p.x> -50);if(s.y<10||s.y>378)s.status='over';if(s.time>=60&&s.status==='running')s.status='won';
 }else{
  s.level=1+Math.floor(s.time/15);
  while(s.nextNote<s.time+2&&s.nextNote<45){s.notes.push({id:s.noteId++,lane:Math.floor(rng()*3),at:s.nextNote});s.nextNote+=Math.max(.5,.9-s.level*.08);}
  const missed=s.notes.filter(n=>n.at<s.time-.2);s.notes=s.notes.filter(n=>n.at>=s.time-.2);for(const note of missed){if(s.status==='running')rhythmMiss(s);}
  if(s.time>=45.25&&s.status==='running')s.status='won';
 }
}
