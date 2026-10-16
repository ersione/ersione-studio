import {useCallback,useEffect,useRef,useState} from 'react';
import {LIGHTING_STORAGE_KEY,normalizeLightingMode,resolveLighting} from './lighting.js';
export function useLighting(){
 // Keep the first browser render identical to prerendered HTML. Device time and
 // preferences are applied after hydration without a server/client markup mismatch.
 const [mode,setMode]=useState('auto'),[night,setNight]=useState(false),current=useRef('auto');
 const refresh=useCallback(()=>setNight(resolveLighting(current.current,new Date())),[]);
 const choose=useCallback(value=>{const next=normalizeLightingMode(value);current.current=next;setMode(next);try{localStorage.setItem(LIGHTING_STORAGE_KEY,next);}catch{}refresh();},[refresh]);
 useEffect(()=>{
  let restored='auto';try{restored=normalizeLightingMode(localStorage.getItem(LIGHTING_STORAGE_KEY));}catch{}
  current.current=restored;setMode(restored);
  let timer;const tick=()=>{refresh();timer=setTimeout(tick,60000-Date.now()%60000);};tick();
  const visible=()=>{if(!document.hidden)refresh();};
  const storage=e=>{if(e.key===LIGHTING_STORAGE_KEY){current.current=normalizeLightingMode(e.newValue);setMode(current.current);refresh();}};
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',visible);window.addEventListener('storage',storage);
  return()=>{clearTimeout(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visible);window.removeEventListener('storage',storage);};
 },[refresh]);
 return {mode,night,choose};
}
