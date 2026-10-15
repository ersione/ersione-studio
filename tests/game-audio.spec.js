import {test,expect} from '@playwright/test';
test('every game exposes one shared sound setting that survives switching and reload',async({page})=>{
 await page.addInitScript(()=>{window.soundCalls=0;const create=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){window.soundCalls++;return create.call(this);};});
 await page.goto('/');await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();
 await page.getByRole('button',{name:'효과음 끄기',exact:true}).click();
 for(let pack=0;pack<2;pack++){
  const ids=await page.locator('.arcade-card').evaluateAll(cards=>cards.map(c=>c.dataset.game));expect(ids).toHaveLength(6);
  for(const id of ids){await page.locator(`[data-game="${id}"]`).click();await expect(page.getByRole('button',{name:'효과음 켜기',exact:true})).toBeVisible();
   if(await page.getByRole('button',{name:'게임 시작',exact:true}).count())await page.getByRole('button',{name:'게임 시작',exact:true}).click();
   await page.getByRole('button',{name:'← 게임 목록',exact:true}).click();}
  if(pack===0)await page.getByRole('button',{name:'다음 게임 목록',exact:true}).click();
 }
 expect(await page.evaluate(()=>window.soundCalls)).toBe(0);
 await page.getByRole('button',{name:'효과음 켜기',exact:true}).click();expect(await page.evaluate(()=>window.soundCalls)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'효과음 끄기',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();await expect(page.getByRole('button',{name:'효과음 켜기',exact:true})).toBeVisible();
});
