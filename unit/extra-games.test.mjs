import test from 'node:test';import assert from 'node:assert/strict';
import {newAction,actionInput,tickAction} from '../src/action-games.js';
test('pong returns the ball at an angle, awards points, ends at seven, and serves after a miss',()=>{
 const s=newAction('pong');s.serve=0;s.ball={x:175,y:356,vx:0,vy:200};tickAction(s,.02);assert.ok(s.ball.vy<0);assert.ok(s.ball.vx>0);
 s.ball.y=-11;tickAction(s,.01);assert.equal(s.points,1);assert.ok(s.serve>0);
 s.serve=0;s.ball.y=411;tickAction(s,.01);assert.equal(s.opponentScore,1);assert.equal(s.lives,6);
 s.points=6;s.serve=0;s.ball.y=-11;tickAction(s,.01);assert.equal(s.status,'won');
});
test('pong paddle obeys limits and opponent loss ends a round',()=>{
 const s=newAction('pong');for(let i=0;i<60;i++)tickAction(s,.05,{left:true});assert.equal(s.paddle,36);
 s.opponentScore=6;s.serve=0;s.ball={x:160,y:411,vx:0,vy:200};tickAction(s,.01);assert.equal(s.status,'over');
});
test('flappy flap lifts, passed pipes count once, and collisions end the flight',()=>{
 const s=newAction('flappy');actionInput(s,'flap');tickAction(s,.05);assert.ok(s.y<190);
 s.pipes=[{x:20,center:190,gap:136,passed:false}];tickAction(s,.01);assert.equal(s.score,1);tickAction(s,.01);assert.equal(s.score,1);
 s.pipes=[{x:80,center:300,gap:100,passed:false}];tickAction(s,.01);assert.equal(s.status,'over');
});
test('flappy difficulty rises, gates stay reachable, and the ground ends a round',()=>{
 const s=newAction('flappy');s.level=20;s.spawnWait=0;tickAction(s,.01,{},()=>1);assert.equal(s.pipes[0].gap,100);assert.equal(s.pipes[0].center,280);
 s.y=379;tickAction(s,.01);assert.equal(s.status,'over');
});
test('rhythm judges lane and timing, builds combos, rejects repeated notes and ends on misses',()=>{
 const s=newAction('rhythm');s.time=2;s.notes=[{lane:0,at:2},{lane:1,at:2.1}];actionInput(s,'hit0');assert.equal(s.score,100);assert.equal(s.combo,1);
 actionInput(s,'hit1');assert.equal(s.score,160);assert.equal(s.combo,2);actionInput(s,'hit1');assert.equal(s.combo,0);assert.equal(s.lives,4);
 for(let i=0;i<4;i++)actionInput(s,'hit2');assert.equal(s.status,'over');
});
test('rhythm missed notes are counted once and 45 seconds completes the song',()=>{
 const s=newAction('rhythm');s.notes=[{lane:1,at:0}];s.nextNote=99;s.time=.3;tickAction(s,.01);assert.equal(s.missed,1);tickAction(s,.01);assert.equal(s.missed,1);
 s.time=45.25;tickAction(s,.01);assert.equal(s.status,'won');
});
