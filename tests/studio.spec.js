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
 await page.goto('');await expect(page.getByText('· 가벼운 모드',{exact:true})).toBeAttached();await page.getByRole('button',{name:'주방으로 이동',exact:true}).click();await expect(page.getByLabel('캐릭터 위치')).toHaveText('주방');const start=await page.getByLabel('캐릭터 위치').getAttribute('data-player-x');await page.keyboard.down('s');await expect.poll(()=>page.getByLabel('캐릭터 위치').getAttribute('data-player-x')).not.toBe(start);await page.keyboard.up('s');
 await page.getByRole('button',{name:/Company Lens/}).click();await expect(page.getByRole('dialog')).toBeVisible();
});
test('room objects can be selected directly',async({page})=>{
 const THREE=await import('three');
 await page.setViewportSize({width:1440,height:1000});await page.goto('');
 await expect(page.locator('canvas')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 const bounds=await page.locator('canvas').boundingBox();
 const camera=new THREE.PerspectiveCamera(36,bounds.width/bounds.height,.1,100);
 camera.position.set(13,14,17);camera.lookAt(0,.4,0);camera.updateMatrixWorld();
 for(const [point,title] of [[[-6,1.45,-1.26],'PogoAtlas'],[[-3.6,1.9,-3.83],'Company Lens'],[[-1.65,1.8,-2.98],'Ersione Design System'],[[1.85,1,4],'작은 기억 게임']]){
  const v=new THREE.Vector3(...point).project(camera);
  await page.mouse.click(bounds.x+(v.x+1)*bounds.width/2,bounds.y+(1-v.y)*bounds.height/2);
  await expect(page.getByRole('dialog').getByRole('heading',{name:title,exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
 }
});

test('character walks, interacts nearby, and pauses inside a dialog',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'작업방으로 이동',exact:true}).click();
 const location=page.getByLabel('캐릭터 위치');await expect(location).toHaveText('작업방');
 const initial=await location.getAttribute('data-player-z');
 // Room camera finishes before the direction-relative walk begins.
 await page.waitForTimeout(750);await page.keyboard.down('w');
 await expect(page.getByRole('button',{name:'E Company Lens 열기 ↗',exact:true})).toBeVisible();
 await page.keyboard.up('w');expect(await location.getAttribute('data-player-z')).not.toBe(initial);
 await page.keyboard.press('e');await expect(page.getByRole('dialog').getByRole('heading',{name:'Company Lens',exact:true})).toBeVisible();
 const before=await location.getAttribute('data-player-x');await page.keyboard.down('d');await page.waitForTimeout(350);await page.keyboard.up('d');expect(await location.getAttribute('data-player-x')).toBe(before);
 await page.keyboard.press('Escape');
 for(const name of ['주방','휴식방','거실']){await page.getByRole('button',{name:name+(name==='거실'?'로':'으로')+' 이동',exact:true}).click();await expect(location).toHaveText(name);}
});
test('touch movement stops on release',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');const location=page.getByLabel('캐릭터 위치');
 const initial=await location.getAttribute('data-player-x');const pad=page.getByRole('button',{name:'캐릭터 오른쪽으로 이동',exact:true});const b=await pad.boundingBox();
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await expect.poll(()=>location.getAttribute('data-player-x')).not.toBe(initial);await page.mouse.up();
 await page.waitForTimeout(150);const stopped=await location.getAttribute('data-player-x');await page.waitForTimeout(200);expect(await location.getAttribute('data-player-x')).toBe(stopped);
});
test('social metadata and image are available without JavaScript',async({request})=>{
 const html=await (await request.get('/')).text();expect(html).toContain('property="og:title"');expect(html).toContain('property="og:image" content="https://studio.ersione.com/og-house-v2.png"');expect(html).toContain('name="twitter:card" content="summary_large_image"');
 const image=await request.get('/og-house-v2.png');expect(image.status()).toBe(200);const png=await image.body();expect(png.readUInt32BE(16)).toBe(1200);expect(png.readUInt32BE(20)).toBe(630);
});
