import React,{createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {Button} from '@ersione/design-system/react';
const AudioContextValue=createContext(null);
const patterns={select:[440],start:[330,440,660],move:[220],hit:[520],score:[660,880],miss:[160,110],win:[440,550,660,880],over:[330,220,110],note:[330]};
export function GameAudioProvider({children}){
 const [enabled,setEnabled]=useState(()=>{try{return localStorage.getItem('studio-game-sound')!=='off';}catch{return true;}});
 const enabledRef=useRef(enabled),audio=useRef(null),voices=useRef(new Set()),last=useRef({});
 const stop=useCallback(()=>{for(const voice of voices.current){try{voice.stop();}catch{}}voices.current.clear();},[]);
 const play=useCallback((type='hit',lane=0)=>{
  if(!enabledRef.current||document.hidden)return;
  const now=performance.now();if(now-(last.current[type]??-Infinity)<(type==='move'?70:40))return;last.current[type]=now;
  try{
   const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
   if(!audio.current)audio.current=new Context();const ctx=audio.current;if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   const notes=type==='note'?[[330,440,550][lane]]:patterns[type]||patterns.hit;
   notes.forEach((frequency,i)=>{const o=ctx.createOscillator(),gain=ctx.createGain(),at=ctx.currentTime+i*.065;o.type=type==='miss'||type==='over'?'triangle':'sine';o.frequency.value=frequency;gain.gain.setValueAtTime(.045,at);gain.gain.exponentialRampToValueAtTime(.001,at+.09);o.connect(gain);gain.connect(ctx.destination);voices.current.add(o);o.onended=()=>{voices.current.delete(o);o.disconnect();gain.disconnect();};o.start(at);o.stop(at+.1);});
  }catch{/* Audio support never blocks a game. */}
 },[]);
 const toggle=()=>{const next=!enabledRef.current;enabledRef.current=next;setEnabled(next);try{localStorage.setItem('studio-game-sound',next?'on':'off');}catch{}if(next)play('select');else stop();};
 useEffect(()=>{const visibility=()=>{if(document.hidden)stop();};window.addEventListener('blur',stop);document.addEventListener('visibilitychange',visibility);return()=>{window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',visibility);stop();audio.current?.close().catch(()=>{});};},[stop]);
 return <AudioContextValue.Provider value={{enabled,toggle,play,stop}}>{children}</AudioContextValue.Provider>;
}
export const useGameSound=()=>useContext(AudioContextValue);
export function SoundToggle(){const {enabled,toggle}=useGameSound();return <Button variant="secondary" size="sm" className="game-sound" aria-pressed={enabled} onClick={toggle}>{enabled?'효과음 끄기':'효과음 켜기'}</Button>;}
export function useGameFeedback({score=0,lives=0,won=false,over=false,paused=false}){
 const {play,stop}=useGameSound(),previous=useRef({score,lives,won,over,paused});
 useEffect(()=>{const p=previous.current;if(paused&&!p.paused)stop();if(won&&!p.won){stop();play('win');}else if(over&&!p.over){stop();play('over');}else if(!paused){if(lives<p.lives)play('miss');else if(score>p.score)play('score');}previous.current={score,lives,won,over,paused};},[score,lives,won,over,paused,play,stop]);
}
