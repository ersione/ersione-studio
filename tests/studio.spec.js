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
