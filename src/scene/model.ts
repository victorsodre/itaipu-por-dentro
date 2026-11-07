import * as T from 'three';
import {box,mesh,mergeStatic,disposeTree} from './geometry.ts';
import {catalog} from '../content/catalog.ts';
import {penstock,draftTube,spillway,generation,spillRoute} from '../simulation/hydro.ts';
const mat=(color:string,metalness=.1,roughness=.65)=>new T.MeshStandardMaterial({color,metalness,roughness});
function prism(parent:T.Object3D,points:number[][],depth:number,z:number,m:T.Material){const shape=new T.Shape();points.forEach((p,i)=>i?shape.lineTo(p[0]!,p[1]!):shape.moveTo(p[0]!,p[1]!));shape.closePath();return mesh(parent,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),m,0,0,z);}
function ring(parent:T.Object3D,inner:number,outer:number,height:number,m:T.Material,x:number,y:number,z:number){const shape=new T.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);const o=mesh(parent,new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:48}),m,x,y,z);o.rotation.x=Math.PI/2;return o;}
function ribbon(curve:T.CatmullRomCurve3,width:number,offset=0){const pos:number[]=[],index:number[]=[];for(let i=0;i<=80;i++){const p=curve.getPoint(i/80);for(const side of [-1,1])pos.push(p.x,p.y+offset,p.z+side*width/2);if(i<80){const n=i*2;index.push(n,n+2,n+1,n+1,n+2,n+3);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(index);g.computeVertexNormals();return g;}
export function createModel(){
 const root=new T.Group(),parts=catalog.map(p=>{const group=new T.Group();group.name=p.id;group.userData.partId=p.id;root.add(group);return {...p,group};}),group=(id:string)=>parts.find(p=>p.id===id)!.group;
 const reservoir=group('reservoir'),intake=group('intake'),conduit=group('penstock'),turbine=group('turbine'),generator=group('generator'),discharge=group('discharge');
 const concrete=mat('#b9b7a8'),cutStone=mat('#d2ccb9'),rock=mat('#393e47'),steel=mat('#667c89',.7,.32),ivory=mat('#e0ded2',.2,.5),dark=mat('#243842',.5,.45),copper=mat('#c57945',.65,.35),red=mat('#a94235',.45,.42),yellow=mat('#e6c044',.35,.4);
 const water=mat('#2b819d',.15,.28);water.transparent=true;water.opacity=.85;
 box(reservoir,[18,1.1,10],[1,-.75,-.3],rock,.1);
 for(const y of [-1.05,-.72,-.4])box(reservoir,[18,.06,10.04],[1,y,-.3],mat(y===-.72?'#56616a':'#454c54'));
 const volumeMat=water.clone();volumeMat.opacity=.6;const volume=box(reservoir,[6.1,5.5,7.7],[-4.45,2.85,-1.15],volumeMat,.02);volume.castShadow=false;
 box(reservoir,[6.1,.08,7.7],[-4.45,5.64,-1.15],water,.02);
 for(let i=0;i<7;i++)box(reservoir,[3.2,.008,.016],[-4.6,5.69,-4.2+i*.9],mat('#7fbdc9',.1,.4));
 // Lightened-gravity cross-section, behind the visible hydraulic route.
 prism(reservoir,[[-2,0],[-1.35,7.1],[-.35,7.1],[3.6,0]],1.25,-.7,concrete);
 const cavity=prism(reservoir,[[-.9,.7],[-.75,5.6],[2.1,.7]],.04,.57,dark);cavity.raycast=()=>{};
 for(const y of [1.3,2.6,3.9])box(reservoir,[2.1,.12,.05],[.2,y,.65],cutStone);
 const outer=new T.Group();reservoir.add(outer);
 prism(outer,[[-2,0],[-1.35,7.1],[-.35,7.1],[3.6,0]],1.1,2.9,concrete);
 box(reservoir,[2.1,.18,5.5],[-.9,7.15,.5],cutStone,.04);
 for(const z of [-.6,2.9])for(let i=0;i<8;i++){box(reservoir,[.035,.65,.035],[-1.7+i*.24,7.55,z],steel);}
 for(const z of [-.6,2.9])box(reservoir,[2,.035,.035],[-.85,7.87,z],steel);
 box(intake,[.16,1.4,1.4],[-1.58,5.82,1.5],steel,.03);
 for(let i=0;i<9;i++)box(intake,[.07,1.3,.035],[-1.69,5.82,.86+i*.16],dark);
 for(const z of [.68,2.32])box(intake,[.3,2.5,.25],[-1.28,6.1,z],cutStone,.03);
 box(intake,[.8,.25,2],[-1.28,7.5,1.5],yellow,.06);mesh(intake,new T.CylinderGeometry(.045,.045,1.4,12),steel,-1.28,6.7,1.5);
 const pipeMaterial=ivory.clone();pipeMaterial.side=T.DoubleSide;
 const pipe=mesh(conduit,new T.TubeGeometry(penstock,72,.4,24,false),pipeMaterial);
 const pipeWaterMat=water.clone();pipeWaterMat.transparent=true;pipeWaterMat.opacity=.42;pipeWaterMat.depthWrite=false;
 const pipeWater=mesh(conduit,new T.TubeGeometry(penstock,72,.34,16,false),pipeWaterMat);pipeWater.castShadow=false;
 for(const t of [.15,.36,.58,.8]){const p=penstock.getPoint(t),o=mesh(conduit,new T.TorusGeometry(.415,.035,8,32),steel,p.x,p.y,p.z);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),penstock.getTangent(t));}
 // Volute, radial entry and axial outlet. Front half is removed in the cut view.
 const voluteMat=steel.clone(),volute=mesh(turbine,new T.TorusGeometry(1.1,.37,16,64),voluteMat,4,1.9,1.5);volute.rotation.x=Math.PI/2;
 const turbineRotor=new T.Group();turbine.add(turbineRotor);turbineRotor.position.set(4,1.9,1.5);
 mesh(turbineRotor,new T.CylinderGeometry(.23,.52,.62,32),silver(),0,-.1);
 ring(turbineRotor,.58,.78,.12,steel,0,.14,0);
 for(let i=0;i<12;i++){
  const blade=new T.Shape();blade.moveTo(.2,-.15);blade.bezierCurveTo(.35,-.35,.8,-.3,.8,.05);blade.lineTo(.72,.1);blade.bezierCurveTo(.7,-.12,.4,-.13,.2,-.06);blade.closePath();
  const o=mesh(turbineRotor,new T.ExtrudeGeometry(blade,{depth:.45,bevelEnabled:false,curveSegments:12}).rotateX(Math.PI/2).translate(0,.12,0),silver());o.rotation.y=i/12*Math.PI*2;
 }
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2,o=box(turbine,[.22,.35,.045],[4+Math.cos(a)*.94,1.9,1.5+Math.sin(a)*.94],copper,.015);o.rotation.y=-a+.4;}
 const shaftRotor=new T.Group();generator.add(shaftRotor);shaftRotor.position.set(4,0,1.5);mesh(shaftRotor,new T.CylinderGeometry(.14,.14,3.4,20),steel,0,3.3);
 box(shaftRotor,[.04,3.4,.03],[.15,3.3,0],yellow);
 const generatorRotor=new T.Group();generator.add(generatorRotor);generatorRotor.position.set(4,4.1,1.5);
 mesh(generatorRotor,new T.CylinderGeometry(.96,.96,.75,48),red);
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,o=box(generatorRotor,[.13,.72,.13],[Math.cos(a)*.98,0,Math.sin(a)*.98],steel,.015);o.rotation.y=-a;}
 const stator=new T.Group();generator.add(stator);stator.position.set(4,4.1,1.5);
 const statorMat=ivory.clone(),statorRing=ring(stator,1.11,1.4,.95,statorMat,0,.5,0);
 const coils=new T.Group();stator.add(coils);for(let i=0;i<30;i++){const a=i/30*Math.PI*2,o=box(coils,[.14,.82,.17],[Math.cos(a)*1.12,0,Math.sin(a)*1.12],copper,.02);o.rotation.y=-a;}
 const topCover=mesh(generator,new T.CylinderGeometry(1.42,1.42,.1,48),red,4,5.05,1.5);
 for(const y of [3.5,4.75])for(const x of [-1,1])box(generator,[.15,.12,2.6],[4+x*.65,y,1.5],ivory);
 for(const x of [2.65,5.35])for(const z of [.15,2.85])box(generator,[.15,2.5,.15],[x,3.75,z],ivory,.02);
 const tailMat=steel.clone();tailMat.side=T.DoubleSide;const tail=mesh(discharge,new T.TubeGeometry(draftTube,48,.55,24,false),tailMat);
 mesh(discharge,new T.TubeGeometry(draftTube,48,.49,16,false),pipeWaterMat).castShadow=false;
 box(discharge,[3,.24,3.4],[7.25,.55,1.5],water,.03);
 const spill=new T.Group();discharge.add(spill);
 const chuteMat=cutStone.clone();chuteMat.side=T.DoubleSide;
 mesh(spill,ribbon(spillway,2.2,-.14),chuteMat);
 const spillWaterMat=water.clone();spillWaterMat.side=T.DoubleSide;spillWaterMat.depthWrite=false;
 const spillWater=mesh(spill,ribbon(spillway,1.9,-.07),spillWaterMat);spillWater.castShadow=false;
 for(const zOffset of [-1.1,1.1]){
  const points=spillway.points.map(p=>p.clone().add(new T.Vector3(0,.1,zOffset)));mesh(spill,new T.TubeGeometry(new T.CatmullRomCurve3(points),60,.12,8,false),concrete);
 }
 for(const z of [-4.65,-2.15])box(spill,[.4,2.1,.3],[-1.3,6.2,z],concrete,.04);
 box(spill,[.23,1.6,2.15],[-1.25,6,-3.4],yellow,.03);box(spill,[.9,.22,2.7],[-1.3,7.3,-3.4],steel,.03);
 box(discharge,[3.5,.24,3.3],[7.4,.52,-3.4],water,.03);
 for(const g of [intake,conduit,turbineRotor,generatorRotor,shaftRotor,stator,spill]){if(g===conduit||g===stator||g===spill)continue;mergeStatic(g);}
 mergeStatic(reservoir);mergeStatic(outer);
 const helpers=new T.Group();root.add(helpers);
 const lineMaterial=(color:string)=>new T.MeshBasicMaterial({color,transparent:true,opacity:.9,depthTest:true});
 const routeLines={generation:mesh(helpers,new T.TubeGeometry(generation,180,.035,8,false),lineMaterial('#f3b45d')),spillway:mesh(helpers,new T.TubeGeometry(spillRoute,100,.035,8,false),lineMaterial('#75cef0'))};
 for(const line of Object.values(routeLines)){line.castShadow=false;line.raycast=()=>{};}
 const makeParticles=(color:string)=>{const o=new T.InstancedMesh(new T.SphereGeometry(.07,8,6),new T.MeshBasicMaterial({color}),24);helpers.add(o);o.raycast=()=>{};o.instanceMatrix.setUsage(T.DynamicDrawUsage);return o;};
 const particles={generation:makeParticles('#ffce78'),spillway:makeParticles('#9de3fa')};
 const marker=mesh(helpers,new T.SphereGeometry(.16,16,12),new T.MeshBasicMaterial({color:'#ffd21f'}));marker.castShadow=false;marker.raycast=()=>{};
 const cutPlane=new T.Plane(new T.Vector3(0,0,-1),1.5);
 const applyCut=(cut:boolean)=>{outer.visible=!cut;topCover.visible=!cut;coils.children.forEach((o,i)=>o.visible=!cut||Math.sin(i/30*Math.PI*2)<0);for(const m of [pipeMaterial,voluteMat,statorMat,tailMat]){m.clippingPlanes=cut?[cutPlane]:[];m.clipShadows=true;}statorRing.visible=true;};
 return {root,parts,outer,pipe,volute,tail,turbineRotor,generatorRotor,shaftRotor,stator,spill,spillWater,helpers,routeLines,particles,marker,applyCut,dispose:()=>disposeTree(root)};
}
function silver(){return mat('#b8c5cb',.8,.28);}
export type HydroModel=ReturnType<typeof createModel>;
