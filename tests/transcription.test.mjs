import test from 'node:test';
import assert from 'node:assert/strict';
import { captionDivisor, validateItems, clipStart } from '../netlify/functions/lib/transcription.mjs';
import { parseSubtitles } from '../public/transcript-utils.js';
test('handles YouTube millisecond captions regardless of XML attribute order',()=>{
 assert.equal(captionDivisor('<p d="2345" t="1200"><s>Hello</s></p>'),1000);
 assert.equal(captionDivisor('<text start="1.2" dur="2.3">Hello</text>'),1);
});
test('keeps valid spoken phrases in the requested range and orders them',()=>{
 assert.deepEqual(validateItems([{start:182,duration:5,text:' Second '},{start:180,duration:2,text:'First'},{start:179,duration:2,text:'Outside'},{start:181,duration:-1,text:'Invalid'},{start:183,duration:2,text:''},{start:359,duration:5,text:'End'}],{start:180,end:360}),[{start:180,duration:2,text:'First'},{start:182,duration:5,text:'Second'},{start:359,duration:1,text:'End'}]);
 assert.throws(()=>validateItems([{start:NaN,duration:2,text:'Bad timing'}]));
});
test('rejects invalid requested clip times',()=>{
 assert.equal(clipStart(undefined),0);assert.equal(clipStart('180'),180);
 for(const value of [-1,Infinity,'invalid',1.5,86401])assert.throws(()=>clipStart(value));
});
test('imports SRT subtitles with sequence numbers and multiline speech',()=>{
 assert.deepEqual(parseSubtitles('1\r\n00:00:01,200 --> 00:00:03,500\r\nHello there.\r\nHow are you?\r\n\r\n2\r\n00:00:04,000 --> 00:00:05,000\r\nFine.'),[{start:1.2,duration:2.3,text:'Hello there. How are you?'},{start:4,duration:1,text:'Fine.'}]);
});
test('imports VTT settings and ignores empty or malformed cues',()=>{
 assert.deepEqual(parseSubtitles('WEBVTT\n\nNOTE description\n\nc1\n00:01.000 --> 00:02.500 align:start\n<v Interviewer>Hello.</v>\n\n00:03.000 --> 00:02.000\nInvalid\n\n00:04.000 --> 00:05.000\n'),[{start:1,duration:1.5,text:'Hello.'}]);
 assert.deepEqual(parseSubtitles('Not a subtitle file'),[]);
});
