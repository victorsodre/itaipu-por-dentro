import {CatmullRomCurve3,Vector3} from 'three';
export type Route='generation'|'spillway';
export type HydroState={generationFlow:number;spillwayFlow:number;generationProgress:number;spillwayProgress:number;rotorAngle:number};
const clamp=(n:number,min=0,max=1)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:0));
const wrap=(n:number,limit=1)=>Number.isFinite(n)?((n%limit)+limit)%limit:0;
export const initialState=():HydroState=>({generationFlow:.65,spillwayFlow:.5,generationProgress:0,spillwayProgress:0,rotorAngle:0});
export function sanitize(s:HydroState):HydroState{return {generationFlow:clamp(s.generationFlow),spillwayFlow:clamp(s.spillwayFlow),generationProgress:wrap(s.generationProgress),spillwayProgress:wrap(s.spillwayProgress),rotorAngle:wrap(s.rotorAngle,Math.PI*2)};}
export const setFlow=(s:HydroState,route:Route,value:number)=>sanitize({...s,[route==='generation'?'generationFlow':'spillwayFlow']:value});
export function advance(s:HydroState,seconds:number,playing:boolean,visible:boolean):HydroState{
 if(!playing||!visible||(s.generationFlow===0&&s.spillwayFlow===0))return s;const next=sanitize(s),dt=clamp(seconds,0,.1);
 return {...next,generationProgress:wrap(next.generationProgress+(next.generationFlow>0?dt/12:0)),spillwayProgress:wrap(next.spillwayProgress+(next.spillwayFlow>0?dt/10:0)),rotorAngle:wrap(next.rotorAngle+(next.generationFlow>0?dt*.65:0),Math.PI*2)};
}
const curve=(points:number[][])=>new CatmullRomCurve3(points.map(p=>new Vector3(...p as [number,number,number])),false,'centripetal');
export const penstock=curve([[-1.4,5.8,1.5],[-.5,5.4,1.5],[1.4,2.6,1.5],[2.5,1.9,2.65],[4,1.9,2.65]]);
export const draftTube=curve([[4,1.8,1.5],[4,.8,1.5],[5,.35,1.5],[8,.35,1.5]]);
export const spillway=curve([[-1.4,5.8,-3.4],[0,5.6,-3.4],[1.5,4.8,-3.4],[3,2.8,-3.4],[5,1.4,-3.4],[6.2,1.5,-3.4],[7,1.4,-3.4],[8,.35,-3.4]]);
export const generation=curve([[-5.7,5.8,1.5],[-1.4,5.8,1.5],[-.5,5.4,1.5],[1.4,2.6,1.5],[2.5,1.9,2.65],[4,1.9,2.65],[5,1.9,1.7],[4.8,1.9,.7],[3.5,1.9,.5],[3,1.9,1.1],[3.6,1.8,1.4],[4,1.7,1.5],[4,.8,1.5],[5,.35,1.5],[8,.35,1.5]]);
export const spillRoute=curve([[-5.7,5.8,-3.4],...spillway.points.map(v=>v.toArray())]);
export const routeCurve=(route:Route)=>route==='generation'?generation:spillRoute;
export const sampleRoute=(route:Route,t:number)=>routeCurve(route).getPointAt(clamp(t));
export const routeParts=(route:Route):string[]=>route==='generation'?['reservoir','intake','penstock','turbine','discharge']:['reservoir','discharge'];
export const routeStage=(route:Route,progress:number)=>route==='spillway'?(progress<.3?'Reservatório':progress<.83?'Calha do vertedouro':'Retorno ao rio'):(progress<.18?'Reservatório':progress<.25?'Tomada d’água':progress<.49?'Conduto forçado':progress<.76?'Caixa espiral e turbina':'Tubo de sucção e rio');
