import {test,expect} from '@playwright/test';
import {games} from '../src/games.js';

test('Louis Kim identity and personal destinations remain accessible',async({page,request})=>{
 await page.goto('/');await expect(page.locator('.intro-copy')).toContainText('Louis Kim');
 const nav=page.getByRole('navigation',{name:'Louis Kim 바로가기'});
 for(const [name,url] of [['홈페이지','https://ersione.com'],['블로그','https://blog.ersione.com'],['이력서','https://resume.ersione.com'],['GitHub','https://github.com/ersione']])await expect(nav.getByRole('link',{name:new RegExp(name)})).toHaveAttribute('href',url);
 const html=await (await request.get('/')).text();expect(html).toContain('name="author" content="Louis Kim"');expect(html).toContain('Louis Kim이 만드는 작은 작업실');
});
for(const width of [320,390,1280])test(`console layout keeps all twelve boards and controls accessible at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:width===1280?720:844});await page.goto('/');await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();
 const dialog=page.getByRole('dialog');
 const checkWidth=async()=>expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await checkWidth();expect((await dialog.boundingBox()).height).toBeLessThan(width===1280?660:700);
 const close=await dialog.getByRole('button',{name:'닫기',exact:true}).boundingBox(),sound=await dialog.locator('.game-sound').boundingBox();expect(sound.x+sound.width).toBeLessThanOrEqual(close.x);
 const widths=await dialog.locator('.arcade-card').evaluateAll(cards=>cards.map(card=>card.getBoundingClientRect().width));expect(Math.max(...widths)-Math.min(...widths)).toBeLessThan(1);
 for(let i=0;i<games.length;i++){
  if(i===6)await page.getByRole('button',{name:'다음 게임 목록',exact:true}).click();
  const game=games[i];await dialog.locator('.arcade-card').filter({has:page.getByText(game.name,{exact:true})}).click();await checkWidth();
  const board=dialog.locator('.action-board,.number-board,.mine-board,.soko-board,.block-board');
  if(await board.count()){
   const b=await board.boundingBox();const ratio=game.id==='blocks'?10/18:['snake','breakout','shooter','racer','pong','flappy','rhythm'].includes(game.id)?4/5:1;
   expect(b.width/b.height).toBeCloseTo(ratio,1);
  }
  const action=dialog.locator('.mini-actions button,.block-actions button,.number-controls button');
  for(const button of await action.all())expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(43);
  const back=dialog.getByRole('button',{name:'← 게임 목록',exact:true});await back.scrollIntoViewIfNeeded();await back.click();
 }
});
test('short phone viewport can scroll to game controls and return',async({page})=>{
 await page.setViewportSize({width:320,height:568});await page.goto('/');await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();await page.getByRole('button',{name:/블록 쌓기/}).click();
 const restart=page.getByRole('button',{name:'처음부터 ↻',exact:true});await restart.scrollIntoViewIfNeeded();await expect(restart).toBeInViewport();await restart.click();
 const back=page.getByRole('button',{name:'← 게임 목록',exact:true});await back.scrollIntoViewIfNeeded();await expect(back).toBeInViewport();await back.click();await expect(page.locator('.arcade-library')).toBeVisible();
});

test('only public repositories have source links',async({page})=>{
 await page.goto('/');
 for(const [name,hasSource] of [['PogoAtlas',false],['Company Lens',true],['Ersione Design System',true]]){
  await page.getByRole('button').filter({has:page.getByText(name,{exact:true})}).click();
  await expect(page.getByRole('dialog').getByRole('link',{name:'소스 코드 ↗'})).toHaveCount(hasSource?1:0);
  await expect(page.getByRole('dialog').getByRole('link',{name:'프로젝트 둘러보기 ↗'})).toBeVisible();
  await page.keyboard.press('Escape');
 }
});

for(const fallback of [false,true])test(`wheel and two-finger pinch repaint during the gesture (fallback=${fallback})`,async({page,context})=>{
 if(fallback)await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};});
 await page.setViewportSize({width:1280,height:900});await page.goto('/');
 const canvas=page.locator('.room canvas');await expect(canvas).toBeVisible();
 // Wait for textures and the initial camera fit, then send isolated input.
 await page.waitForTimeout(1200);const b=await canvas.boundingBox();
 await page.mouse.move(b.x+b.width*.5,b.y+b.height*.5);
 const before=await canvas.screenshot();await page.mouse.wheel(0,-80);
 await expect.poll(async()=>(await canvas.screenshot()).equals(before)).toBe(false);
 const between=await canvas.screenshot();await page.mouse.wheel(0,-80);
 await expect.poll(async()=>(await canvas.screenshot()).equals(between)).toBe(false);
 const cdp=await context.newCDPSession(page),x=b.x+b.width*.5,y=b.y+b.height*.5;
 const points=distance=>[{id:1,x:x-distance,y},{id:2,x:x+distance,y}];
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(50)});
 const pinchBefore=await canvas.screenshot();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(80)});
 await expect.poll(async()=>(await canvas.screenshot()).equals(pinchBefore)).toBe(false);
 const pinchDuring=await canvas.screenshot();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(110)});
 await expect.poll(async()=>(await canvas.screenshot()).equals(pinchDuring)).toBe(false);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
});
test('Studio declares the shared Ersione favicon',async({request})=>{
 const html=await (await request.get('/')).text();expect(html).toContain('rel="icon" href="/icon.png"');
 const icon=await request.get('/icon.png');expect(icon.status()).toBe(200);
 const png=await icon.body();expect(png.readUInt32BE(16)).toBe(576);expect(png.readUInt32BE(20)).toBe(576);
});
