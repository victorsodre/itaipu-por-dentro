import type {CSSProperties} from 'react';import {ArrowUpRight,Pause,Play,RotateCcw} from 'lucide-react';
import type {HydroState,Route} from '../simulation/hydro.ts';import {routeStage,stages,canPlay,flowOf,progressOf,SPILLWAY_CAPACITY,spillwayCubicMeters,spillwayFraction} from '../simulation/hydro.ts';
import {spillwayMarks,formatFlow,compareFlow} from '../content/spillway.ts';
import {routeStatus} from './status.ts';

const generationLabel=(n:number)=>n===0?'Zero':n<.4?'Baixa':n<.8?'Média':'Alta';
export function CycleControls({hydro,following,playing,cut,disabled,setPlaying,setCut,onFollow,onFlow,onProgress,reset}:{hydro:HydroState;following:Route;playing:boolean;cut:boolean;disabled:boolean;setPlaying:(b:boolean)=>void;setCut:(b:boolean)=>void;onFollow:(r:Route)=>void;onFlow:(r:Route,n:number)=>void;onProgress:(n:number)=>void;reset:()=>void}){
 const progress=progressOf(hydro,following),spill=spillwayCubicMeters(hydro.spillwayFlow),compare=compareFlow(spill,SPILLWAY_CAPACITY);
 const mark=spillwayMarks.find(m=>m.flow===spill),movable=canPlay(hydro);
 const jumps=stages[following].slice(1).filter((_,i,list)=>following==='generation'?i!==1:i<list.length-1);
 return <section className="control-dock hydro-dock" aria-label="Controlar os percursos">
  <div className="dock-top">
   <button className="primary" disabled={disabled||!movable} aria-describedby="route-status" onClick={()=>setPlaying(!playing)}>{playing?<Pause size={15}/>:<Play size={15}/>}{playing?'Pausar':'Seguir a água'}</button>
   <label className="follow-control"><span>ACOMPANHAR</span><select aria-label="Percurso acompanhado" value={following} onChange={e=>onFollow(e.target.value as Route)}><option value="spillway">Vertedouro</option><option value="generation">Geração</option></select></label>
   <button className="icon-button" aria-label="Reiniciar experiência" onClick={reset}><RotateCcw size={18}/></button>
   <div className="phase-copy"><strong>{routeStage(following,progress)}</strong><span id="route-status" className={flowOf(hydro,following)===0?'warning':''}>{routeStatus(hydro,following)}</span></div>
  </div>
  <div className="timeline"><label htmlFor="route-progress">PERCURSO DO MARCADOR <span>{Math.round(progress*100)}%</span></label><input style={{'--progress':`${progress*100}%`} as CSSProperties} id="route-progress" type="range" min="0" max="100" step="1" value={Math.round(progress*100)} onChange={e=>onProgress(Number(e.target.value)/100)}/></div>
  <div className="phase-markers">{jumps.map(s=><button key={s.short} onClick={()=>onProgress(s.start+.02)}>Ver {s.short}</button>)}<button className="cut-control" aria-pressed={cut} onClick={()=>setCut(!cut)}>{cut?'Fechar unidade':'Abrir unidade'}</button></div>
  <div className="flow-controls">
   <div className="flow spillway-flow">
    <label htmlFor="spill-flow">Vazão do vertedouro <output htmlFor="spill-flow">{formatFlow(spill)}</output></label>
    <input id="spill-flow" type="range" min="0" max={SPILLWAY_CAPACITY} step="100" value={spill} aria-valuetext={`${formatFlow(spill)}, ${compare.percent} % da capacidade`} onChange={e=>onFlow('spillway',spillwayFraction(Number(e.target.value)))}/>
    <p className="flow-compare">{spill===0?'Comporta fechada.':`${compare.percent} % da capacidade · ${compare.falls.toLocaleString('pt-BR')}× a média das Cataratas`}</p>
    <div className="flow-marks" role="group" aria-label="Vazões de referência">{spillwayMarks.map(m=><button key={m.flow} aria-pressed={m.flow===spill} onClick={()=>onFlow('spillway',spillwayFraction(m.flow))}>{m.label}</button>)}</div>
    {mark&&<p className="flow-fact">{mark.detail} <a href={mark.source} target="_blank" rel="noreferrer">{mark.sourceLabel} <ArrowUpRight size={12}/></a></p>}
   </div>
   <div className="flow">
    <label htmlFor="gen-flow">Vazão da geração · ilustrativa <output htmlFor="gen-flow">{generationLabel(hydro.generationFlow)}</output></label>
    <input id="gen-flow" type="range" min="0" max="100" step="5" value={Math.round(hydro.generationFlow*100)} aria-valuetext={generationLabel(hydro.generationFlow)} onChange={e=>onFlow('generation',Number(e.target.value)/100)}/>
    <p className="flow-compare">Na usina, cada conduto leva cerca de metade da vazão média das Cataratas.</p>
   </div>
  </div>
 </section>;
}
