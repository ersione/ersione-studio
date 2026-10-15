import {test,expect} from '@playwright/test';
import {games} from '../src/games.js';

test('Louis Kim identity and personal destinations remain accessible',async({page,request})=>{
 await page.goto('/');await expect(page.locator('.intro-copy')).toContainText('Louis Kim');
 const nav=page.getByRole('navigation',{name:'Louis Kim 바로가기'});
 for(const [name,url] of [['홈페이지','https://ersione.com'],['블로그','https://blog.ersione.com'],['이력서','https://resume.ersione.com'],['GitHub','https://github.com/ersione']])await expect(nav.getByRole('link',{name:new RegExp(name)})).toHaveAttribute('href',url);
 const html=await (await request.get('/')).text();expect(html).toContain('name="author" content="Louis Kim"');expect(html).toContain('Louis Kim이 만드는 작은 작업실');
});
for(const width of [320,390,1280])test(`console layout keeps all ten boards and controls accessible at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:width===1280?720:844});await page.goto('/');await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();
 const dialog=page.getByRole('dialog');
 const checkWidth=async()=>expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await checkWidth();expect((await dialog.boundingBox()).height).toBeLessThan(660);
 for(let i=0;i<games.length;i++){
  if(i===5)await page.getByRole('button',{name:'다음 게임 목록',exact:true}).click();
  const game=games[i];await dialog.locator('.arcade-card').filter({has:page.getByText(game.name,{exact:true})}).click();await checkWidth();
  const board=dialog.locator('.action-board,.number-board,.mine-board,.soko-board,.block-board');
  if(await board.count()){
   const b=await board.boundingBox();const ratio=game.id==='blocks'?10/18:['snake','breakout','shooter','racer'].includes(game.id)?4/5:1;
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
