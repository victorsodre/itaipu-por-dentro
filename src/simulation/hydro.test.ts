import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,advance,sanitize,setFlow,sampleRoute,routeParts} from './hydro.ts';
test('geração e vertedouro têm controles independentes',()=>{
 let s=initialState();s=setFlow(s,'generation',0);const n=advance(s,.1,true,true);assert.equal(n.generationProgress,s.generationProgress);assert.equal(n.rotorAngle,s.rotorAngle);assert.ok(n.spillwayProgress>s.spillwayProgress);
 s=setFlow(initialState(),'spillway',0);const g=advance(s,.1,true,true);assert.ok(g.generationProgress>s.generationProgress);assert.equal(g.spillwayProgress,s.spillwayProgress);assert.ok(g.rotorAngle>s.rotorAngle);
});
test('pausa, visibilidade, limite de passo e reset determinístico',()=>{
 const s=initialState();assert.deepEqual(advance(s,1,false,true),s);assert.deepEqual(advance(s,1,true,false),s);assert.deepEqual(advance(s,100,true,true),advance(s,.1,true,true));assert.deepEqual(initialState(),s);
 const n=advance({...s,generationProgress:.999,spillwayProgress:.999,rotorAngle:Math.PI*2-.01},.1,true,true);assert.ok(n.generationProgress<1&&n.spillwayProgress<1&&n.rotorAngle<Math.PI*2);
});
test('vazão ilustrativa não inventa RPM proporcional nem deixa NaN entrar',()=>{
 const low=advance(setFlow(initialState(),'generation',.25),.1,true,true),high=advance(setFlow(initialState(),'generation',1),.1,true,true);assert.equal(low.rotorAngle,high.rotorAngle);
 for(const value of [NaN,Infinity,-Infinity,-1,9]){const s=sanitize({generationFlow:value,spillwayFlow:value,generationProgress:value,spillwayProgress:value,rotorAngle:value});assert.ok(Object.values(s).every(Number.isFinite));assert.ok(s.generationFlow>=0&&s.generationFlow<=1);}
});
test('rotas hidráulicas são contínuas, vertedouro não passa pela turbina e gerador não recebe água',()=>{
 assert.ok(!routeParts('spillway').includes('turbine'));assert.ok(!routeParts('generation').includes('generator'));
 for(const route of ['generation','spillway'] as const){let previous=sampleRoute(route,0);for(let i=1;i<=500;i++){const p=sampleRoute(route,i/500);assert.ok(Math.hypot(p.x-previous.x,p.y-previous.y,p.z-previous.z)<.3);if(route==='spillway')assert.ok(p.z<-2);previous=p;}assert.ok(sampleRoute(route,0).y>sampleRoute(route,1).y);}
 const a=sampleRoute('generation',0),b=sampleRoute('generation',1);assert.ok(a.x<b.x);
});
