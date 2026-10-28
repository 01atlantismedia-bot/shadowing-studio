export const CLIP_SECONDS = 180;
export function validateItems(raw, { start = 0, end = Infinity } = {}) {
 if (!Array.isArray(raw)) throw new Error('Invalid transcript');
 const items = raw.filter(r => r && typeof r.text === 'string' && r.text.trim() && Number.isFinite(r.start) && r.start >= start && r.start < end && Number.isFinite(r.duration) && r.duration > 0)
  .map(r => ({ start: r.start, duration: Math.min(r.duration, end - r.start, 30), text: r.text.trim().slice(0, 3000) }))
  .sort((a, b) => a.start - b.start);
 if (!items.length) throw new Error('No audible speech found');
 return items;
}
export function captionDivisor(xml) {
 return /<p\b[^>]*\bt="\d+"/.test(xml) ? 1000 : 1;
}
export function clipStart(value) {
 const start = Number(value ?? 0);
 if (!Number.isInteger(start) || start < 0 || start > 86400) throw new Error('Invalid clip start');
 return start;
}
