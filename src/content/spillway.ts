import {FALLS,FLOOD_13,FLOOD_15,SPILL_PY} from './project.ts';
/** Average flow of Iguaçu Falls, m³/s (Metrópoles, 14/10/2026). */
export const FALLS_AVERAGE=1_500;
/** Sourced reference flows for the spillway control, in m³/s. */
export const spillwayMarks=[
 {flow:1_500,label:'Cataratas',detail:'Vazão média das Cataratas do Iguaçu: 1.500 m³/s.',sourceLabel:'Metrópoles, 14/10/2026',source:FALLS},
 {flow:10_700,label:'13/10',detail:'13/10/2026: 6 das 14 comportas abertas, todas na calha esquerda. Cerca de sete vezes a média das Cataratas.',sourceLabel:'O Presente, 13/10/2026',source:FLOOD_13},
 {flow:12_600,label:'15/10',detail:'15/10/2026: calhas esquerda e central abertas. É o maior valor noticiado na cheia, cerca de 20 % da capacidade.',sourceLabel:'O Presente, 15/10/2026',source:FLOOD_15},
 {flow:62_200,label:'Capacidade',detail:'Capacidade máxima do vertedouro: 62.200 m³/s, 40 vezes a média das Cataratas.',sourceLabel:'Itaipu, Vertedouro',source:SPILL_PY},
] as const;
const number=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1});
export const formatFlow=(cubicMeters:number)=>`${number.format(cubicMeters)} m³/s`;
/** Our arithmetic on the sourced numbers: share of capacity and multiple of the Falls average. */
export function compareFlow(cubicMeters:number,capacity:number){
 return {percent:Math.round(cubicMeters/capacity*100),falls:Math.round(cubicMeters/FALLS_AVERAGE*10)/10};
}
