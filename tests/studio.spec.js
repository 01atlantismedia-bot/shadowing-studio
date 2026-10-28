import { test, expect } from '@playwright/test';
const base='http://localhost:8889';
const phrases=[{start:1,duration:3,text:'A real phrase to practice.'},{start:6,duration:3,text:'Listen to the rhythm.'}];
test.beforeEach(async({page})=>{
 await page.route('**/www.youtube.com/**',route=>route.abort());
 await page.route('**/fonts.googleapis.com/**',route=>route.abort());
 await page.addInitScript(()=>{window.currentVideoTime=0;window.YT={Player:class {destroy(){} seekTo(t){window.currentVideoTime=t} getCurrentTime(){return window.currentVideoTime}getPlayerState(){return 1}getDuration(){return 600}playVideo(){}pauseVideo(){}setPlaybackRate(){}}}});
});
test('features one male and two female celebrity interviews and preserves themes during navigation',async({page})=>{
 await page.goto(base);
 await expect(page.locator('.lessons .lesson')).toHaveCount(3);
 await expect(page.locator('.lessons')).toContainText('Michael B. Jordan');
 await expect(page.locator('.lessons')).toContainText('Taylor Swift');
 await expect(page.locator('.lessons')).toContainText('Emma Stone');
 await page.getByRole('link',{name:'Choose appearance'}).click();
 await page.locator('[data-choice=forest]').click();
 await page.getByRole('link',{name:'Discover',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','forest');
});
test('automatically falls back to audio, appends the next section and synchronizes subtitles',async({page})=>{
 const requests=[];
 await page.route('**/.netlify/functions/transcript?*',r=>r.fulfill({status:422,json:{error:'Captions unavailable'}}));
 await page.route('**/.netlify/functions/transcribe',r=>{const body=r.request().postDataJSON();requests.push(body);return r.fulfill({json:{source:'ai',items:body.start===0?phrases:[{start:181,duration:4,text:'The next section of the interview.'}],partial:true,nextStart:body.start+180}})});
 await page.goto(base+'/studio?v=XnbCSboujF4');
 await expect(page.locator('.line')).toHaveCount(2);
 await expect(page.locator('#caption-status')).toContainText('AI generated');
 await page.evaluate(()=>window.currentVideoTime=6.5);
 await expect(page.locator('#subtitle')).toHaveText('Listen to the rhythm.');
 await expect(page.locator('#phrase')).toHaveText('Listen to the rhythm.');
 await page.locator('#next-clip').click();
 await expect(page.locator('.line')).toHaveCount(3);
 expect(requests.map(r=>r.start)).toEqual([0,180]);
 await expect(page.locator('#next-clip')).toContainText('6:00');
});
test('caption failure offers clip upload and timed subtitle import',async({page})=>{
 await page.route('**/.netlify/functions/transcript?*',r=>r.fulfill({status:422,json:{error:'Unavailable'}}));
 await page.route('**/.netlify/functions/transcribe',r=>r.fulfill({status:422,json:{error:'Upload a clip instead.'}}));
 await page.goto(base+'/studio?v=XnbCSboujF4');
 await expect(page.locator('#transcript-tools')).toHaveAttribute('open','');
 await expect(page.locator('#upload-transcript')).toBeVisible();
 await page.locator('#subtitle-file').setInputFiles({name:'interview.srt',mimeType:'text/plain',buffer:Buffer.from('1\n00:00:01,000 --> 00:00:03,000\nImported words.\n')});
 await expect(page.locator('.line')).toHaveCount(1);
 await expect(page.locator('#caption-status')).toContainText('Imported subtitles');
 await expect(page.locator('.line')).toContainText('0:01');
});
test('uses available captions without requesting AI',async({page})=>{
 let aiCalls=0;
 await page.route('**/.netlify/functions/transcript?*',r=>r.fulfill({json:{source:'captions',items:phrases,partial:false}}));
 await page.route('**/.netlify/functions/transcribe',r=>{aiCalls++;return r.abort()});
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/studio?v=BOQ-wZQhZZo');
 await expect(page.locator('.line')).toHaveCount(2);
 await expect(page.locator('#caption-status')).toContainText('YouTube captions');
 expect(aiCalls).toBe(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
