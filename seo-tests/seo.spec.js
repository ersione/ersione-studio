import {test,expect} from '@playwright/test';

test('initial HTML exposes portfolio, links and truthful structured data',async({request})=>{
 const response=await request.get('/');expect(response.status()).toBe(200);const html=await response.text();
 expect(html).toContain('<main');expect(html).toContain('Louis Kim');expect(html).toContain('공개 고용 데이터를 통해');
 expect(html).toContain('href="https://pogo.ersione.com"');expect(html).toContain('href="https://companylens.ersione.com"');
 expect(html).not.toContain('https://github.com/ersione/pogo-atlas-web');
 expect((html.match(/rel="canonical"/g)||[]).length).toBe(1);
 expect(html).toContain('content="index,follow,max-image-preview:large"');
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 const person=schema['@graph'].find(item=>item['@type']==='Person');expect(person.name).toBe('Louis Kim');expect(person.sameAs).toContain('https://github.com/ersione');
 const webPage=schema['@graph'].find(item=>item['@type']==='WebPage');expect(webPage.about['@id']).toBe(person['@id']);expect(webPage.url).toBe('https://studio.ersione.com/');expect(webPage.primaryImageOfPage.url).toBe('https://studio.ersione.com/og-image.png');
});
test('portfolio stays readable without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4177/');await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page.getByAltText('거실, 작업방, 주방, 휴식방으로 이어지는 Ersione의 작은 집')).toBeVisible();
 await page.getByText('작업실과 프로젝트 소개',{exact:true}).click();await expect(page.getByRole('link',{name:'Company Lens 서비스 둘러보기 ↗'})).toBeVisible();await expect(page.getByRole('heading',{name:'PogoAtlas',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/seo-no-js.png',fullPage:true});await context.close();
});
test('prerendered page hydrates once and retains interactions',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/hydrat|Minified React error/i.test(m.text()))errors.push(m.text());});
 await page.goto('/');await expect(page.locator('.room canvas')).toBeVisible();await expect(page.locator('main')).toHaveCount(1);await expect(page.locator('.initial-house-preview')).toHaveCount(0);
 await page.getByRole('button',{name:'주방으로 이동',exact:true}).click();await expect(page.getByLabel('캐릭터 위치')).toHaveText('주방');
 await page.getByRole('button').filter({has:page.getByText('Company Lens',{exact:true})}).click();await expect(page.getByRole('dialog').getByRole('heading',{name:'Company Lens',exact:true})).toBeVisible();await page.keyboard.press('Escape');
 await page.getByText('작업실과 프로젝트 소개',{exact:true}).click();await expect(page.getByRole('link',{name:'Company Lens 서비스 둘러보기 ↗'})).toBeVisible();expect(errors).toEqual([]);
 await page.screenshot({path:'test-results/seo-hydrated.png',fullPage:true});
});
test('crawl controls list only real canonical pages',async({request})=>{
 const robots=await request.get('/robots.txt');expect(robots.status()).toBe(200);expect(await robots.text()).toContain('Allow: /');expect(await robots.text()).toContain('Sitemap: https://studio.ersione.com/sitemap.xml');
 const sitemap=await request.get('/sitemap.xml');expect(sitemap.status()).toBe(200);expect(sitemap.headers()['content-type']).toContain('xml');const xml=await sitemap.text();expect(xml).toContain('<loc>https://studio.ersione.com/</loc>');expect((xml.match(/<loc>/g)||[]).length).toBe(1);expect(xml).not.toContain('capture=');
 expect((await request.get('/missing-page-for-seo-check')).status()).toBe(404);
});
