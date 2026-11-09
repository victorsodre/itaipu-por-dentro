import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {createModel,DIORAMA_BOUNDS,DEFAULT_DIRECTION,VIEW_FRAMES,visibleBounds} from './model.ts';import {applyHydro,particleCount} from './rig.ts';
import {initialState,advance,setFlow,sampleRoute,penstock,gateOpening,CREST_Y,WATER_LEVEL} from '../simulation/hydro.ts';
import {fit,framing,keepOrbit,orbitDirection} from './camera.ts';import {isTap} from './pointer.ts';
test('turbina e rotor giram juntos, estator permanece fixo e caminhos independentes',()=>{
 const m=createModel();try{const original=m.stator.rotation.toArray();let s=initialState();
 const turbineBounds=new T.Box3().setFromObject(m.parts.find(p=>p.id==='turbine')!.group),generatorBounds=new T.Box3().setFromObject(m.generatorRotor);
 for(let i=0;i<=300;i++){assert.equal(turbineBounds.containsPoint(sampleRoute('spillway',i/300)),false);assert.equal(generatorBounds.containsPoint(sampleRoute('generation',i/300)),false);}
 for(let i=0;i<20;i++){s=advance(s,.1,true,true);applyHydro(m,s,true,'compare','generation');assert.equal(m.turbineRotor.rotation.y,m.generatorRotor.rotation.y);assert.equal(m.shaftRotor.rotation.y,m.turbineRotor.rotation.y);assert.deepEqual(m.stator.rotation.toArray(),original);}
 s=setFlow(s,'generation',0);applyHydro(m,s,true,'compare','generation');assert.equal(m.particles.generation.visible,false);assert.equal(m.particles.spillway.visible,true);assert.equal(m.spillWater.visible,true);
 s=setFlow(s,'spillway',0);applyHydro(m,s,true,'compare','spillway');assert.equal(m.particles.spillway.visible,false);assert.equal(m.spillWater.visible,false);assert.equal(m.jetWater.visible,false);
 }finally{m.dispose();}
});
test('a comporta gira com a vazão e a lâmina, o jato e as marcas mudam de forma visível',()=>{
 const m=createModel();try{
  const look=(flow:number)=>{applyHydro(m,setFlow(initialState(),'spillway',flow),true,'compare','spillway');m.root.updateMatrixWorld(true);
   return {plate:new T.Box3().setFromObject(m.plate),sheet:new T.Box3().setFromObject(m.spillWater).getSize(new T.Vector3()).y,jet:new T.Box3().setFromObject(m.jetWater).getSize(new T.Vector3()).z,count:m.particles.spillway.count};};
  const closed=look(0);assert.equal(Math.abs(m.gate.rotation.z),0);assert.ok(closed.plate.min.y<CREST_Y+.02,'comporta fechada encosta na soleira');assert.ok(closed.plate.max.y>WATER_LEVEL,'comporta fechada segura o lago');
  const flood=look(.2),full=look(1);assert.equal(m.gate.rotation.z,-gateOpening(1));
  assert.ok(flood.plate.min.y>closed.plate.min.y+.3&&full.plate.min.y>flood.plate.min.y+.3,'o lábio sobe conforme a vazão');
  assert.ok(full.plate.min.y>WATER_LEVEL,'aberta por inteiro, a comporta sai da água');
  assert.ok(full.jet>flood.jet*1.5&&full.count>flood.count,'jato e marcas crescem');
  assert.ok(particleCount('spillway',1500/62200)>=6,'mesmo a vazão das Cataratas aparece');
 }finally{m.dispose();}
});
test('tomada submersa e trecho do conduto à vista fora da barragem',()=>{
 const m=createModel();try{
  let grid=new T.Box3();m.parts.find(p=>p.id==='intake')!.group.traverse(o=>{if(o instanceof T.Mesh){const b=new T.Box3().setFromObject(o);if(b.max.x<-1.4)grid=grid.union(b);}});
  assert.ok(!grid.isEmpty()&&grid.max.y<WATER_LEVEL,'grade da tomada abaixo da superfície');
  const faceY=(x:number)=>7.1-(x+.35)*7.1/3.95;let outside=0;
  for(let i=0;i<=100;i++){const p=penstock.getPointAt(i/100);if(p.x>-.35&&p.x<3.6&&(p.y-faceY(p.x))*Math.cos(Math.atan(7.1/3.95))>.4)outside++;}
  assert.ok(outside>=10&&outside<=60,`trecho exposto: ${outside} %`);
 }finally{m.dispose();}
});
test('corte, catálogo e pose de reset são reversíveis',()=>{
 const m=createModel();try{assert.equal(m.parts.length,7);const s=initialState();applyHydro(m,s,true,'compare','generation');m.root.updateMatrixWorld(true);const pose=m.generatorRotor.matrixWorld.toArray();
 const coils=m.stator.children.find(o=>o instanceof T.Group)!;assert.ok(coils.children.some(o=>o.visible),'o corte preserva as bobinas de trás');assert.ok(coils.children.some(o=>!o.visible),'o corte remove as bobinas da frente');
 m.applyCut(false);assert.ok(coils.children.every(o=>o.visible));assert.equal(m.spillOuter.visible,true);m.applyCut(true);assert.equal(m.spillOuter.visible,false);
 applyHydro(m,advance(s,.1,true,true),false,'spillway','spillway');assert.equal(m.outer.visible,true);applyHydro(m,s,true,'compare','generation');m.root.updateMatrixWorld(true);assert.equal(m.outer.visible,false);assert.deepEqual(m.generatorRotor.matrixWorld.toArray(),pose);assert.equal(m.routeLines.generation.visible,true);assert.equal(m.routeLines.spillway.visible,true);
 }finally{m.dispose();}
});
test('câmera enquadra diorama e grupos em formatos horizontal e vertical',()=>{
 const m=createModel();try{applyHydro(m,initialState(),true,'compare','generation');assert.ok(DIORAMA_BOUNDS.containsBox(new T.Box3().setFromObject(m.root)));const boxes=[DIORAMA_BOUNDS,...m.parts.map(p=>new T.Box3().setFromObject(p.group))];
 for(const bounds of boxes)for(const aspect of [1920/830,1080/1570,.7,2]){const c=new T.PerspectiveCamera(38,aspect,.1,400);fit(c,bounds,DEFAULT_DIRECTION);c.updateMatrixWorld();for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const p=new T.Vector3(x,y,z).project(c);assert.ok(Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z>-1&&p.z<1);}}
 }finally{m.dispose();}
});
test('na vista inicial, comporta, calha, turbina e gerador não ficam escondidos',()=>{
 const m=createModel();try{applyHydro(m,initialState(),true,'compare','spillway');m.root.updateMatrixWorld(true);
  const solids:T.Mesh[]=[];m.root.traverseVisible(o=>{if(o instanceof T.Mesh&&!(o instanceof T.InstancedMesh)&&o.parent!==m.helpers&&!(o.material as T.Material).transparent)solids.push(o);});
  const partOf=(o:T.Object3D|null)=>{while(o&&!o.userData.partId)o=o.parent;return o?.userData.partId;};
  const targets:[string,T.Vector3][]=[['spillway',m.plate.localToWorld(new T.Vector3(0,0,0)).clone()],['spillway',sampleRoute('spillway',.45)],['spillway',sampleRoute('spillway',.7)],['turbine',new T.Vector3(4.4,1.9,1.2)],['generator',new T.Vector3(4.4,4.5,2.4)]];
  for(const aspect of [2.7,1.15]){const c=new T.PerspectiveCamera(38,aspect,.1,400);fit(c,DIORAMA_BOUNDS,DEFAULT_DIRECTION);c.updateMatrixWorld();
   for(const [part,p] of targets){const hit=new T.Raycaster(c.position,p.clone().sub(c.position).normalize()).intersectObjects(solids,false).find(h=>!((h.object as T.Mesh).material as T.Material).clippingPlanes?.some(pl=>pl.distanceToPoint(h.point)<0));
    assert.ok(!hit||hit.distance>c.position.distanceTo(p)-.3||partOf(hit.object)===part,`${part} escondido por ${partOf(hit?.object??null)} (aspecto ${aspect})`);}}
 }finally{m.dispose();}
});
test('resize mantém a órbita do usuário e só ajusta a distância',()=>{
 const c=new T.PerspectiveCamera(38,2,.1,400),target=fit(c,DIORAMA_BOUNDS,DEFAULT_DIRECTION);
 c.position.copy(target).add(new T.Vector3(-14,3,9).setLength(c.position.distanceTo(target)*.7));// user orbit and zoom
 const direction=orbitDirection(c,target).normalize(),ratio=c.position.distanceTo(target)/framing(DIORAMA_BOUNDS,2,direction).distance;
 for(const aspect of [.6,1.15,2.7,2]){const previous=c.aspect;c.aspect=aspect;keepOrbit(c,target,DIORAMA_BOUNDS,previous);
  assert.ok(orbitDirection(c,target).normalize().distanceTo(direction)<1e-9,'direção preservada');
  assert.ok(Math.abs(c.position.distanceTo(target)/framing(DIORAMA_BOUNDS,aspect,direction).distance-ratio)<1e-9,'zoom relativo preservado');}
});
test('toque curto seleciona; arrasto, toque longo e pinça não',()=>{
 const start={x:100,y:100,time:0};
 assert.ok(isTap(start,{x:103,y:102,time:180}));assert.ok(!isTap(start,{x:120,y:100,time:150}));assert.ok(!isTap(start,{x:101,y:100,time:900}));
});
test('cada aba tem câmera própria que enquadra o seu percurso',()=>{
 const c=(view:'generation'|'spillway')=>{const cam=new T.PerspectiveCamera(38,1.6,.1,400);fit(cam,VIEW_FRAMES[view].bounds,VIEW_FRAMES[view].direction);cam.updateMatrixWorld();return cam;};
 for(const route of ['generation','spillway'] as const){const cam=c(route);
  for(let i=0;i<=50;i++){const p=sampleRoute(route,i/50);assert.ok(VIEW_FRAMES[route].bounds.containsPoint(p),`${route} fora da caixa`);const q=p.clone().project(cam);assert.ok(Math.abs(q.x)<1&&Math.abs(q.y)<1,`${route} fora do quadro`);}}
 assert.ok(c('generation').position.distanceTo(c('spillway').position)>5,'as abas não repetem a mesma câmera');
});
test('o contorno da seleção segue o corte',()=>{
 const m=createModel();try{const turbine=m.parts.find(p=>p.id==='turbine')!.group;
  m.applyCut(false);const closed=visibleBounds(turbine,false);m.applyCut(true);const open=visibleBounds(turbine,true);
  assert.ok(open.max.z<closed.max.z-.3,'aberta, a metade da frente da caixa espiral sai do contorno');
 }finally{m.dispose();}
});
