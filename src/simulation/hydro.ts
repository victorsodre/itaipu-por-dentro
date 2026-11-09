import {CatmullRomCurve3,Vector3} from 'three';
export type Route='generation'|'spillway';
/** Flows are fractions: generation is qualitative; spillway is a fraction of the design capacity. */
export type HydroState={generationFlow:number;spillwayFlow:number;generationProgress:number;spillwayProgress:number;rotorAngle:number};
const clamp=(n:number,min=0,max=1)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:0));
const wrap=(n:number,limit=1)=>Number.isFinite(n)?((n%limit)+limit)%limit:0;

/** Itaipu spillway design capacity in m³/s (Itaipu, página Vertedouro). */
export const SPILLWAY_CAPACITY=62_200;
/** Peak flow reported on 15/10/2026 (O Presente), used as the opening state. */
export const FLOOD_PEAK=12_600;
export const spillwayFraction=(cubicMeters:number)=>clamp(cubicMeters/SPILLWAY_CAPACITY);
export const spillwayCubicMeters=(fraction:number)=>Math.round(clamp(fraction)*SPILLWAY_CAPACITY/100)*100;

export const initialState=():HydroState=>({generationFlow:.65,spillwayFlow:spillwayFraction(FLOOD_PEAK),generationProgress:0,spillwayProgress:0,rotorAngle:0});
export function sanitize(s:HydroState):HydroState{return {generationFlow:clamp(s.generationFlow),spillwayFlow:clamp(s.spillwayFlow),generationProgress:wrap(s.generationProgress),spillwayProgress:wrap(s.spillwayProgress),rotorAngle:wrap(s.rotorAngle,Math.PI*2)};}
export const canPlay=(s:HydroState)=>s.generationFlow>0||s.spillwayFlow>0;
export const flowOf=(s:HydroState,route:Route)=>route==='generation'?s.generationFlow:s.spillwayFlow;
export const progressOf=(s:HydroState,route:Route)=>route==='generation'?s.generationProgress:s.spillwayProgress;
export function setFlow(s:HydroState,route:Route,value:number){
 const next=sanitize({...s,[route==='generation'?'generationFlow':'spillwayFlow']:value});
 return {...next,spillwayProgress:reachable(next,'spillway',next.spillwayProgress)};
}
export function setProgress(s:HydroState,route:Route,value:number){
 const v=reachable(s,route,clamp(value));
 return sanitize({...s,[route==='generation'?'generationProgress':'spillwayProgress']:v});
}
export function advance(s:HydroState,seconds:number,playing:boolean,visible:boolean):HydroState{
 if(!playing||!visible||!canPlay(s))return s;const next=sanitize(s),dt=clamp(seconds,0,.1);
 return {...next,generationProgress:wrap(next.generationProgress+(next.generationFlow>0?dt/12:0)),spillwayProgress:wrap(next.spillwayProgress+(next.spillwayFlow>0?dt/10:0)),rotorAngle:wrap(next.rotorAngle+(next.generationFlow>0?dt*.65:0),Math.PI*2)};
}

// Diorama coordinates (no physical unit). Lanes: generation at z=1.5, spillway at z=SPILL_Z.
export const WATER_LEVEL=5.64;
export const UNIT_X=4.4;
export const SPILL_Z=6.4;
export const CREST_Y=4.8;
/** Segment gate: skin plate is an arc around the trunnion, closed between 150° and 210°. */
export const GATE={trunnion:[-.3,5.55] as const,radius:1.5,closedBottom:210*Math.PI/180,span:60*Math.PI/180,minOpen:8*Math.PI/180,maxOpen:50*Math.PI/180};
/** Opening angle grows with the flow; any flow above zero lifts the lip clear of the stream (illustrative). */
export const gateOpening=(flow:number)=>{const f=clamp(flow);return f===0?0:GATE.minOpen+(GATE.maxOpen-GATE.minOpen)*f;};
export function gateLip(opening:number){const a=GATE.closedBottom-opening;return {x:GATE.trunnion[0]+GATE.radius*Math.cos(a),y:GATE.trunnion[1]+GATE.radius*Math.sin(a)};}
/** Water sheet depth on the chute, rising with flow. */
export const sheetDepth=(flow:number)=>{const f=clamp(flow);return f===0?0:.04+.24*Math.sqrt(f);};

