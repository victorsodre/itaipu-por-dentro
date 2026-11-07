import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';import {createModel} from './model.ts';import {applyHydro} from './rig.ts';import {initialState,advance,setFlow,sampleRoute} from '../simulation/hydro.ts';import {fit} from './camera.ts';
test('turbina e rotor giram juntos, estator permanece fixo e caminhos independentes',()=>{
 const m=createModel();try{const original=m.stator.rotation.toArray();let s=initialState();
 const turbineBounds=new T.Box3().setFromObject(m.parts.find(p=>p.id==='turbine')!.group),generatorBounds=new T.Box3().setFromObject(m.generatorRotor);
 for(let i=0;i<=300;i++){assert.equal(turbineBounds.containsPoint(sampleRoute('spillway',i/300)),false);assert.equal(generatorBounds.containsPoint(sampleRoute('generation',i/300)),false);}
 for(let i=0;i<20;i++){s=advance(s,.1,true,true);applyHydro(m,s,true,'compare','generation');assert.equal(m.turbineRotor.rotation.y,m.generatorRotor.rotation.y);assert.equal(m.shaftRotor.rotation.y,m.turbineRotor.rotation.y);assert.deepEqual(m.stator.rotation.toArray(),original);}
 s=setFlow(s,'generation',0);applyHydro(m,s,true,'compare','generation');assert.equal(m.particles.generation.visible,false);assert.equal(m.particles.spillway.visible,true);assert.equal(m.spillWater.visible,true);
 s=setFlow(s,'spillway',0);applyHydro(m,s,true,'compare','spillway');assert.equal(m.particles.spillway.visible,false);assert.equal(m.spillWater.visible,false);assert.deepEqual(advance(s,.1,true,true),s);
 }finally{m.dispose();}
});
test('corte, catálogo e pose de reset são reversíveis',()=>{
 const m=createModel();try{assert.equal(m.parts.length,6);const s=initialState();applyHydro(m,s,true,'compare','generation');m.root.updateMatrixWorld(true);const pose=m.generatorRotor.matrixWorld.toArray();
 const coils=m.stator.children.find(o=>o instanceof T.Group)!;assert.ok(coils.children.some(o=>o.visible),'o corte preserva as bobinas de trás');assert.ok(coils.children.some(o=>!o.visible),'o corte remove as bobinas da frente');
 m.applyCut(false);assert.ok(coils.children.every(o=>o.visible));m.applyCut(true);
 applyHydro(m,advance(s,.1,true,true),false,'spillway','spillway');assert.equal(m.outer.visible,true);applyHydro(m,s,true,'compare','generation');m.root.updateMatrixWorld(true);assert.equal(m.outer.visible,false);assert.deepEqual(m.generatorRotor.matrixWorld.toArray(),pose);assert.equal(m.routeLines.generation.visible,true);assert.equal(m.routeLines.spillway.visible,true);
 }finally{m.dispose();}
});
test('câmera enquadra diorama e grupos em formatos horizontal e vertical',()=>{
 const m=createModel();try{applyHydro(m,initialState(),true,'compare','generation');const boxes=[new T.Box3(new T.Vector3(-8,-1.4,-5.6),new T.Vector3(10.1,8.1,4.7)),...m.parts.map(p=>new T.Box3().setFromObject(p.group))];
 for(const bounds of boxes)for(const aspect of [1920/830,1080/1570,.7,2]){const c=new T.PerspectiveCamera(38,aspect,.1,400);fit(c,bounds,new T.Vector3(8,6,22));c.updateMatrixWorld();for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const p=new T.Vector3(x,y,z).project(c);assert.ok(Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z>-1&&p.z<1);}}
 }finally{m.dispose();}
});
