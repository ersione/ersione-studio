import {test,expect} from '@playwright/test';
async function prepare(page,{fallback=true,time='2026-10-16T06:59:50Z'}={}){
 if(fallback)await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};});
 await page.clock.install({time:new Date(time)});await page.goto('/');await expect(page.locator('.room canvas')).toBeVisible();
}
async function lighting(page,night){await expect(page.locator('main')).toHaveAttribute('data-dark',String(night));await expect(page.locator('.room canvas')).toHaveAttribute('data-lighting',night?'night':'day');}
test.use({timezoneId:'UTC'});
for(const fallback of [false,true])test(`automatic boundaries and saved manual/auto modes apply to scene (fallback=${fallback})`,async({page})=>{
 await prepare(page,{fallback});const select=page.getByLabel('작업실 조명',{exact:true});await expect(select).toHaveValue('auto');await lighting(page,true);
 await page.clock.fastForward(10_000);await lighting(page,false);
 await select.selectOption('night');await lighting(page,true);await page.reload();await expect(select).toHaveValue('night');await lighting(page,true);
 await select.selectOption('day');await page.clock.setSystemTime(new Date('2026-10-16T20:00:00Z'));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await lighting(page,false);
 await select.selectOption('auto');await lighting(page,true);await page.reload();await expect(select).toHaveValue('auto');await lighting(page,true);
 await page.clock.setSystemTime(new Date('2026-10-17T18:59:50Z'));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await lighting(page,false);await page.clock.fastForward(70_000);await lighting(page,true);
});
test('returning to a visible tab refreshes the device time',async({page})=>{
 await prepare(page,{time:'2026-10-16T12:00:00Z'});await lighting(page,false);await page.clock.setSystemTime(new Date('2026-10-16T22:00:00Z'));
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await lighting(page,true);
});
for(const [zone,night] of [['Asia/Seoul',false],['Pacific/Honolulu',true]])test(`auto follows visitor timezone ${zone}`,async({browser})=>{
 const context=await browser.newContext({timezoneId:zone});const page=await context.newPage();await prepare(page,{time:'2026-10-16T06:00:00Z'});await lighting(page,night);await context.close();
});
for(const width of [320,390])test(`shared links, controls and dark dialogs fit ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});await prepare(page,{time:'2026-10-16T12:00:00Z'});
 const nav=page.getByRole('navigation',{name:'사이트 바로가기'});
 for(const [name,url] of [['Main','https://ersione.com/'],['Studio','https://studio.ersione.com/'],['Resume','https://resume.ersione.com/'],['Blog','https://blog.ersione.com/']])await expect(nav.getByRole('link',{name,exact:true})).toHaveAttribute('href',url);
 await expect(nav.getByRole('link',{name:'Studio',exact:true})).toHaveAttribute('aria-current','page');
 for(const mode of ['day','night']){
  await page.getByLabel('작업실 조명',{exact:true}).selectOption(mode);await lighting(page,mode==='night');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/studio-${mode}-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:/Company Lens 데이터/}).click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await expect(dialog.locator('.eds-button')).toHaveCount(3);await page.screenshot({path:`test-results/studio-dialog-${mode}-${width}.png`});await page.keyboard.press('Escape');
 }
});
