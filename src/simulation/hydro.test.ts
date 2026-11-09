import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,advance,sanitize,setFlow,setProgress,sampleRoute,routeParts,routeStage,stages,canPlay,gateOpening,gateLip,sheetDepth,reachable,spillwayFraction,spillwayCubicMeters,GATE,CREST_Y,WATER_LEVEL,SPILL_Z,SPILL_GATE_T,SKI_JUMP_LIP,SPILLWAY_CAPACITY,FLOOD_PEAK} from './hydro.ts';
import {spillwayMarks,compareFlow,formatFlow} from '../content/spillway.ts';
import {routeStatus} from '../ui/status.ts';
test('geração e vertedouro têm controles independentes',()=>{
 let s=initialState();s=setFlow(s,'generation',0);const n=advance(s,.1,true,true);assert.equal(n.generationProgress,s.generationProgress);assert.equal(n.rotorAngle,s.rotorAngle);assert.ok(n.spillwayProgress>s.spillwayProgress);
 s=setFlow(initialState(),'spillway',0);const g=advance(s,.1,true,true);assert.ok(g.generationProgress>s.generationProgress);assert.equal(g.spillwayProgress,s.spillwayProgress);assert.ok(g.rotorAngle>s.rotorAngle);
});
test('pausa, visibilidade, limite de passo e reset determinístico',()=>{
 const s=initialState();assert.deepEqual(advance(s,1,false,true),s);assert.deepEqual(advance(s,1,true,false),s);assert.deepEqual(advance(s,100,true,true),advance(s,.1,true,true));assert.deepEqual(initialState(),s);
 const n=advance({...s,generationProgress:.999,spillwayProgress:.999,rotorAngle:Math.PI*2-.01},.1,true,true);assert.ok(n.generationProgress<1&&n.spillwayProgress<1&&n.rotorAngle<Math.PI*2);
});
test('sem vazão não há o que tocar: o play fica indisponível e o painel explica',()=>{
 const zero=setFlow(setFlow(initialState(),'generation',0),'spillway',0);
 assert.equal(canPlay(zero),false);assert.deepEqual(advance(zero,.1,true,true),zero);assert.match(routeStatus(zero,'spillway'),/zero/);
 assert.equal(canPlay(setFlow(zero,'spillway',.01)),true);
 assert.match(routeStatus(setFlow(initialState(),'spillway',0),'spillway'),/Comporta fechada/);
 assert.match(routeStatus(setFlow(initialState(),'generation',0),'generation'),/zero/);
});
test('vazão ilustrativa da geração não inventa RPM proporcional nem deixa NaN entrar',()=>{
 const low=advance(setFlow(initialState(),'generation',.25),.1,true,true),high=advance(setFlow(initialState(),'generation',1),.1,true,true);assert.equal(low.rotorAngle,high.rotorAngle);
 for(const value of [NaN,Infinity,-Infinity,-1,9]){const s=sanitize({generationFlow:value,spillwayFlow:value,generationProgress:value,spillwayProgress:value,rotorAngle:value});assert.ok(Object.values(s).every(Number.isFinite));assert.ok(s.generationFlow>=0&&s.generationFlow<=1);}
});
test('rotas hidráulicas são contínuas, vertedouro não passa pela turbina e gerador não recebe água',()=>{
 assert.ok(!routeParts('spillway').includes('turbine'));assert.ok(!routeParts('generation').includes('generator'));
 for(const route of ['generation','spillway'] as const){let previous=sampleRoute(route,0);for(let i=1;i<=500;i++){const p=sampleRoute(route,i/500);assert.ok(Math.hypot(p.x-previous.x,p.y-previous.y,p.z-previous.z)<.3);if(route==='spillway')assert.ok(Math.abs(p.z-SPILL_Z)<.01);previous=p;}assert.ok(sampleRoute(route,0).y>sampleRoute(route,1).y);}
 const a=sampleRoute('generation',0),b=sampleRoute('generation',1);assert.ok(a.x<b.x);
});
test('a água sai de dentro do reservatório, abaixo da superfície',()=>{
 for(const route of ['generation','spillway'] as const)for(let i=0;i<=300;i++){const p=sampleRoute(route,i/300);if(p.x<-1.9)assert.ok(p.y<WATER_LEVEL-.3,`${route} acima do lago em x=${p.x.toFixed(2)}`);}
});
test('comporta de segmento: fechada sem vazão, abre conforme a vazão e a água passa por baixo dela',()=>{
 assert.equal(gateOpening(0),0);const closed=gateLip(0);assert.ok(Math.abs(closed.y-CREST_Y)<.01,'lábio fechado assenta na soleira');
 let previous=0;for(let f=.05;f<=1.0001;f+=.05){const open=gateOpening(f);assert.ok(open>previous);previous=open;
  const lip=gateLip(open);let under=Infinity;for(let i=0;i<=800;i++){const p=sampleRoute('spillway',i/800);if(Math.abs(p.x-lip.x)<.03)under=Math.min(under,lip.y-p.y);}
  assert.ok(under>.07+.01,`partícula raspa o lábio com vazão ${f.toFixed(2)}`);assert.ok(sheetDepth(f)<lip.y-CREST_Y-.05,'lâmina passa sob o lábio');}
 assert.ok(gateOpening(1)<=GATE.maxOpen+1e-9);
 assert.ok(sheetDepth(0)===0&&sheetDepth(.2)<sheetDepth(1));
});
test('com a comporta fechada o marcador para antes dela',()=>{
 const near=(a:number,b:number,m?:string)=>assert.ok(Math.abs(a-b)<1e-9,m);
 const closed=setFlow(initialState(),'spillway',0);
 const s=setProgress(closed,'spillway',.9);near(s.spillwayProgress,SPILL_GATE_T);assert.equal(reachable(closed,'spillway',.9),SPILL_GATE_T);
 const stop=sampleRoute('spillway',SPILL_GATE_T),plateUpstream=GATE.trunnion[0]-GATE.radius;assert.ok(stop.x+.16<plateUpstream,'marcador encosta na comporta fechada');
 const beyond=setFlow(setProgress(initialState(),'spillway',.6),'spillway',0);near(beyond.spillwayProgress,SPILL_GATE_T,'fechar a comporta recolhe o marcador');
 near(setProgress(initialState(),'spillway',.6).spillwayProgress,.6);
});
test('trampolim lança a água para cima antes de cair no rio',()=>{
 let peak=-Infinity;for(let i=0;i<=500;i++){const p=sampleRoute('spillway',i/500);if(p.x>SKI_JUMP_LIP.x)peak=Math.max(peak,p.y);}
 assert.ok(peak>SKI_JUMP_LIP.y+.1);assert.ok(sampleRoute('spillway',1).y<SKI_JUMP_LIP.y-.8);
});
test('etapas em ordem e nomes certos em cada trecho',()=>{
 for(const route of ['generation','spillway'] as const){const list=stages[route];list.forEach((s,i)=>{if(i)assert.ok(s.start>list[i-1]!.start);assert.equal(routeStage(route,s.start+.005),s.name);});}
 assert.equal(routeStage('spillway',SPILL_GATE_T),'Comporta de segmento');
});
test('vazões do vertedouro com fonte batem com o controle e com a conta',()=>{
 for(const m of spillwayMarks)assert.equal(spillwayCubicMeters(spillwayFraction(m.flow)),m.flow);
 assert.equal(spillwayCubicMeters(initialState().spillwayFlow),FLOOD_PEAK);assert.equal(spillwayMarks.at(-1)!.flow,SPILLWAY_CAPACITY);
 assert.deepEqual(compareFlow(12_600,SPILLWAY_CAPACITY),{percent:20,falls:8.4});assert.deepEqual(compareFlow(62_200,SPILLWAY_CAPACITY),{percent:100,falls:41.5});
 assert.equal(formatFlow(12_600).replace(/\s/g,' '),'12.600 m³/s');
});
