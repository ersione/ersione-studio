import {test,expect} from '@playwright/test';

async function openBlocks(page){
  await page.goto('/');
  await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();
  await page.getByRole('button',{name:/블록 쌓기/}).click();
  await page.getByRole('button',{name:'게임 시작',exact:true}).click();
}
test('blocks play with keyboard, pause, resume, restart, and stop house movement',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await openBlocks(page);
  const board=page.getByRole('img',{name:/블록 게임판/}),location=page.getByLabel('캐릭터 위치');
  const position=await location.getAttribute('data-player-x');
  await page.keyboard.press('ArrowUp');await page.keyboard.press('ArrowLeft');await page.keyboard.press('Space');
  await expect.poll(async()=>Number(await board.getAttribute('data-score'))).toBeGreaterThan(0);
  await page.keyboard.press('p');await expect(page.getByRole('dialog').getByRole('status')).toHaveText('일시정지');
  const score=await board.getAttribute('data-score');
  await page.keyboard.press('Space');await page.waitForTimeout(850);await expect(board).toHaveAttribute('data-score',score);
  await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.getByRole('button',{name:'블록 바로 내리기',exact:true}).click();
  await expect.poll(async()=>Number(await board.getAttribute('data-score'))).toBeGreaterThan(Number(score));
  await expect(location).toHaveAttribute('data-player-x',position);
  await page.getByRole('button',{name:'처음부터 ↻'}).click();await expect(board).toHaveAttribute('data-score','0');
  // Repeated hard drops end the round; a fresh round must be playable.
  for(let i=0;i<50;i++){if(await page.getByRole('dialog').getByRole('status').textContent()==='게임 종료')break;await page.keyboard.press('Space');}
  await expect(page.getByRole('dialog').getByRole('status')).toHaveText('게임 종료');
  await page.getByRole('button',{name:'다시 시작',exact:true}).click();await expect(board).toHaveAttribute('data-score','0');
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.getByRole('dialog').getByRole('status')).toHaveText('일시정지');
  await page.getByRole('button',{name:'← 게임 목록',exact:true}).click();await page.getByRole('button',{name:/카드 맞추기/}).click();await expect(page.locator('.game-grid button')).toHaveCount(8);
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();expect(errors).toEqual([]);
});
for(const width of [320,390])test(`blocks fit and touch controls work at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});await openBlocks(page);
  const board=page.locator('.block-board');
  await page.getByRole('button',{name:'블록 회전',exact:true}).click();
  await page.getByRole('button',{name:'블록 오른쪽 이동',exact:true}).click();
  await page.getByRole('button',{name:'블록 바로 내리기',exact:true}).click();
  await expect.poll(async()=>Number(await board.getAttribute('data-score'))).toBeGreaterThan(0);
  expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/blocks-${width}.png`});
});
