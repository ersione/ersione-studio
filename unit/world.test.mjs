import test from 'node:test';
import assert from 'node:assert/strict';
import {canStand,movePlayer,roomAt,rooms} from '../src/house-world.js';
test('all room entrances are walkable',()=>{for(const r of rooms){assert.ok(canStand(...r.spawn),r.id);assert.equal(roomAt(...r.spawn),r.id);}});
test('doors connect study and kitchen to living room',()=>{
 assert.ok(movePlayer({x:-2.65,z:1},0,-2).z<0);
 assert.ok(movePlayer({x:3,z:.8},0,-1.2).z<0);
 assert.ok(movePlayer({x:-2,z:-2.7},2,0).x>-.5);
});
test('walls and furniture block even a very large step',()=>{
 const wall=movePlayer({x:-5,z:1},0,-4);assert.ok(wall.z>.25);
 const table=movePlayer({x:-3.6,z:-2.7},0,-3);assert.ok(table.z> -3.1);
 const edge=movePlayer({x:.5,z:2},100,0);assert.ok(edge.x<6.6);
});
test('diagonal movement slides along a wall and never enters the obstacle',()=>{
 const next=movePlayer({x:-5,z:.5},.6,-1);assert.ok(next.x> -4.5);assert.ok(canStand(next.x,next.z));assert.ok(next.z>.25);
});
