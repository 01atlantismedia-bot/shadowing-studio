import { YoutubeTranscript } from 'youtube-transcript';
import { captionDivisor, validateItems } from './lib/transcription.mjs';
export default async (req: Request) => {
 if(req.method !== 'GET') return new Response('Method not allowed',{status:405});
 const id=new URL(req.url).searchParams.get('id');
 if(!id || !/^[\w-]{11}$/.test(id)) return Response.json({error:'Enter a valid YouTube link.'},{status:400});
 try {
 let milliseconds=false;
 const captionFetch: typeof fetch = async (input, init) => {
  const response=await fetch(input,{...init,signal:AbortSignal.timeout(12000)});
  milliseconds=captionDivisor(await response.clone().text())===1000;
  return response;
 };
 const raw=await YoutubeTranscript.fetchTranscript(id,{lang:'en',fetch:captionFetch}).catch(()=>YoutubeTranscript.fetchTranscript(id,{fetch:captionFetch}));
 const divisor=milliseconds?1000:1;
 const items=validateItems(raw.map(r=>({start:r.offset/divisor,duration:r.duration/divisor,text:r.text})));
 if(!items.length) throw new Error('empty');
 return Response.json({items,source:'captions',partial:false},{headers:{'Cache-Control':'public, max-age=3600'}});
 } catch {return Response.json({error:'YouTube captions are unavailable. Audio transcription can create a transcript instead.'},{status:422});}
};
