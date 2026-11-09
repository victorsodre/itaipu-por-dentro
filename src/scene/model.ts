import * as T from 'three';
import {box,mesh,mergeStatic,disposeTree} from './geometry.ts';
import {catalog} from '../content/catalog.ts';
import {penstock,draftTube,spillway,generation,spillRoute,jet,GATE,SPILL_Z,UNIT_X,WATER_LEVEL,CREST_Y,SPLASH,SKI_JUMP_LIP} from '../simulation/hydro.ts';
const mat=(color:string,metalness=.1,roughness=.65)=>new T.MeshStandardMaterial({color,metalness,roughness});
function prism(parent:T.Object3D,points:number[][],depth:number,z:number,m:T.Material){const shape=new T.Shape();points.forEach((p,i)=>i?shape.lineTo(p[0]!,p[1]!):shape.moveTo(p[0]!,p[1]!));shape.closePath();return mesh(parent,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),m,0,0,z);}
function ring(parent:T.Object3D,inner:number,outer:number,height:number,m:T.Material,x:number,y:number,z:number){const shape=new T.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);const o=mesh(parent,new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:48}),m,x,y,z);o.rotation.x=Math.PI/2;return o;}

/** Open water channel along the chute: floor offset, depth set later by flow. */
function waterSheet(curve:T.CatmullRomCurve3,from:number,width:number){
 const steps=72,base:T.Vector3[]=[],normals:T.Vector3[]=[];
 for(let i=0;i<=steps;i++){const u=from+(1-from)*i/steps,p=curve.getPointAt(u),t=curve.getTangentAt(u);base.push(p);normals.push(new T.Vector3(-t.y,t.x,0).normalize());}
 const g=new T.BufferGeometry(),pos=new Float32Array((steps+1)*4*3),index:number[]=[];
 for(let i=0;i<steps;i++){const a=i*4,b=a+4;
  index.push(a+1,b+1,a+2,a+2,b+1,b+2);// top: corners 1 (left top) and 2 (right top)
  index.push(a,b,a+1,a+1,b,b+1);// left side
  index.push(a+2,b+2,a+3,a+3,b+2,b+3);}// right side
 g.setAttribute('position',new T.BufferAttribute(pos,3));g.setIndex(index);
 const setDepth=(depth:number)=>{
  base.forEach((p,i)=>{const n=normals[i]!,lift=.015;for(const [k,z,h] of [[0,-width/2,lift],[1,-width/2,lift+depth],[2,width/2,lift+depth],[3,width/2,lift]] as const){const o=(i*4+k)*3;pos[o]=p.x+n.x*h;pos[o+1]=p.y+n.y*h;pos[o+2]=p.z+z;}});
  g.attributes.position!.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();
 };
 setDepth(.1);return {geometry:g,setDepth};
}

