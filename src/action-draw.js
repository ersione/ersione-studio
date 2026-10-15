const colors=['#9bbf8e','#e3bf7d','#d79581','#a89fc9'];
function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function circle(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function car(ctx,x,y,color){rect(ctx,x-17,y-25,34,50,color);rect(ctx,x-12,y-14,24,12,'#c0ddd4');rect(ctx,x-12,y+9,24,8,'#263f38');for(const dx of [-20,16])for(const dy of [-18,12])rect(ctx,x+dx,y+dy,4,10,'#162d2b');rect(ctx,x-13,y-24,6,4,'#f6e0a4');rect(ctx,x+7,y-24,6,4,'#f6e0a4');}
export function drawAction(ctx,s){
  ctx.save();ctx.scale(2,2);rect(ctx,0,0,320,400,'#203b32');
  if(s.kind==='snake'){
    ctx.strokeStyle='#ffffff06';ctx.lineWidth=1;for(let x=0;x<=320;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,400);ctx.stroke();}for(let y=0;y<=400;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(320,y);ctx.stroke();}
    if(s.food){circle(ctx,s.food.x*20+10,s.food.y*20+10,7,'#e39d82');rect(ctx,s.food.x*20+10,s.food.y*20+1,3,4,'#b6cc8f');}
    s.snake.forEach((p,i)=>rect(ctx,p.x*20+2,p.y*20+2,16,16,i?'#8da978':'#d6e4ad'));
    const p=s.snake[0],vertical=['up','down'].includes(s.dir),eye=s.dir==='right'?14:5,ey=s.dir==='down'?14:5;
    if(vertical){circle(ctx,p.x*20+5,p.y*20+ey,2,'#243f32');circle(ctx,p.x*20+14,p.y*20+ey,2,'#243f32');}else{circle(ctx,p.x*20+eye,p.y*20+5,2,'#243f32');circle(ctx,p.x*20+eye,p.y*20+14,2,'#243f32');}
  }else if(s.kind==='breakout'){
    for(const brick of s.bricks){rect(ctx,brick.x,brick.y,brick.w,brick.h,colors[brick.color]);rect(ctx,brick.x+2,brick.y+2,brick.w-4,2,'#ffffff33');}
    rect(ctx,s.paddle-34,365,68,9,'#d9e4af');rect(ctx,s.paddle-30,365,60,2,'#f5f4dc');circle(ctx,s.ball.x,s.ball.y,6,'#f7e8bf');
  }else if(s.kind==='shooter'){
    for(let i=0;i<35;i++){const x=(i*71+13)%320,y=(i*47+s.time*(10+i%3*6))%400;rect(ctx,x,y,i%3===0?2:1,2,'#b4c9b166');}
    for(const shot of s.shots)rect(ctx,shot.x-2,shot.y-7,4,12,'#e9d490');
    for(const b of s.bullets)circle(ctx,b.x,b.y,4,'#e79b88');
    const drift=Math.sin(s.waveTime*1.3)*13;
    for(const e of s.enemies){const x=e.x+drift;rect(ctx,x-14,e.y-9,28,14,colors[(e.id+s.level)%4]);rect(ctx,x-19,e.y-3,38,8,colors[(e.id+s.level)%4]);rect(ctx,x-8,e.y-6,4,4,'#203b32');rect(ctx,x+4,e.y-6,4,4,'#203b32');rect(ctx,x-11,e.y+6,4,5,'#b6cc8f');rect(ctx,x+7,e.y+6,4,5,'#b6cc8f');}
    ctx.globalAlpha=s.invincible>0?.5:1;ctx.fillStyle='#c7dfb1';ctx.beginPath();ctx.moveTo(s.x,335);ctx.lineTo(s.x+17,369);ctx.lineTo(s.x,360);ctx.lineTo(s.x-17,369);ctx.fill();rect(ctx,s.x-3,347,6,10,'#82c7c5');rect(ctx,s.x-4,366,8,6,'#e3bf7d');ctx.globalAlpha=1;
  }else{
    rect(ctx,0,0,24,400,'#668a63');rect(ctx,296,0,24,400,'#668a63');rect(ctx,24,0,272,400,'#324a45');
    for(const x of [28,288])for(let y=-40;y<400;y+=40)rect(ctx,x,y+(s.distance%40),4,23,'#dfdcb9');
    for(const x of [113,205])for(let y=-44;y<400;y+=44)rect(ctx,x,y+(s.distance%44),2,22,'#d0d6b17a');
    for(const c of s.cars)car(ctx,68+c.lane*92,c.y,colors[c.id%4]);
    ctx.globalAlpha=s.invincible>0?.5:1;car(ctx,68+s.lane*92,335,'#c4dbab');ctx.globalAlpha=1;
    if(s.status==='won')for(let i=0;i<16;i++)rect(ctx,24+i*17,65,17,17,i%2?'#e8eccb':'#263f38');
  }
  ctx.restore();
}
