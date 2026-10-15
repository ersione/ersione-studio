import {test,expect} from '@playwright/test';

const titles={snake:'스네이크',breakout:'벽돌 깨기',mines:'지뢰찾기',soko:'소코반',moles:'두더지 잡기',shooter:'별빛 슈팅',racer:'포켓 레이싱'};
async function openPack(page){await page.goto('/');await page.getByRole('button',{name:/잠깐, 쉬어가기/}).click();}
async function select(page,id){
  const card=page.locator(`[data-game="${id}"]`);
  if(!await card.count()){
    const next=page.getByRole('button',{name:'다음 게임 목록'});
    if(await next.isEnabled())await next.click();else await page.getByRole('button',{name:'이전 게임 목록'}).click();
  }
  await card.click();
}
async function freeze(page){await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));}

for(const width of [320,390])test(`12-in-1 library and all new games fit at ${width}px`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await openPack(page);
  await expect(page.getByLabel('12가지 게임이 담긴 멀티게임팩')).toBeVisible();
  const dialog=page.getByRole('dialog');
  expect(await dialog.evaluate(el=>el.scrollHeight<=el.clientHeight)).toBe(true);
  await page.screenshot({path:`test-results/pack-10-${width}.png`});
  for(const [id,title] of Object.entries(titles)){
    await select(page,id);await expect(dialog.getByRole('heading',{name:title,exact:true})).toBeVisible();
    expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await page.screenshot({path:`test-results/${id}-${width}.png`});
    await page.getByRole('button',{name:'← 게임 목록'}).click();await expect(page.locator(`[data-game="${id}"]`)).toBeFocused();
  }
  await select(page,'mines');await page.getByRole('button',{name:'← 게임 목록'}).click();await page.locator('[data-game="mines"]').focus();await page.keyboard.press('ArrowLeft');await expect(page.locator('[data-game="soko"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');await expect(page.locator('[data-game="blocks"]')).toBeFocused();
  expect(errors).toEqual([]);
});
test('mines first click is safe, mobile flags block reveals, and reset clears the board',async({page})=>{
  await openPack(page);await select(page,'mines');
  await page.locator('[data-cell="27"]').click();await expect(page.locator('[data-cell="27"]')).toHaveClass(/opened/);
  await expect(page.getByRole('dialog').getByRole('status')).not.toContainText('지뢰를 만났어요');
  const closed=page.locator('.mine-board button:not(.opened)').first(),cell=await closed.getAttribute('data-cell');
  await page.getByRole('button',{name:'칸 열기 모드',exact:true}).click();await closed.click();
  const flagged=page.locator(`[data-cell="${cell}"]`);await expect(flagged).toHaveClass(/flagged/);
  await page.getByRole('button',{name:'⚑ 깃발 모드',exact:true}).click();await flagged.click();await expect(flagged).not.toHaveClass(/opened/);
  await flagged.click({button:'right'});await expect(flagged).not.toHaveClass(/flagged/);
  await page.getByRole('button',{name:'다시 하기 ↻'}).click();await expect(page.locator('.mine-board .opened')).toHaveCount(0);
});
test('Sokoban can complete a stage, undo a push, advance and restart',async({page})=>{
  await openPack(page);await select(page,'soko');
  await expect(page.locator('.soko-board')).toBeFocused();await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('button',{name:'다음 스테이지 →'})).toBeVisible();
  await page.getByRole('button',{name:'한 수 되돌리기'}).click();await expect(page.locator('[data-soko-moves]')).toHaveAttribute('data-soko-moves','0');
  await page.getByRole('button',{name:'소코반 위쪽 이동'}).click();await page.getByRole('button',{name:'다음 스테이지 →'}).click();
  await expect(page.getByText('2/5',{exact:true})).toBeVisible();await page.keyboard.press('ArrowLeft');await expect(page.locator('[data-soko-moves]')).toHaveAttribute('data-soko-moves','1');
  await page.getByRole('button',{name:'이 판 다시 ↻'}).click();await expect(page.locator('[data-soko-moves]')).toHaveAttribute('data-soko-moves','0');
});
test('moles score once per appearance, pause their timer and finish a round',async({page})=>{
  await freeze(page);await openPack(page);await select(page,'moles');await page.getByRole('button',{name:'게임 시작',exact:true}).click();
  const hole=page.locator('.mole-hole.show'),name=await hole.getAttribute('aria-label');await hole.click();await expect(page.locator('[data-mole-score]')).toHaveText('10');
  await page.getByRole('button',{name:name.replace(' 나옴',''),exact:true}).click();await expect(page.locator('[data-mole-score]')).toHaveText('10');
  await page.clock.runFor(300);await page.getByRole('button',{name:'일시정지',exact:true}).click();const time=await page.locator('[data-mole-time]').textContent();
  await page.clock.runFor(3000);await expect(page.locator('[data-mole-time]')).toHaveText(time);
  await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.clock.runFor(31000);await expect(page.getByRole('dialog').getByRole('status')).toHaveText('게임 종료');
  await page.getByRole('button',{name:'다시 시작',exact:true}).click();await expect(page.locator('[data-mole-score]')).toHaveText('0');
});
for(const kind of ['snake','breakout','shooter','racer'])test(`${kind} moves, pauses, resets, and releases held touch controls`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});
  await freeze(page);await openPack(page);await select(page,kind);await page.getByRole('button',{name:'게임 시작',exact:true}).click();
  const board=page.locator(`[data-action-kind="${kind}"]`),initial=await board.getAttribute('data-action-position');
  if(kind==='snake')await page.keyboard.press('ArrowUp');
  else if(kind==='racer')await page.keyboard.press('ArrowLeft');
  else await page.keyboard.down('ArrowLeft');
  await page.clock.runFor(400);await page.keyboard.up('ArrowLeft');await expect(board).not.toHaveAttribute('data-action-position',initial);
  await page.screenshot({path:`test-results/playing-${kind}.png`});
  await page.keyboard.press('p');await expect(page.getByRole('dialog').getByRole('status')).toHaveText('일시정지');const time=await board.getAttribute('data-action-time');
  await page.clock.runFor(1500);await expect(board).toHaveAttribute('data-action-time',time);
  await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  if(['breakout','shooter'].includes(kind)){
    const button=page.getByRole('button',{name:`${titles[kind]} 오른쪽 이동`}),b=await button.boundingBox();
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.clock.runFor(200);await page.mouse.up();
    const released=await board.getAttribute('data-action-position');await page.clock.runFor(250);await expect(board).toHaveAttribute('data-action-position',released);
    // Dragging on the playfield steers the paddle or ship.
    const c=await board.boundingBox();await page.mouse.move(c.x+c.width*.3,c.y+c.height*.7);await page.mouse.down();await page.mouse.move(c.x+c.width*.7,c.y+c.height*.7);await page.clock.runFor(150);await page.mouse.up();
    await expect(board).not.toHaveAttribute('data-action-position',released);
  }
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.getByRole('dialog').getByRole('status')).toHaveText('일시정지');
  await page.getByRole('button',{name:'처음부터 ↻'}).click();await expect(board).toHaveAttribute('data-action-status','running');await expect(page.locator('[data-action-score]')).toHaveText('0');
  await page.getByRole('button',{name:'← 게임 목록'}).click();await page.clock.runFor(2000);await select(page,kind);await expect(page.getByRole('button',{name:'게임 시작',exact:true})).toBeVisible();expect(errors).toEqual([]);
});