export function createModel(){
 const root=new T.Group(),parts=catalog.map(p=>{const group=new T.Group();group.name=p.id;group.userData.partId=p.id;root.add(group);return {...p,group};}),group=(id:string)=>parts.find(p=>p.id===id)!.group;
 const reservoir=group('reservoir'),intake=group('intake'),conduit=group('penstock'),turbine=group('turbine'),generator=group('generator'),discharge=group('discharge'),spill=group('spillway');
 const concrete=mat('#b9b7a8'),cutStone=mat('#d2ccb9'),rock=mat('#393e47'),steel=mat('#667c89',.7,.32),ivory=mat('#e0ded2',.2,.5),dark=mat('#243842',.5,.45),copper=mat('#c57945',.65,.35),red=mat('#a94235',.45,.42),yellow=mat('#e6c044',.35,.4);
 const water=mat('#2b819d',.15,.28);water.transparent=true;water.opacity=.85;
 const ux=UNIT_X;
 box(reservoir,[18,1.1,10],[1,-.75,3.3],rock,.1);
 for(const y of [-1.05,-.72,-.4])box(reservoir,[18,.06,10.04],[1,y,3.3],mat(y===-.72?'#56616a':'#454c54'));
 // Reservoir water: follows the dam face in the generation lane and ends at the gate in the spillway lane.
 const volumeMat=water.clone();volumeMat.opacity=.6;const faceX=(y:number)=>-2+.65*y/7.1,back=-.7,front=SPILL_Z-1.4,bay=2.2,gateX=-1.8;
 prism(reservoir,[[-7.5,.1],[faceX(.1),.1],[faceX(WATER_LEVEL),WATER_LEVEL],[-7.5,WATER_LEVEL]],front-back,back,volumeMat).castShadow=false;
 box(reservoir,[gateX+7.5,WATER_LEVEL-.1,bay],[(gateX-7.5)/2,(WATER_LEVEL+.1)/2,SPILL_Z],volumeMat).castShadow=false;
 box(reservoir,[faceX(WATER_LEVEL)+7.5,.08,front-back],[(faceX(WATER_LEVEL)-7.5)/2,WATER_LEVEL,(front+back)/2],water,.02);
 box(reservoir,[gateX+7.5,.08,bay],[(gateX-7.5)/2,WATER_LEVEL,SPILL_Z],water,.02);
 for(let i=0;i<7;i++)box(reservoir,[3.2,.008,.016],[-4.6,WATER_LEVEL+.05,-.2+i*.75],mat('#7fbdc9',.1,.4));
 // Lightened-gravity cross-section, behind the visible hydraulic route.
 const damProfile=[[-2,0],[-1.35,7.1],[-.35,7.1],[3.6,0]];
 prism(reservoir,damProfile,1.25,-.7,concrete);
 const cavity=prism(reservoir,[[-.9,.7],[-.75,5.6],[2.1,.7]],.04,.57,dark);cavity.raycast=()=>{};
 for(const y of [1.3,2.6,3.9])box(reservoir,[2.1,.12,.05],[.2,y,.65],cutStone);
 const outer=new T.Group();reservoir.add(outer);
 prism(outer,damProfile,1.1,2.9,concrete);
 box(reservoir,[2.1,.18,5.5],[-.9,7.15,.5],cutStone,.04);
 for(const z of [-.6,2.9])for(let i=0;i<8;i++){box(reservoir,[.035,.65,.035],[-1.7+i*.24,7.55,z],steel);}
 for(const z of [-.6,2.9])box(reservoir,[2,.035,.035],[-.85,7.87,z],steel);
 // Powerhouse substructure at the dam toe: the spiral case and draft tube are embedded in it.
 const houseMat=concrete.clone();houseMat.side=T.DoubleSide;
 box(reservoir,[3.3,3.2,3],[ux+.15,1.6,1.5],houseMat);
 // Intake on the upstream face, fully below the reservoir surface.
 box(intake,[.16,1.2,1.4],[-1.62,4.7,1.5],steel,.03);
 for(let i=0;i<9;i++)box(intake,[.07,1.1,.035],[-1.72,4.7,.86+i*.16],dark);
 for(const z of [.68,2.32])box(intake,[.3,3.1,.25],[-1.3,5.65,z],cutStone,.03);
 box(intake,[.8,.25,2],[-1.28,7.5,1.5],yellow,.06);mesh(intake,new T.CylinderGeometry(.045,.045,2.1,12),steel,-1.28,6.35,1.5);
 const pipeMaterial=ivory.clone();pipeMaterial.side=T.DoubleSide;
 const pipe=mesh(conduit,new T.TubeGeometry(penstock,72,.4,24,false),pipeMaterial);
 const pipeWaterMat=water.clone();pipeWaterMat.transparent=true;pipeWaterMat.opacity=.42;pipeWaterMat.depthWrite=false;
 const pipeWater=mesh(conduit,new T.TubeGeometry(penstock,72,.34,16,false),pipeWaterMat);pipeWater.castShadow=false;
 for(const t of [.2,.42,.62,.82]){const p=penstock.getPointAt(t),o=mesh(conduit,new T.TorusGeometry(.415,.035,8,32),steel,p.x,p.y,p.z);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),penstock.getTangentAt(t));}
 // Volute, radial entry and axial outlet. Front half is removed in the cut view.
 const voluteMat=steel.clone(),volute=mesh(turbine,new T.TorusGeometry(1.1,.37,16,64),voluteMat,ux,1.9,1.5);volute.rotation.x=Math.PI/2;
 const turbineRotor=new T.Group();turbine.add(turbineRotor);turbineRotor.position.set(ux,1.9,1.5);
 mesh(turbineRotor,new T.CylinderGeometry(.23,.52,.62,32),silver(),0,-.1);
 ring(turbineRotor,.58,.78,.12,steel,0,.14,0);
 for(let i=0;i<12;i++){
  const blade=new T.Shape();blade.moveTo(.2,-.15);blade.bezierCurveTo(.35,-.35,.8,-.3,.8,.05);blade.lineTo(.72,.1);blade.bezierCurveTo(.7,-.12,.4,-.13,.2,-.06);blade.closePath();
  const o=mesh(turbineRotor,new T.ExtrudeGeometry(blade,{depth:.45,bevelEnabled:false,curveSegments:12}).rotateX(Math.PI/2).translate(0,.12,0),silver());o.rotation.y=i/12*Math.PI*2;
 }
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2,o=box(turbine,[.22,.35,.045],[ux+Math.cos(a)*.94,1.9,1.5+Math.sin(a)*.94],copper,.015);o.rotation.y=-a+.4;}
 const shaftRotor=new T.Group();generator.add(shaftRotor);shaftRotor.position.set(ux,0,1.5);mesh(shaftRotor,new T.CylinderGeometry(.14,.14,3.4,20),steel,0,3.3);
 box(shaftRotor,[.04,3.4,.03],[.15,3.3,0],yellow);
 const generatorRotor=new T.Group();generator.add(generatorRotor);generatorRotor.position.set(ux,4.1,1.5);
 mesh(generatorRotor,new T.CylinderGeometry(.96,.96,.75,48),red);
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,o=box(generatorRotor,[.13,.72,.13],[Math.cos(a)*.98,0,Math.sin(a)*.98],steel,.015);o.rotation.y=-a;}
 const stator=new T.Group();generator.add(stator);stator.position.set(ux,4.1,1.5);
 const statorMat=ivory.clone(),statorRing=ring(stator,1.11,1.4,.95,statorMat,0,.5,0);
 const coils=new T.Group();stator.add(coils);for(let i=0;i<30;i++){const a=i/30*Math.PI*2,o=box(coils,[.14,.82,.17],[Math.cos(a)*1.12,0,Math.sin(a)*1.12],copper,.02);o.rotation.y=-a;}
 const topCover=mesh(generator,new T.CylinderGeometry(1.42,1.42,.1,48),red,ux,5.05,1.5);
 for(const y of [3.5,4.75])for(const x of [-1,1])box(generator,[.15,.12,2.6],[ux+x*.65,y,1.5],ivory);
 for(const x of [ux-1.35,ux+1.35])for(const z of [.15,2.85])box(generator,[.15,1.8,.15],[x,4.1,z],ivory,.02);
 const tailMat=steel.clone();tailMat.side=T.DoubleSide;const tail=mesh(discharge,new T.TubeGeometry(draftTube,48,.55,24,false),tailMat);
 mesh(discharge,new T.TubeGeometry(draftTube,48,.49,16,false),pipeWaterMat).castShadow=false;
 box(discharge,[3.2,.24,3.4],[ux+3.5,.55,1.5],water,.03);
 // Hillside spillway: solid chute body ending in a ski-jump lip, segment gate on the crest.
 const chuteSection=new T.Shape(),floor=spillway.getSpacedPoints(60);
 floor.forEach((p,i)=>i?chuteSection.lineTo(p.x,p.y):chuteSection.moveTo(p.x,p.y));
 chuteSection.lineTo(SKI_JUMP_LIP.x,-.2);chuteSection.lineTo(floor[0]!.x,-.2);chuteSection.closePath();
 const chuteWidth=2.4;mesh(spill,new T.ExtrudeGeometry(chuteSection,{depth:chuteWidth,bevelEnabled:false,curveSegments:4}),cutStone,0,0,SPILL_Z-chuteWidth/2);
 for(const side of [-1,1]){const wall=new T.Shape();floor.forEach((p,i)=>i?wall.lineTo(p.x,p.y+.32):wall.moveTo(p.x,p.y+.32));[...floor].reverse().forEach(p=>wall.lineTo(p.x,p.y-.01));wall.closePath();mesh(spill,new T.ExtrudeGeometry(wall,{depth:.14,bevelEnabled:false}),concrete,0,0,SPILL_Z+side*(chuteWidth/2-.07)-.07);}
 // Piers: the near pier and the deck belong to the closed view, so the cut shows the gate from the side.
 box(spill,[2.4,2.8,.3],[-1,CREST_Y+1.25,SPILL_Z-1.27],concrete,.04);
 const spillOuter=new T.Group();spill.add(spillOuter);
 box(spillOuter,[2.4,2.8,.3],[-1,CREST_Y+1.25,SPILL_Z+1.27],concrete,.04);box(spillOuter,[2.4,.22,2.84],[-1,CREST_Y+2.75,SPILL_Z],steel,.03);
 const gate=new T.Group();spill.add(gate);gate.position.set(GATE.trunnion[0],GATE.trunnion[1],SPILL_Z);
 // Cylinder vertex angle θ lands at θ − 90° in the x-y plane after turning the axis to z: the skin plate spans 150°–210°.
 const plateMat=yellow.clone();plateMat.side=T.DoubleSide;
 const plate=mesh(gate,new T.CylinderGeometry(GATE.radius,GATE.radius,2.1,32,1,true,GATE.closedBottom-GATE.span+Math.PI/2,GATE.span),plateMat);plate.rotation.x=Math.PI/2;
 for(const zSide of [-.9,.9])for(const a of [GATE.closedBottom-.08,GATE.closedBottom-GATE.span+.08]){const arm=box(gate,[GATE.radius,.09,.09],[Math.cos(a)*GATE.radius/2,Math.sin(a)*GATE.radius/2,zSide],steel);arm.rotation.z=a;}
 mesh(gate,new T.CylinderGeometry(.13,.13,2.2,16),steel).rotation.x=Math.PI/2;
 const spillWaterMat=water.clone();spillWaterMat.side=T.DoubleSide;spillWaterMat.depthWrite=false;
 const sheet=waterSheet(spillway,.05,chuteWidth-.32),spillWater=mesh(spill,sheet.geometry,spillWaterMat);spillWater.castShadow=false;spillWater.raycast=()=>{};
 const jetMat=spillWaterMat.clone();jetMat.opacity=.55;
 const jetWater=mesh(spill,new T.TubeGeometry(jet,40,.1,10,false),jetMat);jetWater.castShadow=false;jetWater.raycast=()=>{};
 const sprayMat=new T.MeshStandardMaterial({color:'#d9eef4',transparent:true,opacity:.45,roughness:.9,depthWrite:false});
 const spray=mesh(spill,new T.SphereGeometry(1,20,12),sprayMat,SPLASH.x,SPLASH.y,SPLASH.z);spray.castShadow=false;spray.raycast=()=>{};
 box(spill,[2.6,.24,3.3],[8.8,.52,SPILL_Z],water,.03);
 for(const g of [intake,turbineRotor,generatorRotor,shaftRotor])mergeStatic(g);
 mergeStatic(reservoir);mergeStatic(outer);
 const helpers=new T.Group();root.add(helpers);
 const lineMaterial=(color:string)=>new T.MeshBasicMaterial({color,transparent:true,opacity:.9,depthTest:true});
 const routeLines={generation:mesh(helpers,new T.TubeGeometry(generation,180,.035,8,false),lineMaterial('#f3b45d')),spillway:mesh(helpers,new T.TubeGeometry(spillRoute,120,.035,8,false),lineMaterial('#75cef0'))};
 for(const line of Object.values(routeLines)){line.castShadow=false;line.raycast=()=>{};}
 const makeParticles=(color:string)=>{const o=new T.InstancedMesh(new T.SphereGeometry(.07,8,6),new T.MeshBasicMaterial({color}),MAX_PARTICLES);helpers.add(o);o.raycast=()=>{};o.frustumCulled=false;o.instanceMatrix.setUsage(T.DynamicDrawUsage);return o;};
 const particles={generation:makeParticles('#ffce78'),spillway:makeParticles('#9de3fa')};
 const marker=mesh(helpers,new T.SphereGeometry(.16,16,12),new T.MeshBasicMaterial({color:'#ffd21f'}));marker.castShadow=false;marker.raycast=()=>{};
 const cutPlane=new T.Plane(new T.Vector3(0,0,-1),CUT_Z);
 const applyCut=(cut:boolean)=>{outer.visible=spillOuter.visible=!cut;topCover.visible=!cut;coils.children.forEach((o,i)=>o.visible=!cut||Math.sin(i/30*Math.PI*2)<0);for(const m of [pipeMaterial,voluteMat,statorMat,tailMat,houseMat]){m.clippingPlanes=cut?[cutPlane]:[];m.clipShadows=true;}statorRing.visible=true;};
 let lastDepth=-1;
 /** Rebuilds flow-dependent spillway geometry only when the flow changes. */
 const setSpillFlow=(depth:number)=>{
  if(depth===lastDepth)return;lastDepth=depth;
  spillWater.visible=jetWater.visible=spray.visible=depth>0;if(depth<=0)return;
  sheet.setDepth(depth);jetWater.geometry.dispose();jetWater.geometry=new T.TubeGeometry(jet,40,depth*.9,10,false);
  spray.scale.setScalar(.15+depth*2.2);
 };
 return {root,parts,outer,spillOuter,pipe,plate,volute,tail,turbineRotor,generatorRotor,shaftRotor,stator,spill,gate,spillWater,jetWater,spray,setSpillFlow,helpers,routeLines,particles,marker,applyCut,dispose:()=>disposeTree(root)};
}
export const MAX_PARTICLES=40;
/** The cut keeps what lies behind z = 1.5, the axis of the generating unit. */
export const CUT_Z=1.5;
/** Whole-diorama framing box, shared by the camera, the captures and the tests. */
export const DIORAMA_BOUNDS=new T.Box3(new T.Vector3(-8,-1.4,-2.3),new T.Vector3(10.1,8.1,8.4));
export const DEFAULT_DIRECTION=new T.Vector3(10,7,20);
/** Each tab has its own camera: the generation lane (z≈1.5) and the spillway lane (z≈6.4) framed on their own. */
export const VIEW_FRAMES:Record<'compare'|'generation'|'spillway',{bounds:T.Box3;direction:T.Vector3}>={
 compare:{bounds:DIORAMA_BOUNDS,direction:DEFAULT_DIRECTION},
 generation:{bounds:DIORAMA_BOUNDS,direction:new T.Vector3(4,14,13)},
 spillway:{bounds:DIORAMA_BOUNDS,direction:new T.Vector3(2,3.5,20)},
};
/** Box of what is actually drawn: hidden meshes are skipped and the cut removes everything in front of its plane. */
export function visibleBounds(object:T.Object3D,cut:boolean){
 const box=new T.Box3(),part=new T.Box3();object.updateWorldMatrix(true,true);
 object.traverseVisible(o=>{if(!(o instanceof T.Mesh)||o instanceof T.InstancedMesh)return;part.setFromObject(o);
  const clipped=cut&&(Array.isArray(o.material)?o.material:[o.material]).some(m=>m.clippingPlanes?.length);
  if(clipped){part.max.z=Math.min(part.max.z,CUT_Z);if(part.min.z>part.max.z)return;}box.union(part);});
 return box.isEmpty()?new T.Box3().setFromObject(object):box;
}
function silver(){return mat('#b8c5cb',.8,.28);}
export type HydroModel=ReturnType<typeof createModel>;
