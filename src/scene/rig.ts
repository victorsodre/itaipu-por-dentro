import * as T from 'three';
import {MAX_PARTICLES} from './model.ts';
import type {HydroModel} from './model.ts';import type {HydroState,Route} from '../simulation/hydro.ts';import {sampleRoute,gateOpening,sheetDepth,reachable,flowOf,progressOf} from '../simulation/hydro.ts';
export type PathView='generation'|'spillway'|'compare';
/** Marker count grows with flow; the square root keeps small spillway flows visible. */
export const particleCount=(route:Route,flow:number)=>flow<=0?0:route==='generation'?Math.max(3,Math.round(flow*24)):Math.min(MAX_PARTICLES,4+Math.round(Math.sqrt(flow)*36));
const dummy=new T.Object3D();
export function applyHydro(model:HydroModel,state:HydroState,cut:boolean,view:PathView,following:Route|null){
 model.applyCut(cut);model.turbineRotor.rotation.y=state.rotorAngle;model.generatorRotor.rotation.y=state.rotorAngle;model.shaftRotor.rotation.y=state.rotorAngle;
 model.gate.rotation.z=-gateOpening(state.spillwayFlow);
 model.setSpillFlow(sheetDepth(state.spillwayFlow));
 for(const route of ['generation','spillway'] as const){
  const flow=flowOf(state,route),progress=progressOf(state,route);
  model.routeLines[route].visible=view===route||view==='compare';const marks=model.particles[route];marks.count=particleCount(route,flow);marks.visible=model.routeLines[route].visible&&marks.count>0;
  for(let i=0;i<marks.count;i++){dummy.position.copy(sampleRoute(route,(progress+i/marks.count)%1));dummy.updateMatrix();marks.setMatrixAt(i,dummy.matrix);}marks.instanceMatrix.needsUpdate=true;
 }
 model.marker.visible=following!==null;if(following)model.marker.position.copy(sampleRoute(following,reachable(state,following,progressOf(state,following))));
}
