import {useEffect,useState} from 'react';
export function useAutoPause(){
  const [paused,setPaused]=useState(false);
  useEffect(()=>{const pause=()=>setPaused(true),visibility=()=>{if(document.hidden)pause();};window.addEventListener('blur',pause);document.addEventListener('visibilitychange',visibility);return()=>{window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',visibility);};},[]);
  return [paused,setPaused];
}
export const directionKey=key=>({ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'})[key];
