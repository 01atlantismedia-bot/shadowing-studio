import { getStore } from '@netlify/blobs';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { takes } from '../../db/schema.js';
export default async (req: Request, context: any) => {
 const headers = { 'Cache-Control': 'private, no-store' };
 let owner = context.cookies.get('studio_device');
 if (!owner || !/^[a-f0-9-]{36}$/.test(owner)) {
  owner = crypto.randomUUID();
  context.cookies.set({name:'studio_device',value:owner,httpOnly:true,secure:true,sameSite:'Strict',path:'/',maxAge:31536000});
 }
 const id = new URL(req.url).searchParams.get('id');
 const store = getStore('studio-audio');
 try {
 if (req.method === 'GET' && !id) return Response.json(await db.select().from(takes).where(eq(takes.owner,owner)).orderBy(desc(takes.createdAt)).limit(100),{headers});
 if (req.method === 'POST') {
  const form = await req.formData(); const audio = form.get('audio');
  const video = String(form.get('video') || ''); const phrase = String(form.get('phrase') || '').slice(0,2000);
  if (!(audio instanceof File) || audio.size === 0 || audio.size > 4_000_000 || !audio.type.startsWith('audio/') || !/^[\w-]{11}$/.test(video)) return Response.json({error:'Use an audio recording under 4 MB and a valid video.'},{status:400,headers});
  const key=crypto.randomUUID(); await store.set(key,await audio.arrayBuffer());
  try { const [take]=await db.insert(takes).values({id:key,owner,video,phrase,mime:audio.type}).returning(); return Response.json(take,{status:201,headers}); }
  catch(e){await store.delete(key); throw e;}
 }
 if(!id || !/^[a-f0-9-]{36}$/.test(id)) return new Response('Invalid recording',{status:400,headers});
 const condition=and(eq(takes.id,id),eq(takes.owner,owner));
 const [take]=await db.select().from(takes).where(condition);
 if(!take) return new Response('Not found',{status:404,headers});
 if(req.method==='GET') { const audio=await store.get(id,{type:'arrayBuffer'}); return audio ? new Response(audio,{headers:{...headers,'Content-Type':take.mime}}) : new Response('Audio unavailable',{status:404,headers}); }
 if(req.method==='PATCH') { const {rating}=await req.json(); if(!Number.isInteger(rating)||rating<1||rating>5) return new Response('Invalid rating',{status:400,headers}); await db.update(takes).set({rating}).where(condition); return Response.json({ok:true},{headers}); }
 if(req.method==='DELETE') {await store.delete(id);await db.delete(takes).where(condition);return Response.json({ok:true},{headers});}
 return new Response('Method not allowed',{status:405,headers});
 } catch {return Response.json({error:'Your recording library is unavailable. Please try again.'},{status:503,headers});}
};
