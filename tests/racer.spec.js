import {test,expect} from '@playwright/test';

test('parking in the middle cannot finish, speed rises, pause freezes progress, and restart resets the race',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  await page.goto('/');await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();
  await page.getByRole('button',{name:'다음 게임 목록'}).click();await page.locator('[data-game="racer"]').click();
  await page.getByRole('button',{name:'게임 시작',exact:true}).click();
  const board=page.locator('[data-action-kind="racer"]'),status=page.getByRole('dialog').getByRole('status');
  await expect(board).toHaveAttribute('data-action-position','1');await expect(board).toHaveAttribute('data-racer-lives','3');
  const initial=Number(await board.getAttribute('data-racer-speed'));
  await page.clock.runFor(4500);expect(Number(await board.getAttribute('data-racer-speed'))).toBeGreaterThan(initial);
  await page.keyboard.press('p');await expect(status).toHaveText('일시정지');
  const time=await board.getAttribute('data-action-time'),speed=await board.getAttribute('data-racer-speed');
  await page.clock.runFor(2000);await expect(board).toHaveAttribute('data-action-time',time);await expect(board).toHaveAttribute('data-racer-speed',speed);
  await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.clock.runFor(22000);
  await expect(board).toHaveAttribute('data-action-status','over');await expect(board).toHaveAttribute('data-racer-lives','0');
  await expect(status).toHaveText('게임 종료');
  await page.screenshot({path:'test-results/racing-stationary-over.png'});
  await page.getByRole('button',{name:'다시 시작',exact:true}).click();await expect(board).toHaveAttribute('data-racer-lives','3');await expect(board).toHaveAttribute('data-racer-speed','144.0');
  await page.keyboard.press('ArrowLeft');await expect(board).toHaveAttribute('data-action-position','0');
  await page.clock.runFor(1400);await page.screenshot({path:'test-results/racing-updated-mobile.png'});
});
