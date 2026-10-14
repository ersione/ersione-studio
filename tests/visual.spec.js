import {test,expect} from '@playwright/test';
test('desktop and mobile visual proofs',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('');await expect(page.locator('canvas')).toBeVisible();await page.waitForTimeout(1200);
 await page.screenshot({path:'test-results/desktop.png',fullPage:true});
 await page.addStyleTag({content:'.intro{visibility:hidden}.room-caption,.room-hint,.reset{visibility:hidden}'});
 await page.locator('canvas').screenshot({path:'test-results/room-preview.png'});
 await page.reload();await page.setViewportSize({width:390,height:844});await page.waitForTimeout(800);await page.screenshot({path:'test-results/mobile.png',fullPage:true});
});
