import {test,expect} from '@playwright/test';
test('generate house preview and social card',async({page})=>{
 test.skip(process.env.UPDATE_ASSETS!=='1','Explicit asset update only');
 await page.setViewportSize({width:1200,height:960});await page.goto('/');await expect(page.locator('canvas')).toBeVisible();await page.waitForTimeout(1200);
 await page.addStyleTag({content:'.house-toolbar,.player-hud,.movement-pad,.reset,.house-controls,.room-hint{visibility:hidden}'});
 await page.locator('canvas').screenshot({path:'public/room-preview.png'});
 await page.goto('/?capture=house');await page.waitForTimeout(600);await page.addStyleTag({content:'.house-toolbar,.player-hud,.movement-pad,.reset,.house-controls,.room-hint{visibility:hidden}'});await page.locator('canvas').screenshot({path:'public/house-base.png'});
 await page.setViewportSize({width:1200,height:630});await page.goto('/scripts/og-card.html');await page.locator('img').evaluate(img=>img.decode());await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'public/og-image.png'});
});
