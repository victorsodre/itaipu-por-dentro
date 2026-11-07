import * as T from 'three';
import type {HydroModel} from './model.ts';import type {HydroState,Route} from '../simulation/hydro.ts';import {sampleRoute} from '../simulation/hydro.ts';
export type PathView='generation'|'spillway'|'compare';
export function applyHydro(model:HydroModel,state:HydroState,cut:boolean,view:PathView,following:Route|null){
 model.applyCut(cut);model.turbineRotor.rotation.y=state.rotorAngle;model.generatorRotor.rotation.y=state.rotorAngle;model.shaftRotor.rotation.y=state.rotorAngle;
 const dummy=new T.Object3D();
 for(const route of ['generation','spillway'] as const){
  const flow=route==='generation'?state.generationFlow:state.spillwayFlow,progress=route==='generation'?state.generationProgress:state.spillwayProgress;
  model.routeLines[route].visible=view===route||view==='compare';const marks=model.particles[route];marks.visible=model.routeLines[route].visible&&flow>0;marks.count=flow>0?Math.max(3,Math.round(flow*24)):0;
  for(let i=0;i<marks.count;i++){dummy.position.copy(sampleRoute(route,(progress+i/marks.count)%1));dummy.updateMatrix();marks.setMatrixAt(i,dummy.matrix);}marks.instanceMatrix.needsUpdate=true;marks.computeBoundingSphere();
 }
 model.spillWater.visible=state.spillwayFlow>0;
 model.marker.visible=following!==null;if(following)model.marker.position.copy(sampleRoute(following,following==='generation'?state.generationProgress:state.spillwayProgress));
}
