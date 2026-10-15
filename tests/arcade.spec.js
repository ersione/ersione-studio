import {test,expect} from '@playwright/test';

test('console opens game library and every game can return to the library',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('heading',{name:'오늘은 무슨 게임 할까요?'})).toBeVisible();
  await expect(page.getByLabel('12가지 게임이 담긴 멀티게임팩')).toBeVisible();
  await dialog.getByRole('button',{name:/블록 쌓기/}).focus();await page.keyboard.press('ArrowDown');
  await expect(dialog.getByRole('button',{name:/타이밍에 맞춰 톡/})).toBeFocused();
  await page.keyboard.press('Enter');await expect(dialog.getByRole('heading',{name:'리듬 탭',exact:true})).toBeVisible();
  await dialog.getByRole('button',{name:'← 게임 목록'}).click();
  for(const [name,heading] of [['블록 쌓기','블록 쌓기'],['리듬 탭','리듬 탭'],['카드 맞추기','작은 기억 게임']]){
    const card=dialog.getByRole('button',{name:new RegExp(name)});await card.click();
    await expect(dialog.getByRole('heading',{name:heading,exact:true})).toBeVisible();
    await dialog.getByRole('button',{name:'← 게임 목록',exact:true}).click();await expect(card).toBeFocused();
  }
  await page.keyboard.press('Escape');expect(errors).toEqual([]);
});
