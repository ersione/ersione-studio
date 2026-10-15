export const rooms = [
  {id:'living',name:'거실',en:'LIVING ROOM',spawn:[.5,1.7],target:[-1.3,.7,2.2]},
  {id:'study',name:'작업방',en:'THE STUDIO',spawn:[-3.0,-1.3],target:[-4,.9,-2.5]},
  {id:'kitchen',name:'주방',en:'SLOW KITCHEN',spawn:[4.8,-.9],target:[3,.8,-2.3]},
  {id:'rest',name:'휴식방',en:'QUIET CORNER',spawn:[5.3,1.8],target:[5.5,.7,3.1]},
];
// Footprints shared by the visible walls/furniture and movement collision.
export const obstacles = [
  {id:'study-wall-a',x:-5.35,z:0,w:3.3,d:.16,h:1.1,kind:'wall'},
  {id:'study-wall-b',x:.25,z:0,w:3.5,d:.16,h:1.1,kind:'wall'},
  {id:'kitchen-wall',x:5.5,z:0,w:3,d:.16,h:1.1,kind:'wall'},
  {id:'middle-wall-a',x:-1,z:-4.25,w:.16,d:1.5,h:2.8,kind:'wall'},
  {id:'middle-wall-b',x:-1,z:-1,w:.16,d:2,h:1.1,kind:'wall'},
  {id:'rest-wall',x:4,z:3.5,w:.16,d:3,h:.85,kind:'wall'},
  {id:'desk',x:-3.6,z:-3.85,w:3.4,d:1.25},
  {id:'dex-stand',x:-6,z:-1.4,w:1.1,d:.8},
  {id:'sofa',x:-4.3,z:3.7,w:3.6,d:1.25},
  {id:'coffee-table',x:-4.1,z:1.85,w:1.65,d:.9},
  {id:'arcade',x:1.85,z:3.5,w:1.8,d:.9},
  {id:'kitchen-counter',x:2.8,z:-4.35,w:6.4,d:1.1},
  {id:'fridge',x:6,z:-4.15,w:1.15,d:1.4},
  {id:'island',x:2.4,z:-2,w:2.8,d:1.2},
  {id:'bed',x:5.7,z:3.65,w:1.65,d:2.3},
];
export function roomAt(x,z) {return z<0?(x < -1?'study':'kitchen'):(x>4?'rest':'living');}
export function canStand(x,z,r=.24) {
  if(x < -6.78+r || x > 6.78-r || z < -4.78+r || z > 4.78-r) return false;
  return !obstacles.some(o=>x>o.x-o.w/2-r&&x<o.x+o.w/2+r&&z>o.z-o.d/2-r&&z<o.z+o.d/2+r);
}
export function movePlayer(position,dx,dz) {
  // Sweep small steps so long frames cannot tunnel through a thin wall.
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));
  let {x,z}=position;
  for(let i=0;i<steps;i++){if(canStand(x+dx/steps,z))x+=dx/steps;if(canStand(x,z+dz/steps))z+=dz/steps;}
  return {x,z};
}
