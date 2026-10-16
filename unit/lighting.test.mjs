import test from 'node:test';import assert from 'node:assert/strict';
import {isLocalNight,resolveLighting,normalizeLightingMode} from '../src/lighting.js';
test('local 07:00 is day and 19:00 is night, including exact boundaries',()=>{
 for(const [h,m,expected] of [[0,0,true],[6,59,true],[7,0,false],[12,0,false],[18,59,false],[19,0,true],[23,59,true]])assert.equal(isLocalNight(new Date(2026,9,16,h,m)),expected,`${h}:${m}`);
});
test('manual choices override the device clock; unknown saved values use auto',()=>{
 assert.equal(resolveLighting('day',new Date(2026,9,16,23)),false);assert.equal(resolveLighting('night',new Date(2026,9,16,12)),true);
 assert.equal(normalizeLightingMode(null),'auto');assert.equal(normalizeLightingMode('unexpected'),'auto');assert.equal(resolveLighting('unexpected',new Date(2026,9,16,23)),true);
});
