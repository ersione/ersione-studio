import test from 'node:test';
import assert from 'node:assert/strict';
import {newAction,actionInput,snakeTick,tickAction} from '../src/action-games.js';

test('snake grows when eating, refuses reversal, and ends on wall or body',()=>{
  const s=newAction('snake',()=>0);s.food={x:9,y:10};actionInput(s,'left');assert.equal(s.nextDir,'right');snakeTick(s,()=>0);assert.equal(s.snake.length,4);assert.equal(s.score,10);
  s.snake=[{x:15,y:3},{x:14,y:3}];snakeTick(s);assert.equal(s.status,'over');
  const body=newAction('snake');body.snake=[{x:2,y:2},{x:2,y:3},{x:3,y:3},{x:3,y:2},{x:4,y:2}];snakeTick(body);assert.equal(body.status,'over');
});
test('snake can step into its vacated tail cell',()=>{
  const s=newAction('snake');s.snake=[{x:2,y:2},{x:2,y:3},{x:3,y:3},{x:3,y:2}];s.food={x:0,y:0};snakeTick(s);assert.equal(s.status,'running');
});
test('breakout bounces off paddle, scores a brick, loses lives and clears the final stage',()=>{
  const s=newAction('breakout');s.serve=0;s.ball={x:160,y:355,vx:0,vy:200};tickAction(s,.03);assert.ok(s.ball.vy<0);
  s.bricks=[{x:140,y:44,w:44,h:16}];s.ball={x:160,y:65,vx:0,vy:-160};tickAction(s,.03);assert.equal(s.score,20);assert.equal(s.level,2);
  s.level=3;s.serve=0;s.bricks=[{x:140,y:44,w:44,h:16}];s.ball={x:160,y:65,vx:0,vy:-160};tickAction(s,.03);assert.equal(s.status,'won');
  const lost=newAction('breakout');lost.serve=0;lost.lives=1;lost.ball.y=412;lost.ball.vy=160;tickAction(lost,.03);assert.equal(lost.status,'over');
});
test('shooter hits enemies, changes waves, and does not deduct multiple lives during grace period',()=>{
  const s=newAction('shooter');s.shotWait=1;s.enemies=[{x:160,y:100,hp:1,id:0}];s.shots=[{x:160,y:105}];tickAction(s,.01);assert.equal(s.score,100);assert.equal(s.level,2);
  s.bullets=[{x:s.x,y:350}];tickAction(s,.01);assert.equal(s.lives,2);s.bullets=[{x:s.x,y:350}];tickAction(s,.01);assert.equal(s.lives,2);
  s.level=3;s.enemies=[];tickAction(s,.01);assert.equal(s.status,'won');
});
test('racer stays within lanes, handles collisions and can complete sixty seconds',()=>{
  const s=newAction('racer');for(let i=0;i<4;i++)actionInput(s,'left');assert.equal(s.lane,0);for(let i=0;i<5;i++)actionInput(s,'right');assert.equal(s.lane,2);
  s.cars=[{lane:2,y:333}];tickAction(s,.01);assert.equal(s.lives,2);assert.equal(s.cars.length,0);
  s.time=59.99;s.distance=100;s.cars=[];tickAction(s,.02);assert.equal(s.status,'won');assert.ok(s.score>0);
  const lost=newAction('racer');lost.lives=1;lost.cars=[{lane:1,y:333}];tickAction(lost,.01);assert.equal(lost.status,'over');const time=lost.time;tickAction(lost,.03);assert.equal(lost.time,time);
});
