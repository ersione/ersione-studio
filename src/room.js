import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { rooms,obstacles,roomAt,movePlayer } from './house-world';
import {createFlatHouse} from './flat-house';

export const HOME_CAMERA=[13,14,17];
export const HOME_TARGET=[0,.4,0];
export function createRoom(host,projects,onSelect,onHover,onError,onStatus=()=>{}) {
  let renderer,dirty=true,disposed=false,paused=false,night=false;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{onError();return createFlatHouse(host,projects,onSelect,onHover,onStatus);}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xeee9e0,0);host.appendChild(renderer.domElement);
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','집 안 둘러보기. WASD 또는 방향키로 이동, E로 가까운 사물 열기. 드래그 회전, 스크롤 확대.');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,100);
  const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.enablePan=false;
  // Wheel and pinch update OrbitControls outside the animation frame.
  // Its change event must invalidate the canvas even if the next update is idle.
  const invalidate=()=>{dirty=true;};controls.addEventListener('change',invalidate);
  controls.minDistance=6;controls.maxDistance=38;controls.minPolarAngle=.35;controls.maxPolarAngle=1.25;
  controls.minAzimuthAngle=-.1;controls.maxAzimuthAngle=1.5;
  let cameraTween=null,homeView=true;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function view(target,offset,instant=false){
    const t=new THREE.Vector3(...target),p=t.clone().add(new THREE.Vector3(...offset));
    if(instant||reducedMotion){controls.target.copy(t);camera.position.copy(p);cameraTween=null;controls.update();dirty=true;}
    else cameraTween={from:camera.position.clone(),to:p,fromTarget:controls.target.clone(),toTarget:t,start:performance.now()};
  }
  const reset=()=>{const fit=Math.max(1,1.3/camera.aspect);controls.maxDistance=Math.max(38,Math.hypot(...HOME_CAMERA)*fit+2);view(HOME_TARGET,[HOME_CAMERA[0]*fit,(HOME_CAMERA[1]-.4)*fit,HOME_CAMERA[2]*fit],true);homeView=true;};reset();
  const hemi=new THREE.HemisphereLight(0xfff8ec,0x8a9e9a,2.6);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff0db,3.5);sun.position.set(-7,15,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12});sun.shadow.normalBias=.045;scene.add(sun);
  const materials=new Map(),textures=[];
  function mat(color,extra={}){const key=color+JSON.stringify(extra);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.85,...extra}));return materials.get(key);}
  const wood=mat('#b88860'),dark=mat('#263e43'),cream=mat('#eee5d4'),white=mat('#f6f3e9'),sage=mat('#adc1a9');
  function box(w,h,d,x,y,z,m,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function sphere(r,x,y,z,m,parent=scene){const o=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
  function cylinder(r1,r2,h,x,y,z,m,parent=scene){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,24),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function sign(text,x,y,z,w=1.5,h=.3,parent=scene,bg='#f6f3e9',fg='#344e45'){
    const c=document.createElement('canvas');c.height=192;c.width=Math.round(c.height*w/h);const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=fg;
    let fontSize=112;ctx.font=`700 ${fontSize}px sans-serif`;while(ctx.measureText(text).width>c.width-48&&fontSize>24){fontSize-=2;ctx.font=`700 ${fontSize}px sans-serif`;}ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,c.width/2,c.height/2);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));o.position.set(x,y,z);parent.add(o);return o;
  }
  function plant(x,z,size=1,y=0){
    cylinder(.25*size,.18*size,.38*size,x,y+.19*size,z,mat('#bc8063'));cylinder(.025,.025,.8*size,x,y+.7*size,z,mat('#627e58'));
    for(let i=0;i<7;i++){const a=i*2.4,o=sphere(.24*size,x+Math.cos(a)*.2*size,y+(.65+i*.09)*size,z+Math.sin(a)*.2*size,mat(i%2?'#6d8c68':'#91a87e'));o.scale.set(1,.58,.7);o.rotation.z=a;}
  }
  // An open-roof house with four connected spaces and real doorway gaps.
  box(14,.28,10,0,-.14,0,wood);
  box(5.92,.035,4.8,-3.95,.025,-2.45,mat('#c6ac88'));box(7.8,.04,4.8,3,.03,-2.45,mat('#dfdcd0'));
  box(2.8,.035,4.8,5.5,.025,2.45,mat('#d5b69a'));
  for(let i=0;i<24;i++)box(.014,.005,9.8,-6.8+i*.58,.052,0,mat('#a47e59'));
  // Tiled kitchen floor.
  for(let x=0;x<8;x++)for(let z=0;z<5;z++)box(.96,.007,.94,-.4+x,.057,-4.4+z,mat((x+z)%2?'#e8e5d8':'#d8ddd0'));
  box(14,3.5,.16,0,1.75,-5,cream);box(.16,3.5,10,-7,1.75,0,sage);
  box(13.85,.12,.12,0,.12,-4.87,white);box(.12,.12,9.8,-6.87,.12,0,white);
  obstacles.filter(o=>o.kind==='wall').forEach(o=>{box(o.w,o.h,o.d,o.x,o.h/2,o.z,cream);box(o.w+.03,.07,o.d+.04,o.x,o.h+.035,o.z,wood);});
  function doorway(x,z,w=1.9){box(.09,2.35,.12,x-w/2,1.18,z,wood);box(.09,2.35,.12,x+w/2,1.18,z,wood);box(w+.1,.09,.12,x,2.4,z,wood);}
  doorway(-2.65,0,2.05);doorway(3,0,1.95);
  function windowFrame(x,w){box(w,1.55,.08,x,2.3,-4.88,white);box(w-.16,1.38,.08,x,2.3,-4.82,mat('#b7d9db',{emissive:'#b7d9db',emissiveIntensity:.15}));box(.045,1.4,.06,x,2.3,-4.75,white);box(w-.15,.045,.06,x,2.3,-4.75,white);box(w+.2,.09,.35,x,1.51,-4.72,wood);}
  windowFrame(-5.7,1.6);windowFrame(3.0,2.5);
  sign('THE STUDIO',-3.3,3.04,-4.88,2.2,.28);sign('SLOW KITCHEN',3,3.26,-4.88,2.25,.27);
  const floorLabels=[['LIVING ROOM',-1.8,4.6,2.1],['QUIET CORNER',5.6,4.85,1.8]];
  floorLabels.forEach(([t,x,z,w])=>{const s=sign(t,x,.07,z,w,.28);s.rotation.x=-Math.PI/2;});
  // Workroom desk, keyboard, books, lamp and avatar portrait.
  box(3.4,.13,1.25,-3.6,1.13,-3.85,wood);for(const x of [-5.05,-2.15])for(const z of [-4.3,-3.4])box(.09,1.08,.09,x,.54,z,dark);
  box(1,.04,.32,-3.55,1.23,-3.36,white);for(let i=0;i<9;i++)box(.06,.016,.24,-3.95+i*.1,1.26,-3.36,mat('#b2c2ba'));
  cylinder(.12,.12,.23,-2.3,1.32,-3.55,white);cylinder(.16,.2,.08,-4.9,1.26,-4,dark);cylinder(.025,.025,.65,-4.9,1.6,-4,dark);const shade=new THREE.Mesh(new THREE.ConeGeometry(.25,.32,24),mat('#e3bd7f'));shade.position.set(-4.9,1.98,-4);scene.add(shade);
  box(1.1,.12,.8,-6,.62,-1.4,wood);box(.85,.55,.6,-6,.28,-1.4,cream);
  box(1.35,.1,.4,-1.9,1.06,-4.6,wood);for(let i=0;i<5;i++)box(.14,.45+i%2*.12,.3,-2.4+i*.19,1.34,-4.6,mat(['#739183','#9e7b91','#d4b68b'][i%3]));
  const avatarTexture=new THREE.TextureLoader().load(import.meta.env.BASE_URL+'avatar.png',()=>{if(!disposed)dirty=true;});avatarTexture.colorSpace=THREE.SRGBColorSpace;textures.push(avatarTexture);
  box(.95,.95,.07,-1.9,2.35,-4.85,dark);const portrait=new THREE.Mesh(new THREE.PlaneGeometry(.83,.83),new THREE.MeshBasicMaterial({map:avatarTexture}));portrait.position.set(-1.9,2.35,-4.8);scene.add(portrait);
  const rug=box(3.9,.025,3.3,-3.6,.07,2.4,mat('#b8c8b0'));for(let i=0;i<6;i++)box(3.7,.004,.02,-3.6,.085,1+i*.5,mat('#a4b99c'));
  // Sofa and coffee table in the living room.
  box(3.6,.45,1.25,-4.3,.4,3.7,mat('#8da68e'));box(3.6,.7,.25,-4.3,.94,4.2,mat('#78967e'));
  for(const x of [-5.95,-2.65])box(.3,.6,1.2,x,.78,3.65,mat('#78967e'));
  for(const x of [-5.2,-4.3,-3.4])box(.82,.15,.84,x,.69,3.55,mat('#b4c2a0'));
  const pillow=box(.55,.55,.19,-5.25,1.02,3.9,mat('#e4bf8d'));pillow.rotation.z=.16;
  box(1.65,.13,.9,-4.1,.62,1.85,wood);for(const x of [-4.7,-3.5])for(const z of [1.56,2.14])box(.065,.58,.065,x,.3,z,dark);
  box(.47,.06,.33,-4.35,.73,1.85,mat('#8054a5'));cylinder(.1,.1,.16,-3.75,.78,1.85,white);
  // Kitchen: cabinets, stove, sink, island, stools and fridge.
  box(6.4,1.1,1.1,2.8,.55,-4.35,mat('#a8bca9'));box(6.5,.12,1.17,2.8,1.16,-4.35,white);
  for(let i=0;i<7;i++){box(.025,.92,.01,-.25+i*.88,.55,-3.79,mat('#819b89'));box(.25,.035,.035,.12+i*.88,.95,-3.76,dark);}
  box(1.05,.025,.65,1.3,1.24,-4.35,dark);for(const x of [1.04,1.57])for(const z of [-4.53,-4.17])cylinder(.13,.13,.025,x,1.26,z,mat('#65716b'));
  box(.85,.04,.6,3.7,1.24,-4.35,mat('#849b9d'));box(.62,.035,.4,3.7,1.265,-4.35,mat('#c4d5d2'));cylinder(.035,.035,.4,3.7,1.44,-4.65,dark);box(.25,.04,.04,3.8,1.65,-4.65,dark);
  box(1.15,2.4,1.4,6,1.2,-4.15,white);box(.04,.7,.05,5.62,1.6,-3.42,dark);box(1.08,.025,.02,6,.8,-3.44,mat('#b5c1b5'));
  box(2.8,1.02,1.2,2.4,.51,-2,mat('#cfb490'));box(2.95,.13,1.3,2.4,1.09,-2,white);
  for(const x of [1.65,3.2]){cylinder(.25,.25,.1,x,.62,-.98,wood);for(const xx of [x-.15,x+.15])box(.04,.58,.04,xx,.29,-.98,dark);}
  cylinder(.28,.18,.12,2.3,1.22,-2,mat('#d19c76'));sphere(.12,2.2,1.32,-2,mat('#dd9766'));sphere(.12,2.4,1.32,-2,mat('#9eaa71'));
  // A small bedroom / resting corner.
  box(1.65,.35,2.3,5.7,.25,3.65,wood);box(1.6,.23,2.22,5.7,.54,3.65,white);box(1.62,.08,1.5,5.7,.7,3.35,mat('#c6b3ca'));box(1.64,.62,.13,5.7,.65,4.8,wood);
  box(1.16,.15,.45,5.7,.75,4.4,white);box(.55,.62,.55,4.55,.31,4.35,wood);cylinder(.12,.14,.23,4.55,.79,4.35,mat('#e2cda8'));
  plant(-6.3,-4.4,.7);plant(-6.15,3.9,1.1);plant(6.25,.55,.8);plant(-.4,-4.45,.65,1.2);
  // Project objects remain data-driven.
  const targets=[],interactionPoints=[],projectSigns=[];
  projects.forEach((p,i)=>{
    const g=new THREE.Group();g.position.set(...(p.position||[-3+i,1.3,-3.8]));g.userData.project=p.id;scene.add(g);const accent=mat(p.color);
    if(p.kind==='monitor'){
      box(1.6,.95,.13,0,.4,0,dark,g);box(1.4,.75,.03,0,.4,.085,mat('#dce9ed'),g);box(.13,.35,.12,0,-.2,0,dark,g);box(.65,.06,.35,0,-.36,0,dark,g);
      for(let n=0;n<5;n++)box(.16,.1+n*.09,.03,-.5+n*.25,.2+n*.045,.11,accent,g);sign('COMPANY LENS',0,.65,.12,1.2,.15,g,'#dce9ed','#2b609f');
    }else if(p.kind==='pokeball'||p.kind==='dex'){
      // Red/white hemispheres, a black equator and a round front button.
      for(const [start,color] of [[0,'#d9574b'],[Math.PI/2,'#faf5e9']]){
        const shell=new THREE.Mesh(new THREE.SphereGeometry(.48,32,20,0,Math.PI*2,start,Math.PI/2),mat(color,{roughness:.35}));
        shell.castShadow=true;shell.receiveShadow=true;g.add(shell);
      }
      cylinder(.485,.485,.055,0,0,0,dark,g);
      const rim=cylinder(.14,.14,.055,0,0,.47,dark,g);rim.rotation.x=Math.PI/2;
      const button=cylinder(.102,.102,.045,0,0,.51,white,g);button.rotation.x=Math.PI/2;
      const center=cylinder(.066,.066,.012,0,0,.54,mat('#e5e9df'),g);center.rotation.x=Math.PI/2;
      cylinder(.18,.22,.17,0,-.55,0,dark,g);cylinder(.32,.32,.07,0,-.64,0,white,g);
      sign('POGO ATLAS',0,-.83,.42,1,.17,g,'#f6f3e9','#397a70');
    }else{
      box(1.15,.95,.1,0,0,0,wood,g);box(1.03,.83,.03,0,0,.07,white,g);['#2b609f','#157575','#da603c','#8054a5','#b84b7b','#7e8791'].forEach((col,n)=>sphere(.115,-.3+n%3*.3,.17-Math.floor(n/3)*.32,.11,mat(col),g));
    }
    projectSigns.push(sign(p.roomLabel||p.name,0,1.05,.13,p.id==='design'?1.65:1.5,.28,g,'#263e43','#fffaf0'));targets.push(g);
    interactionPoints.push({id:p.id,x:g.position.x,z:g.position.z});
  });
  const game=new THREE.Group();game.position.set(1.85,.75,3.5);game.userData.project='game';scene.add(game);
  // A living-room TV, console tower and controller on a low cabinet.
  box(1.8,.46,.9,0,-.48,0,wood,game);box(1.64,.26,.04,0,-.47,.47,cream,game);
  for(const x of [-.72,.72])box(.09,.16,.65,x,-.69,0,dark,game);
  box(1.75,.98,.13,0,.38,-.12,dark,game);box(1.58,.81,.025,0,.39,-.04,mat('#304e52',{emissive:'#304e52',emissiveIntensity:.3}),game);
  sign('PLAY',0,.46,-.018,1.12,.3,game,'#304e52','#dce8c9');sign('CHOOSE YOUR GAME',0,.19,-.016,1.28,.13,game,'#304e52','#b7cec0');
  box(.12,.17,.12,0,-.18,-.12,dark,game);box(.55,.035,.3,0,-.26,-.1,dark,game);
  box(.21,.46,.34,.64,-.03,.2,white,game);box(.055,.42,.35,.64,-.03,.21,dark,game);box(.01,.25,.015,.676,.01,.391,mat('#8fd6da',{emissive:'#8fd6da',emissiveIntensity:.7}),game);
  const controller=new THREE.Group();controller.position.set(-.48,-.22,.25);game.add(controller);
  const grip=sphere(.105,-.12,0,0,white,controller);grip.scale.set(.8,.42,1);const grip2=sphere(.105,.12,0,0,white,controller);grip2.scale.set(.8,.42,1);box(.24,.06,.13,0,.01,-.015,white,controller);
  for(const x of [-.065,.065])sphere(.025,x,.05,.025,dark,controller);box(.065,.012,.02,-.12,.048,-.035,dark,controller);box(.02,.012,.065,-.12,.048,-.035,dark,controller);sphere(.018,.125,.05,-.035,mat('#c38368'),controller);
  targets.push(game);interactionPoints.push({id:'game',x:1.85,z:3.5});
  // Round, clean-shaven little character with rosy cheeks and a black cap.
  const player=new THREE.Group();player.visible=!new URLSearchParams(window.location.search).has('capture');scene.add(player);player.position.set(.5,0,1.7);
  const skin=mat('#f1be9e'),navy=mat('#293f54'),black=mat('#252b30'),blush=mat('#ed9b91');
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.32,28),new THREE.MeshBasicMaterial({color:'#394b36',transparent:true,opacity:.18,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.09;player.add(shadow);
  const body=new THREE.Group();player.add(body);cylinder(.25,.29,.52,0,.81,0,navy,body);
  const head=sphere(.31,0,1.3,0,skin,body);head.scale.set(1,.94,.92);
  for(const x of [-.105,.105]){
    const eye=sphere(.028,x,1.33,.264,black,body);eye.scale.y=1.18;
    sphere(.009,x-.006,1.343,.288,white,body);
    const cheek=sphere(.052,x*1.65,1.235,.238,blush,body);cheek.scale.set(1,.5,.22);
    sphere(.055,Math.sign(x)*.3,1.29,0,skin,body);
  }
  sphere(.028,0,1.265,.287,skin,body);
  const smile=new THREE.Mesh(new THREE.TorusGeometry(.044,.009,8,16,Math.PI),black);smile.rotation.z=Math.PI;smile.position.set(0,1.23,.272);body.add(smile);
  const cap=sphere(.32,0,1.47,-.005,black,body);cap.scale.set(1,.5,.94);const brim=box(.44,.035,.19,0,1.46,.225,black,body);brim.rotation.x=.08;
  const limbs=[];
  for(const x of [-.15,.15]){const leg=new THREE.Group();leg.position.set(x,.56,0);body.add(leg);box(.16,.39,.17,0,-.2,0,mat('#667579'),leg);box(.18,.1,.28,0,-.43,.045,black,leg);limbs.push(leg);}
  for(const x of [-.32,.32]){const arm=new THREE.Group();arm.position.set(x,1.04,0);body.add(arm);cylinder(.085,.08,.17,0,-.08,0,navy,arm);cylinder(.065,.06,.27,0,-.29,0,skin,arm);limbs.push(arm);}
  const nameplate=sign('LOUIS KIM',0,1.83,0,.8,.17,player,'#f6f3e9','#344e45');
  let position={x:.5,z:1.7},keys=new Set(),pad={x:0,z:0},nearby=null,lastStatus='',lastTime=performance.now(),walk=0;
  const status=()=>{const point=interactionPoints.map(p=>({...p,d:Math.hypot(p.x-position.x,p.z-position.z)})).sort((a,b)=>a.d-b.d)[0];nearby=point&&point.d<2?point.id:null;
    const payload={room:roomAt(position.x,position.z),x:Number(position.x.toFixed(2)),z:Number(position.z.toFixed(2)),nearby};const key=JSON.stringify(payload);if(key!==lastStatus){lastStatus=key;onStatus(payload);}};
  const stop=()=>{keys.clear();pad={x:0,z:0};};
  const interact=()=>{if(!paused&&nearby)onSelect(nearby);};
  function keydown(e){if(paused||e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.isContentEditable)return;
    const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();keys.add(k);}if(k==='e'&&!e.repeat)interact();}
  function keyup(e){keys.delete(e.key.toLowerCase());}
  window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',stop);
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
  function hit(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(targets,true);if(!hits.length)return null;let o=hits[0].object;while(o&&!o.userData.project)o=o.parent;return o?.userData.project;}
  const move=e=>{const id=hit(e);canvas.style.cursor=id?'pointer':'grab';onHover(id);};const start=e=>{down=[e.clientX,e.clientY];};
  const end=e=>{if(!paused&&down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const id=hit(e);if(id)onSelect(id);}down=null;};
  canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerdown',start);canvas.addEventListener('click',end);
  const cancelTween=()=>{cameraTween=null;homeView=false;};controls.addEventListener('start',cancelTween);
  const resize=()=>{dirty=true;const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(homeView)reset();};const observer=new ResizeObserver(resize);observer.observe(host);resize();
  let frame,visible=true,lastReport=0;
  function draw(now){frame=requestAnimationFrame(draw);const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;if(!visible)return;
    if(cameraTween){const t=Math.min((now-cameraTween.start)/650,1),e=1-Math.pow(1-t,3);camera.position.lerpVectors(cameraTween.from,cameraTween.to,e);controls.target.lerpVectors(cameraTween.fromTarget,cameraTween.toTarget,e);dirty=true;if(t===1)cameraTween=null;}
    let sx=pad.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),sz=pad.z+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
    if(!paused&&(sx||sz)){
      const forward=controls.target.clone().sub(camera.position);forward.y=0;forward.normalize();const right=new THREE.Vector3(-forward.z,0,forward.x);const direction=right.multiplyScalar(sx).add(forward.multiplyScalar(-sz)).normalize();
      const next=movePlayer(position,direction.x*dt*2.5,direction.z*dt*2.5);const moved=Math.hypot(next.x-position.x,next.z-position.z)>.0001;if(moved&&!homeView&&!cameraTween){const delta=new THREE.Vector3(next.x-position.x,0,next.z-position.z);camera.position.add(delta);controls.target.add(delta);}
      position=next;player.position.set(position.x,0,position.z);
      if(moved){walk+=dt*10;player.rotation.y=Math.atan2(direction.x,direction.z);limbs.forEach((limb,i)=>limb.rotation.x=Math.sin(walk)*(i%2?-.4:.4));body.position.y=reducedMotion?0:Math.abs(Math.sin(walk))*.025;dirty=true;}
    }else if(limbs.some(l=>l.rotation.x!==0)){limbs.forEach(l=>l.rotation.x=0);body.position.y=0;dirty=true;}
    // Keep the name tag legible as the character turns.
    nameplate.quaternion.copy(player.quaternion.clone().invert().multiply(camera.quaternion));
    for(const label of projectSigns)label.quaternion.copy(camera.quaternion);
    if(now-lastReport>100){status();lastReport=now;}
    const changed=controls.update();if(changed||dirty){renderer.render(scene,camera);dirty=false;}
  }
  status();frame=requestAnimationFrame(draw);
  const visibility=()=>{visible=!document.hidden;stop();lastTime=performance.now();dirty=true;};document.addEventListener('visibilitychange',visibility);
  return {reset,interact,
    setDirection(x,z){pad={x,z};},
    setPaused(value){paused=value;if(value)stop();},
    setRoom(id){homeView=false;const r=rooms.find(r=>r.id===id);if(!r)return;stop();position={x:r.spawn[0],z:r.spawn[1]};player.position.set(position.x,0,position.z);player.rotation.y=.35;view(r.target,[7,8,10]);status();dirty=true;},
    setNight(value){canvas.dataset.lighting=value?'night':'day';night=value;hemi.intensity=night?1.1:2.6;sun.intensity=night?1.2:3.5;sun.color.set(night?'#adc3ed':'#fff0db');dirty=true;},
    dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.removeEventListener('change',invalidate);controls.dispose();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerdown',start);canvas.removeEventListener('click',end);scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});textures.forEach(t=>t.dispose());renderer.dispose();canvas.remove();}
  };
}
