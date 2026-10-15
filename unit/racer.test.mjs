import test from 'node:test';
import assert from 'node:assert/strict';
import {newAction,actionInput,tickAction,racerDifficulty} from '../src/action-games.js';

function seeded(seed){let value=seed;return ()=>((value=(Math.imul(value,1664525)+1013904223)>>>0)/4294967296);}

test('parking in any lane loses, including with constant randomness',()=>{
  for(const rng of [()=>0,()=>.999,seeded(7),seeded(91)])for(let lane=0;lane<3;lane++){
    const s=newAction('racer');s.lane=lane;
    for(let frame=0;frame<25*60&&s.status==='running';frame++)tickAction(s,1/60,{},rng);
    assert.equal(s.status,'over',`stationary lane ${lane}`);assert.equal(s.lives,0);
  }
});
test('late traffic moves over twice as fast and sends substantially more cars',()=>{
  function count(start){const s=newAction('racer');s.time=start;s.lives=999;
    for(let frame=0;frame<15*60;frame++)tickAction(s,1/60,{},()=>.5);
    return s.nextId;
  }
  assert.ok(racerDifficulty(59).speed>racerDifficulty(0).speed*2);
  assert.ok(racerDifficulty(59).interval<racerDifficulty(0).interval/2);
  assert.ok(count(45)>count(0)*3);
});
test('pair waves leave one open lane and change it even across bag boundaries',()=>{
  const s=newAction('racer');s.time=42;
  let lastSafe=null;
  for(let wave=0;wave<12;wave++){
    s.spawnWait=0;s.cars=[];tickAction(s,1/60,{},()=>0);
    assert.equal(s.cars.length,2);assert.equal(new Set(s.cars.map(c=>c.lane)).size,2);
    const safe=[0,1,2].find(lane=>!s.cars.some(c=>c.lane===lane));
    assert.notEqual(safe,lastSafe);lastSafe=safe;
  }
});
test('all generated rows remain avoidable with reaction time and two-step lane changes',()=>{
  for(let seed=1;seed<=50;seed++){
    const rng=seeded(seed),s=newAction('racer');let lastMove=-1;
    for(let frame=0;frame<=60*60&&s.status==='running';frame++){
      const front=s.cars.filter(c=>c.y>=100&&c.y<=380).sort((a,b)=>b.y-a.y)[0];
      if(front&&s.time-lastMove>=.18){
        const row=s.cars.filter(c=>c.wave===front.wave),free=[0,1,2].filter(lane=>!row.some(c=>c.lane===lane)).sort((a,b)=>Math.abs(a-s.lane)-Math.abs(b-s.lane));
        if(free[0]!==s.lane){actionInput(s,free[0]>s.lane?'right':'left');lastMove=s.time;}
      }
      tickAction(s,1/60,{},rng);
    }
    assert.equal(s.status,'won',`seed ${seed}`);assert.equal(s.lives,3,`seed ${seed}`);
  }
});
test('passing cars earns a bonus only once',()=>{
  const s=newAction('racer');s.cars=[{lane:0,y:379,wave:0,passed:false}];
  tickAction(s,.02);assert.equal(s.dodged,1);assert.ok(s.score>=25);
  tickAction(s,.02);assert.equal(s.dodged,1);
});
