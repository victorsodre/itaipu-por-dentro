import type {HydroState,Route} from '../simulation/hydro.ts';import {canPlay} from '../simulation/hydro.ts';
/** What the dock says about the followed route: its own flow decides whether water moves there. */
export function routeStatus(hydro:HydroState,following:Route){
 if(!canPlay(hydro))return 'As duas vazões estão em zero. Abra uma delas para a água andar.';
 if(following==='spillway')return hydro.spillwayFlow===0?'Comporta fechada: a água para antes dela e a calha fica seca.':'A comporta sobe, a água passa por baixo dela e desce pela calha. Não atravessa a turbina.';
 return hydro.generationFlow===0?'Vazão da geração em zero: nenhuma água passa pela turbina, e ela para.':'A água passa pela tomada, pelo conduto e pela turbina. O gerador gira pelo eixo.';
}
