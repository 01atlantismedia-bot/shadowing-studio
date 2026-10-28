export interface TranscriptItem {start:number;duration:number;text:string}
export const CLIP_SECONDS: number;
export function validateItems(raw: unknown, options?: {start?:number;end?:number}): TranscriptItem[];
export function captionDivisor(xml:string):number;
export function clipStart(value:unknown):number;
