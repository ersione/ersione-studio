export const LIGHTING_STORAGE_KEY='studio-lighting-mode';
export const normalizeLightingMode=value=>['auto','day','night'].includes(value)?value:'auto';
// Date#getHours intentionally uses the visitor device's local timezone.
export const isLocalNight=(date=new Date())=>date.getHours()<7||date.getHours()>=19;
export const resolveLighting=(mode,date=new Date())=>mode==='night'||(normalizeLightingMode(mode)==='auto'&&isLocalNight(date));
