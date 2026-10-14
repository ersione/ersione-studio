import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createRoom(host, projects, onSelect, onHover, onError) {
  let renderer;
  let dirty=true;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
  catch { onError(); return { reset() {}, dispose() {} }; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xeee9e0, 0);
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', '드래그로 회전할 수 있는 3D 작업실. 아래 프로젝트 버튼으로도 탐색할 수 있습니다.');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 9; controls.maxDistance = 18;
  controls.minPolarAngle = .45; controls.maxPolarAngle = 1.36;
  controls.minAzimuthAngle = -.05; controls.maxAzimuthAngle = 1.65;
  const reset = () => { dirty=true; camera.position.set(9, 8, 11); controls.target.set(0, 1, 0); controls.update(); };
  reset();
  scene.add(new THREE.HemisphereLight(0xfff7e8, 0x82949d, 2.7));
  const sun = new THREE.DirectionalLight(0xffefda, 4);
  sun.position.set(-3, 9, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -7; sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -7; sun.shadow.normalBias = .04;
  scene.add(sun);
  const materials = [];
  const mat = (color, extra={}) => { const m = new THREE.MeshStandardMaterial({ color, roughness:.8, ...extra }); materials.push(m); return m; };
  const cream=mat('#ede5d4'), wood=mat('#b9875b'), dark=mat('#263b43'), mint=mat('#b5cbb8'), white=mat('#f8f5eb');
  function box(w,h,d,x,y,z,m,parent=scene) {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; parent.add(o); return o;
  }
  function sphere(r,x,y,z,m,parent=scene) { const o=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),m); o.position.set(x,y,z); o.castShadow=true; parent.add(o); return o; }
  function cylinder(r1,r2,h,x,y,z,m,parent=scene) { const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,32),m); o.position.set(x,y,z); o.castShadow=true; parent.add(o); return o; }
  const textures=[];
  function sign(text, x,y,z,w=1.4,h=.35,parent=scene,bg='#f8f5eb',fg='#263b43') {
    const canvas=document.createElement('canvas'); canvas.width=768; canvas.height=192;
    const c=canvas.getContext('2d'); c.fillStyle=bg; c.fillRect(0,0,768,192); c.fillStyle=fg;
    c.font='600 64px sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(text,384,100);
    const t=new THREE.CanvasTexture(canvas); t.colorSpace=THREE.SRGBColorSpace; textures.push(t);
    const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));
    o.position.set(x,y,z); parent.add(o); return o;
  }
  // Open-front dollhouse: wooden planks, two walls, daylight window.
  box(7,.28,5.8,0,-.14,0,wood);
  for(let i=0;i<12;i++) box(.018,.008,5.7,-3.25+i*.58,.006,0,mat('#a57650'));
  box(7,3.65,.15,0,1.8,-2.9,cream);
  box(.15,3.65,5.8,-3.5,1.8,0,mint);
  box(7,.1,.15,0,.13,-2.79,white); box(.15,.1,5.7,-3.39,.13,0,white);
  box(1.8,1.65,.09,-2,2.4,-2.78,white);
  box(1.59,1.43,.1,-2,2.4,-2.71,mat('#abd1db',{emissive:'#abd1db',emissiveIntensity:.3}));
  box(.055,1.45,.08,-2,2.4,-2.62,white); box(1.6,.055,.08,-2,2.4,-2.62,white);
  box(2.1,.09,.4,-2,1.58,-2.6,wood);
  sign('MAKE SOMETHING GOOD',.55,3.12,-2.79,2.5,.32);
  // Rug and desk.
  box(3.8,.025,2.5,.1,.035,.55,mat('#c6d4c6'));
  for(let i=0;i<6;i++) box(3.65,.004,.025,.1,.052,-.55+i*.44,mat('#b0c4b2'));
  box(2.8,.13,1.05,-.1,1.13,-1.72,wood);
  for(const x of [-1.28,1.08]) for(const z of [-2.1,-1.35]) box(.1,1.05,.1,x,.55,z,dark);
  box(.9,.04,.35,0,1.22,-1.25,white);
  for(let i=0;i<8;i++) box(.06,.015,.25,-.35+i*.1,1.25,-1.25,mat('#b8c5c3'));
  cylinder(.13,.13,.24,1,1.31,-1.5,white);
  // Stool, stacked books and plants.
  cylinder(.4,.4,.13,.2,.73,-.2,mat('#d89767'));
  for(const x of [-.05,.45]) for(const z of [-.45,.05]) box(.055,.68,.055,x,.36,z,wood);
  box(1.2,.1,.55,-2.5,.58,.1,wood);
  for(const x of [-2.95,-2.05]) box(.08,.55,.45,x,.28,.1,wood);
  for(let i=0;i<3;i++) box(.65,.1,.5,2.6,.15+i*.11,.5,mat(['#b37c8b','#678f9a','#d8c9a4'][i]));
  function plant(x,z,scale=1) {
    cylinder(.24*scale,.18*scale,.4*scale,x,.2*scale,z,mat('#c78d70'));
    cylinder(.025,.025,.8*scale,x,.76*scale,z,mat('#66855c'));
    for(let i=0;i<7;i++) { const a=i*2.4; const leaf=sphere(.22*scale,x+Math.cos(a)*.18*scale,(.65+i*.08)*scale,z+Math.sin(a)*.18*scale,mat(i%2?'#698868':'#88a27a')); leaf.scale.set(1,.55,.65); leaf.rotation.z=a; }
  }
  plant(2.7,-2.35,1.4); plant(-2.8,2,1);
  // Wall shelf and framed avatar.
  box(1.7,.1,.5,2.25,1.03,-2.5,wood);
  box(.85,1.05,.08,.25,2.15,-2.75,dark);
  const avatarTexture=new THREE.TextureLoader().load(import.meta.env.BASE_URL+'avatar.png',()=>{dirty=true;}); avatarTexture.colorSpace=THREE.SRGBColorSpace; textures.push(avatarTexture);
  const portrait=new THREE.Mesh(new THREE.PlaneGeometry(.75,.85),new THREE.MeshBasicMaterial({map:avatarTexture})); portrait.position.set(.25,2.15,-2.69); scene.add(portrait);
  // Every data item becomes an interactive room object.
  const targets=[];
  projects.forEach((p,i)=>{
    const g=new THREE.Group(); g.position.set(...(p.position || [-2+i*1.4, .8, 1.6])); scene.add(g); g.userData.project=p.id;
    const accent=mat(p.color);
    if(p.kind==='monitor') {
      box(1.6,.95,.13,0,.4,0,dark,g); box(1.4,.75,.03,0,.4,.085,mat('#dce9ed'),g);
      box(.13,.35,.12,0,-.2,0,dark,g); box(.65,.06,.35,0,-.36,0,dark,g);
      for(let n=0;n<5;n++) box(.16,.1+n*.09,.03,-.5+n*.25,.2+n*.045,.11,accent,g);
      sign('COMPANY LENS',0,.65,.12,1.2,.15,g,'#dce9ed','#2b609f');
    } else if(p.kind==='dex') {
      box(.78,1.05,.18,0,0,0,accent,g); box(.57,.55,.03,0,.1,.11,mat('#d8e6ce'),g);
      const ball=sphere(.13,0,.1,.14,white,g); ball.scale.z=.18;
      box(.24,.07,.04,-.19,-.35,.13,dark,g); box(.07,.24,.04,-.19,-.35,.13,dark,g);
      sphere(.055,.22,-.35,.13,mat('#dc877c'),g);
      sign('ATLAS',0,.36,.14,.46,.12,g,'#d8e6ce','#397a70');
    } else {
      box(1.15,.95,.1,0,0,0,wood,g); box(1.03,.83,.03,0,0,.07,white,g);
      ['#2b609f','#157575','#da603c','#8054a5','#b84b7b','#7e8791'].forEach((col,n)=>sphere(.115,-.3+n%3*.3,.17-Math.floor(n/3)*.32,.11,mat(col),g));
    }
    sign(String(i+1).padStart(2,'0'),0,.98,.13,.38,.2,g,'#f8f5eb',p.color);
    targets.push(g);
  });
  const game=new THREE.Group(); game.position.set(1.8,.7,1.65); game.rotation.y=-.25; game.userData.project='game'; scene.add(game);
  box(.95,1.15,.7,0,0,0,mat('#c77f65'),game); box(.75,.58,.08,0,.17,.39,dark,game);
  sign('PLAY',0,.23,.44,.59,.19,game,'#263b43','#d9ebc5');
  box(.9,.13,.35,0,-.27,.4,wood,game); sphere(.06,-.22,-.17,.48,dark,game); sphere(.05,.25,-.18,.48,mat('#ecc789'),game);
  targets.push(game);
  sign('TAKE A LITTLE BREAK',1.8,.06,2.25,1.7,.2);
  const ray=new THREE.Raycaster(); const pointer=new THREE.Vector2(); let down=null;
  const hit=e=>{
    const r=renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    ray.setFromCamera(pointer,camera); const hits=ray.intersectObjects(targets,true); if(!hits.length)return null;
    let o=hits[0].object; while(o&&!o.userData.project)o=o.parent; return o?.userData.project;
  };
  const move=e=>{const id=hit(e); renderer.domElement.style.cursor=id?'pointer':'grab'; onHover(id);};
  const start=e=>{down=[e.clientX,e.clientY];};
  const end=e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const id=hit(e);if(id)onSelect(id);} down=null;};
  renderer.domElement.addEventListener('pointermove',move); renderer.domElement.addEventListener('pointerdown',start); renderer.domElement.addEventListener('pointerup',end);
  avatarTexture.addEventListener?.('update',()=>{dirty=true;});
  const resize=()=>{dirty=true;const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize); observer.observe(host); resize();
  let frame; let visible=true;
  const draw=()=>{frame=requestAnimationFrame(draw);if(visible){const changed=controls.update();if(changed||dirty){renderer.render(scene,camera);dirty=false;}}}; draw();
  const visibility=()=>{visible=!document.hidden;};document.addEventListener('visibilitychange',visibility);
  return {reset,dispose(){cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);controls.dispose();renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerdown',start);renderer.domElement.removeEventListener('pointerup',end);scene.traverse(o=>{o.geometry?.dispose(); if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();}};
}
