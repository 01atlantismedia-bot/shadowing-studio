export function parseSubtitles(text) {
 const timestamp = value => {
  const parts=value.replace(',', '.').split(':').map(Number);
  if(parts.length<2||parts.length>3||parts.some(n=>!Number.isFinite(n)||n<0)) return NaN;
  return parts.reduce((sum,n)=>sum*60+n,0);
 };
 const items=[];
 for(const block of text.replace(/\r/g,'').split(/\n\s*\n/)) {
  const rows=block.trim().split('\n');
  const index=rows.findIndex(row=>row.includes('-->'));
  if(index<0)continue;
  const match=rows[index].match(/([\d:.,]+)\s*-->\s*([\d:.,]+)/);
  if(!match)continue;
  const start=timestamp(match[1]),end=timestamp(match[2]);
  const words=rows.slice(index+1).join(' ').replace(/<[^>]*>/g,'').trim();
  if(Number.isFinite(start)&&end>start&&words)items.push({start,duration:end-start,text:words});
 }
 return items.sort((a,b)=>a.start-b.start);
}
