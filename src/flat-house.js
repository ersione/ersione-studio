import {PerspectiveCamera,Vector3} from 'three';
import {rooms,roomAt,movePlayer} from './house-world';

// CPU-only companion for browsers without WebGL2. The same floor plan and
// collision rules drive a moving character over the rendered house backdrop.
export function createFlatHouse(host,projects,onSelect,onHover,onStatus){
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.tabIndex=0;canvas.setAttribute('aria-label','가벼운 집 둘러보기. 방향키 또는 WASD로 이동, E로 가까운 사물 열기.');host.appendChild(canvas);
  const image=new Image();image.src=import.meta.env.BASE_URL+'house-base.png';let dirty=true,paused=false,night=false,position={x:.5,z:1.7},keys=new Set(),pad={x:0,z:0},nearby=null,lastStatus='',scale=1,center=null,w=1,h=1;
  image.onload=()=>{dirty=true;};
  const camera=new PerspectiveCamera(36,1080/680,.1,100);camera.position.set(13,14,17);camera.lookAt(0,.4,0);camera.updateMatrixWorld();
  const points=projects.map(p=>({id:p.id,x:p.position[0],y:p.position[1]+(p.kind==='monitor'?.4:0),z:p.position[2]}));points.push({id:'game',x:1.85,y:1.14,z:3.46});
  function projected(x,y,z){const v=new Vector3(x,y,z).project(camera);return {x:(v.x+1)/2,y:(1-v.y)/2};}
  function frame(){const iw=image.naturalWidth||1080,ih=image.naturalHeight||680;camera.aspect=iw/ih;camera.updateProjectionMatrix();const fit=Math.min(w/iw,h/ih),dw=iw*fit*scale,dh=ih*fit*scale;const c=center||{x:.5,y:.5};return {dw,dh,ox:w/2-c.x*dw,oy:h/2-c.y*dh};}
  function screen(x,y,z,f=frame()){const p=projected(x,y,z);return {x:f.ox+p.x*f.dw,y:f.oy+p.y*f.dh};}
  function status(){const near=points.map(p=>({...p,d:Math.hypot(p.x-position.x,p.z-position.z)})).sort((a,b)=>a.d-b.d)[0];nearby=near&&near.d<2?near.id:null;const p={room:roomAt(position.x,position.z),x:Number(position.x.toFixed(2)),z:Number(position.z.toFixed(2)),nearby};const key=JSON.stringify(p);if(key!==lastStatus){lastStatus=key;onStatus(p);}}
  function rect(x,y,width,height,color){ctx.fillStyle=color;ctx.fillRect(x,y,width,height);}
  function oval(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function render(){
    const f=frame();ctx.clearRect(0,0,w,h);if(image.complete&&image.naturalWidth)ctx.drawImage(image,f.ox,f.oy,f.dw,f.dh);
    const foot=screen(position.x,.08,position.z,f),head=screen(position.x,1.6,position.z,f),size=Math.max(18,foot.y-head.y);ctx.save();ctx.translate(foot.x,foot.y);ctx.scale(size/50,size/50);
    oval(0,-1,11,4,'#40533a33');rect(-8,-15,6,12,'#596c72');rect(3,-15,6,12,'#596c72');rect(-9,-4,8,4,'#273239');rect(3,-4,8,4,'#273239');rect(-11,-32,22,20,'#293f54');oval(-13,-22,3,8,'#f1be9e');oval(13,-22,3,8,'#f1be9e');oval(-13,-39,3,3,'#f1be9e');oval(13,-39,3,3,'#f1be9e');oval(0,-40,13,12,'#f1be9e');oval(-5,-41,1.7,2,'#263238');oval(5,-41,1.7,2,'#263238');oval(-5.5,-42,.6,.7,'#fff8ec');oval(4.5,-42,.6,.7,'#fff8ec');oval(-8,-37,3,1.5,'#ed9b91');oval(8,-37,3,1.5,'#ed9b91');ctx.strokeStyle='#263238';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-37,2.5,0,Math.PI);ctx.stroke();oval(0,-49,14,5,'#252b30');rect(-13,-48,29,3,'#252b30');ctx.restore();
    if(night){ctx.fillStyle='#253e6422';ctx.fillRect(0,0,w,h);}
  }
  const stop=()=>{keys.clear();pad={x:0,z:0};};const interact=()=>{if(!paused&&nearby)onSelect(nearby);};
  function keydown(e){if(paused||e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.isContentEditable)return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();keys.add(k);}if(k==='e'&&!e.repeat)interact();}
  const keyup=e=>keys.delete(e.key.toLowerCase());window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',stop);
  function hit(e){const b=canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;const f=frame();const candidates=points.map(p=>({...p,s:screen(p.x,p.y,p.z,f)})).map(p=>({...p,d:Math.hypot(x-p.s.x,y-p.s.y)})).sort((a,b)=>a.d-b.d);return candidates[0]?.d<Math.max(23,f.dw*.03)?candidates[0].id:null;}
  let down=null;const start=e=>{down=touches.size>1?null:[e.clientX,e.clientY];};const end=e=>{if(!paused&&down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const id=hit(e);if(id)onSelect(id);}down=null;};const move=e=>{const id=hit(e);canvas.style.cursor=id?'pointer':'default';onHover(id);};
  // Keep the same wheel/pinch zoom affordance when WebGL is unavailable.
  const touches=new Map();let pinchDistance=null;
  function zoom(factor,clientX,clientY){if(paused)return;const b=canvas.getBoundingClientRect(),x=clientX-b.left,y=clientY-b.top,f=frame(),next=Math.max(.75,Math.min(4,scale*factor)),ratio=next/scale;center={x:(x-f.ox)/f.dw-(x-w/2)/(f.dw*ratio),y:(y-f.oy)/f.dh-(y-h/2)/(f.dh*ratio)};scale=next;dirty=true;}
  function wheel(e){if(paused)return;e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?h:1);zoom(Math.exp(-Math.max(-150,Math.min(150,delta))*.002),e.clientX,e.clientY);}
  function touchStart(e){if(e.pointerType!=='touch')return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);if(touches.size===2){down=null;const [a,b]=[...touches.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);}}
  function touchMove(e){if(!touches.has(e.pointerId))return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size!==2)return;down=null;const [a,b]=[...touches.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinchDistance>0)zoom(distance/pinchDistance,(a.x+b.x)/2,(a.y+b.y)/2);pinchDistance=distance;}
  function touchEnd(e){touches.delete(e.pointerId);if(touches.size<2)pinchDistance=null;}
  canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('pointerdown',touchStart);canvas.addEventListener('pointermove',touchMove);canvas.addEventListener('pointerup',touchEnd);canvas.addEventListener('pointercancel',touchEnd);
  canvas.addEventListener('pointerdown',start);canvas.addEventListener('click',end);canvas.addEventListener('pointermove',move);
  const resize=()=>{w=host.clientWidth;h=host.clientHeight;const ratio=Math.min(devicePixelRatio,2);canvas.width=w*ratio;canvas.height=h*ratio;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(ratio,0,0,ratio,0,0);dirty=true;};const observer=new ResizeObserver(resize);observer.observe(host);resize();
  let raf,last=performance.now(),lastReport=0;
  function tick(now){raf=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;
    let x=pad.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),z=pad.z+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
    if(!paused&&(x||z)){let dx=.794*x+.607*z,dz=-.607*x+.794*z;const length=Math.hypot(dx,dz);const next=movePlayer(position,dx/length*dt*2.5,dz/length*dt*2.5);if(next.x!==position.x||next.z!==position.z){if(center){const before=projected(position.x,.7,position.z),after=projected(next.x,.7,next.z);center={x:center.x+after.x-before.x,y:center.y+after.y-before.y};}position=next;dirty=true;}}
    if(now-lastReport>100){status();lastReport=now;}if(dirty){render();dirty=false;}
  }
  const visibility=()=>{stop();last=performance.now();dirty=true;};document.addEventListener('visibilitychange',visibility);status();raf=requestAnimationFrame(tick);
  return {reset(){scale=1;center=null;dirty=true;},setRoom(id){const r=rooms.find(r=>r.id===id);if(!r)return;stop();position={x:r.spawn[0],z:r.spawn[1]};scale=w<600?1.75:1.5;center=projected(...r.target);dirty=true;status();},setDirection(x,z){pad={x,z};},setPaused(value){paused=value;if(value)stop();},setNight(value){canvas.dataset.lighting=value?'night':'day';night=value;dirty=true;},interact,
    dispose(){canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('pointerdown',touchStart);canvas.removeEventListener('pointermove',touchMove);canvas.removeEventListener('pointerup',touchEnd);canvas.removeEventListener('pointercancel',touchEnd);cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointerdown',start);canvas.removeEventListener('click',end);canvas.removeEventListener('pointermove',move);image.onload=null;canvas.remove();}
  };
}
