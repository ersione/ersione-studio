import {test,expect} from '@playwright/test';
async function open(page,kind,width){
 await page.setViewportSize({width,height:844});
 await page.addInitScript(()=>{Math.random=()=>0;});await page.goto('/');
 await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();
 if(kind!=='rhythm')await page.getByRole('button',{name:'다음 게임 목록',exact:true}).click();
 await page.locator(`[data-game="${kind}"]`).click();await page.getByRole('button',{name:'게임 시작',exact:true}).click();
}
async function pauseRestart(page,board){
 await page.getByRole('button',{name:'일시정지',exact:true}).click();const time=await board.getAttribute('data-action-time');
 await page.clock.runFor(700);expect(await board.getAttribute('data-action-time')).toBe(time);
 await page.getByRole('button',{name:'처음부터 ↻',exact:true}).click();await expect(board).toHaveAttribute('data-action-time','0.0');
 expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
}
for(const width of [320,390]){
 test(`pong uses keyboard and held touch, pauses and restarts at ${width}px`,async({page})=>{
  await open(page,'pong',width);const board=page.locator('.action-board');
  await board.press('ArrowLeft',{noWaitAfter:true});
  await page.keyboard.down('ArrowLeft');await page.clock.runFor(200);await page.keyboard.up('ArrowLeft');
  const left=Number(await board.getAttribute('data-action-position'));expect(left).toBeLessThan(160);
  const right=page.getByRole('button',{name:'포켓 퐁 오른쪽 이동'}),b=await right.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.clock.runFor(250);await page.mouse.up();
  expect(Number(await board.getAttribute('data-action-position'))).toBeGreaterThan(left);await pauseRestart(page,board);
 });
 test(`flappy lifts on keyboard and touch, then can pause and restart at ${width}px`,async({page})=>{
  await open(page,'flappy',width);const board=page.locator('.action-board');await page.clock.runFor(200);
  const initial=Number(await board.getAttribute('data-action-position'));await board.press('Space');await page.clock.runFor(150);
  expect(Number(await board.getAttribute('data-action-position'))).toBeLessThan(initial);
  await page.getByRole('button',{name:'플래피 산책 날갯짓',exact:true}).click();await page.clock.runFor(100);
  await board.click();await page.clock.runFor(100);await pauseRestart(page,board);
 });
 test(`rhythm scores timed keyboard and screen hits, mutes, pauses and restarts at ${width}px`,async({page})=>{
  await open(page,'rhythm',width);const board=page.locator('.action-board');
  await page.clock.runFor(1950);await board.press('a');await page.clock.runFor(150);await expect(board).toHaveAttribute('data-action-hits','1');
  await page.clock.runFor(650);const b=await board.boundingBox();await page.mouse.click(b.x+b.width/6,b.y+b.height*.85);await page.clock.runFor(150);await expect(board).toHaveAttribute('data-action-hits','2');
  await page.getByRole('button',{name:'효과음 끄기',exact:true}).click();await expect(page.getByRole('button',{name:'효과음 켜기',exact:true})).toBeVisible();
  await pauseRestart(page,board);await expect(board).toHaveAttribute('data-action-hits','0');
 });
}
