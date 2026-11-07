import type * as T from 'three';
import type {HydroState,Route} from '../simulation/hydro.ts';
import type {PathView} from './rig.ts';
import type { PartId } from '../content/catalog.ts';
export type Part = { id: PartId; label: string; detail: string; note: string; source: string; group: T.Group };
export type ViewState = { hydro: HydroState; pathView: PathView; following: Route; cut: boolean; selected: string | null; isolated: boolean; wireframe: boolean };
export type SceneHandle = {
  parts: Part[]; update: (state: ViewState) => void;
  home: () => void; focus: (id: string) => void; zoom: (factor: number) => void;
  capture: (portrait?: boolean) => void; dispose: () => void;
};
