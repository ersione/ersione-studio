import {test,expect} from '@playwright/test';

test('console opens game library and every game can return to the library',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('heading',{name:'오늘은 무슨 게임 할까요?'})).toBeVisible();
  await expect(page.getByLabel('10가지 게임이 담긴 멀티게임팩')).toBeVisible();
  await dialog.getByRole('button',{name:/블록 쌓기/}).focus();await page.keyboard.press('ArrowDown');
  await expect(dialog.getByRole('button',{name:/숫자를 합치는 퍼즐/})).toBeFocused();
  await page.keyboard.press('Enter');await expect(dialog.getByRole('heading',{name:'2048',exact:true})).toBeVisible();
  await dialog.getByRole('button',{name:'← 게임 목록'}).click();
  for(const [name,heading] of [['블록 쌓기','블록 쌓기'],['2048','2048'],['카드 맞추기','작은 기억 게임']]){
    const card=dialog.getByRole('button',{name:new RegExp(name)});await card.click();
    await expect(dialog.getByRole('heading',{name:heading,exact:true})).toBeVisible();
    await dialog.getByRole('button',{name:'← 게임 목록',exact:true}).click();await expect(card).toBeFocused();
  }
  await page.keyboard.press('Escape');expect(errors).toEqual([]);
});
for(const width of [320,390])test(`2048 supports keyboard, buttons, swipe, restart at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});await page.goto('/');
  await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();
  expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:`test-results/library-${width}.png`});
  await page.getByRole('button',{name:/숫자를 합치는 퍼즐/}).click();
  const board=page.locator('.number-board');
  await board.focus();await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowDown');
  await page.getByRole('button',{name:'숫자 오른쪽으로 밀기'}).click();
  const b=await board.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height*.8);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height*.2,{steps:5});await page.mouse.up();
  expect(await page.locator('.number-tile:not(.tile-0)').count()).toBeGreaterThanOrEqual(2);
  const dialog=page.getByRole('dialog');expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:`test-results/numbers-${width}.png`});
  await page.getByRole('button',{name:'다시 하기 ↻'}).click();await expect(page.locator('.number-tile:not(.tile-0)')).toHaveCount(2);
  await expect(page.locator('[data-number-score]')).toHaveAttribute('data-number-score','0');
});