const curve=(points:number[][])=>new CatmullRomCurve3(points.map(p=>new Vector3(...p as [number,number,number])),false,'centripetal');
const ux=UNIT_X;
export const penstock=curve([[-1.5,4.7,1.5],[.3,4.7,1.5],[1.45,4.55,1.5],[2.2,3.4,1.5],[2.85,2.4,1.85],[3.5,1.95,2.55],[ux,1.9,2.65]]);
export const draftTube=curve([[ux,1.8,1.5],[ux,.8,1.5],[ux+1,.35,1.5],[ux+4.2,.35,1.5]]);
/** Chute floor: crest, steep run, bucket and ski-jump lip. */
const chuteProfile=[[-2.2,CREST_Y],[-1.2,CREST_Y],[-.2,4.6],[1.2,3.8],[2.8,2.6],[4.4,1.6],[5.8,1.05],[6.6,1.05],[7.2,1.3],[7.5,1.55]];
export const spillway=curve(chuteProfile.map(([x,y])=>[x!,y!,SPILL_Z]));
export const SKI_JUMP_LIP=new Vector3(7.5,1.55,SPILL_Z);
const jetPoints=[[7.5,1.66],[8,1.8],[8.6,1.6],[9.1,1.1],[9.45,.45]];
export const jet=curve(jetPoints.map(([x,y])=>[x!,y!,SPILL_Z]));
export const SPLASH=new Vector3(9.45,.5,SPILL_Z);
export const generation=curve([[-5.7,4.7,1.5],...penstock.points.map(v=>v.toArray()),[ux+1,1.9,1.7],[ux+.8,1.9,.7],[ux-.5,1.9,.5],[ux-1,1.9,1.1],[ux-.4,1.8,1.4],[ux,1.7,1.5],[ux,.8,1.5],[ux+1,.35,1.5],[ux+4.2,.35,1.5]]);
/** Water rides just above the crest, under the lifted lip, then along the chute and through the air. */
export const spillRoute=curve([[-5.7,4.95,SPILL_Z],[-2.6,4.9,SPILL_Z],[-1.75,CREST_Y+.07,SPILL_Z],...chuteProfile.slice(2,-1).map(([x,y])=>[x!,y!+.11,SPILL_Z]),...jetPoints.map(([x,y])=>[x!,y!,SPILL_Z])]);
export const routeCurve=(route:Route)=>route==='generation'?generation:spillRoute;
export const sampleRoute=(route:Route,t:number)=>routeCurve(route).getPointAt(clamp(t));
export const routeParts=(route:Route):string[]=>route==='generation'?['reservoir','intake','penstock','turbine','discharge']:['reservoir','spillway'];

const samples=new Map<Route,Vector3[]>();
function paramNear(route:Route,point:Vector3){
 let list=samples.get(route);if(!list){list=routeCurve(route).getSpacedPoints(800);samples.set(route,list);}
 let best=0,distance=Infinity;list.forEach((p,i)=>{const d=p.distanceToSquared(point);if(d<distance){distance=d;best=i;}});
 return best/(list.length-1);
}
type Stage={name:string;short:string;start:number};
const stage=(route:Route,name:string,short:string,anchor:number[]|null):Stage=>({name,short,start:anchor?paramNear(route,new Vector3(...anchor as [number,number,number])):0});
export const stages:Record<Route,Stage[]>={
 generation:[stage('generation','Reservatório','reservatório',null),stage('generation','Tomada d’água','tomada',[-2.1,4.7,1.5]),stage('generation','Conduto forçado','conduto',[-.9,4.7,1.5]),stage('generation','Caixa espiral e turbina','turbina',[ux,1.9,2.65]),stage('generation','Tubo de sucção e rio','rio',[ux,1.2,1.5])],
 spillway:[stage('spillway','Reservatório','reservatório',null),stage('spillway','Comporta de segmento','comporta',[-2.3,4.9,SPILL_Z]),stage('spillway','Calha do vertedouro','calha',[-.9,CREST_Y,SPILL_Z]),stage('spillway','Trampolim','trampolim',[6.4,1.16,SPILL_Z]),stage('spillway','Salto e retorno ao rio','rio',[7.5,1.66,SPILL_Z])],
};
export const routeStage=(route:Route,progress:number)=>{const list=stages[route];let current=list[0]!;for(const s of list)if(progress>=s.start)current=s;return current.name;};
/** Where the marker stops when the spillway gate is closed: just upstream of the skin plate. */
export const SPILL_GATE_T=paramNear('spillway',new Vector3(-2,CREST_Y+.08,SPILL_Z));
/** The marker cannot go past a closed spillway gate. */
export function reachable(s:HydroState,route:Route,progress:number){return route==='spillway'&&s.spillwayFlow===0?Math.min(progress,SPILL_GATE_T):progress;}
