import {test,expect} from '@playwright/test';
test('room renders and projects open accessible dialogs',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('');await expect(page.locator('canvas')).toBeVisible();
 for(const name of ['PogoAtlas','Company Lens','Ersione Design System']){
  const trigger=page.getByRole('button').filter({has:page.getByText(name,{exact:true})});
  await trigger.click();await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading',{name,exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'프로젝트 둘러보기 ↗'})).toHaveAttribute('href',/^https:\/\//);
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(trigger).toBeFocused();
 }
 await page.getByRole('button',{name:'처음 시점으로 돌아가기'}).click();expect(errors).toEqual([]);
});
test('memory game can be completed and restarted',async({page})=>{
 await page.goto('');await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();
 const seen=new Map();
 for(let i=0;i<8;i+=2){
  const a=page.locator('.game-grid button').nth(i),b=page.locator('.game-grid button').nth(i+1);
  await a.click();const sa=await a.innerText();await b.click();const sb=await b.innerText();
  for(const [symbol,index] of [[sa,i],[sb,i+1]])seen.set(symbol,[...(seen.get(symbol)||[]),index]);
  if(sa===sb)await expect(a).toHaveClass('matched');else await expect(a).toHaveText('?');
 }
 for(const pair of seen.values()){
  const a=page.locator('.game-grid button').nth(pair[0]);if(await a.evaluate(b=>b.classList.contains('matched')))continue;
  await a.click();await page.locator('.game-grid button').nth(pair[1]).click();await expect(a).toHaveClass('matched');
 }
 await expect(page.getByText('모두 찾았어요! 잠깐의 휴식 완료.')).toBeVisible();
 await page.getByRole('button',{name:'다시 하기 ↻'}).click();await expect(page.locator('.matched')).toHaveCount(0);
});
test('mobile layout stays within viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('');await expect(page.locator('canvas')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.getByRole('button',{name:/Ersione Design System/}).click();await expect(page.getByRole('dialog')).toBeVisible();
});

test('WebGL fallback preserves project access',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.includes('webgl'))return null;return original.call(this,type,...args);};});
 await page.goto('');await expect(page.getByAltText('모니터, 도감, 팔레트와 게임기가 놓인 작은 작업실')).toBeVisible();
 await page.getByRole('button',{name:/Company Lens/}).click();await expect(page.getByRole('dialog')).toBeVisible();
});
test('room objects can be selected directly',async({page})=>{
 const THREE=await import('three');
 await page.setViewportSize({width:1440,height:1000});await page.goto('');
 await expect(page.locator('canvas')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 const bounds=await page.locator('canvas').boundingBox();
 const camera=new THREE.PerspectiveCamera(36,bounds.width/bounds.height,.1,100);
 camera.position.set(9,8,11);camera.lookAt(0,1,0);camera.updateMatrixWorld();
 for(const [point,title] of [[[-2.1,1.45,.24],'PogoAtlas'],[[0,1.75,-1.73],'Company Lens'],[[2.5,1.65,-1.38],'Ersione Design System'],[[1.7,.93,2.08],'작은 기억 게임']]){
  const v=new THREE.Vector3(...point).project(camera);
  await page.mouse.click(bounds.x+(v.x+1)*bounds.width/2,bounds.y+(1-v.y)*bounds.height/2);
  await expect(page.getByRole('dialog').getByRole('heading',{name:title,exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
 }
});
