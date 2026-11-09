import { video } from './content/video.ts';
import { VideoSection } from './kit/VideoSection.tsx';
import { CollectionNav } from './kit/CollectionNav.tsx';
import { labNumber } from './kit/collection.ts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Box, ChevronRight, Download, Focus, Layers3, Maximize, Minus, Plus, Search, X } from 'lucide-react';
import { Brand } from './kit/Brand.tsx';
import { Sources } from './ui/Sources.tsx';
import { CycleControls } from './ui/CycleControls.tsx';
import { createScene } from './scene/runtime.ts';
import { advance, canPlay, initialState, setFlow, setProgress } from './simulation/hydro.ts';
import type {Route} from './simulation/hydro.ts';
import type {PathView} from './scene/rig.ts';
import { project } from './content/project.ts';
import { catalog } from './content/catalog.ts';
import type { Part, SceneHandle } from './scene/types.ts';

const count = catalog.length, countLabel = String(count).padStart(2, '0'), number = labNumber('itaipu-por-dentro');

export function App() {
  const workspace = useRef<HTMLElement>(null), host = useRef<HTMLDivElement>(null), scene = useRef<SceneHandle | null>(null), inspector = useRef<HTMLElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const [parts, setParts] = useState<Part[]>([]), [hydro, setHydro] = useState(initialState), [pathView, setPathView] = useState<PathView>('compare'), [following,setFollowing] = useState<Route>('spillway'), [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null), [isolated, setIsolated] = useState(false), [cut, setCut] = useState(true), [wireframe, setWireframe] = useState(false);
  const [sources, setSources] = useState(false), [drawer, setDrawer] = useState(false), [search, setSearch] = useState(''), [tour, setTour] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null), [notice, setNotice] = useState('');
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Selecting a part (list, 3D tap or Escape) never stops the water: only the play button, isolation and the tour do.
  const select = useCallback((id: string | null) => {setSelected(id);setIsolated(false);setTour(null);}, []);
  const current = catalog.find(p => p.id === selected);
  const normalize = (value: string) => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  useEffect(() => {
    if (!host.current) return;
    let cancelled=false;
    document.fonts.ready.then(()=>{
      if(cancelled||!host.current)return;
      try{scene.current=createScene(host.current,select,text=>{setError(text);setPlaying(false);});setParts(scene.current.parts);}
      catch{setError('Seu navegador não conseguiu abrir a cena 3D. As explicações e fontes continuam disponíveis.');}
    });
    return()=>{cancelled=true;scene.current?.dispose();scene.current=null;};
  }, [select]);
  useEffect(() => {scene.current?.update({hydro, pathView, following, cut, selected, isolated, wireframe});}, [hydro, pathView, following, cut, selected, isolated, wireframe, parts]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => {setReduced(media.matches);if (media.matches) setPlaying(false);};
    media.addEventListener('change', change);return () => media.removeEventListener('change', change);
  }, []);
  const movable = canPlay(hydro);
  useEffect(() => {if (!movable) setPlaying(false);}, [movable]);
  useEffect(() => {
    if (!playing||!movable) return;let id=0,last=performance.now();
    const tick=(now:number)=>{if(now-last>=32){const dt=(now-last)/1000;last=now;setHydro(s=>advance(s,dt,true,!document.hidden));}if(!document.hidden)id=requestAnimationFrame(tick);};
    const visibility=()=>{cancelAnimationFrame(id);last=performance.now();if(!document.hidden)id=requestAnimationFrame(tick);};
    visibility();document.addEventListener('visibilitychange',visibility);return()=>{cancelAnimationFrame(id);document.removeEventListener('visibilitychange',visibility);};
  }, [playing,movable]);
  // The desktop dock grows with its text; the scene ends above it instead of sitting under it.
  useEffect(() => {
    const main = workspace.current, dock = main?.querySelector<HTMLElement>('.control-dock');if (!main || !dock) return;
    const observer = new ResizeObserver(() => main.style.setProperty('--dock', `${dock.offsetHeight}px`));observer.observe(dock);return () => observer.disconnect();
  }, []);
  useEffect(() => {if (drawer) dialog.current?.showModal();else dialog.current?.close();}, [drawer]);
  useEffect(() => {if (selected && innerWidth <= 900) {const id = requestAnimationFrame(() => inspector.current?.scrollIntoView({block: 'nearest', behavior: reduced ? 'instant' : 'smooth'}));return () => cancelAnimationFrame(id);}}, [selected, reduced]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (document.querySelector('dialog[open]') || e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || sources || drawer) return;
      if (e.key.toLowerCase() === 'r') scene.current?.home();
      if (e.key === 'Escape') select(null);
    };
    document.addEventListener('keydown', key);return () => document.removeEventListener('keydown', key);
  }, [select, sources, drawer]);
  function reset() {setHydro(initialState());setPathView('compare');setFollowing('spillway');setPlaying(false);setSelected(null);setIsolated(false);setWireframe(false);setCut(true);setTour(null);setSearch('');requestAnimationFrame(() => scene.current?.home());setNotice('Experiência reiniciada.');}
  function guide(index: number) {const p = parts[index];if (!p) return;setTour(index);setSelected(p.id);setIsolated(false);setPlaying(false);requestAnimationFrame(() => scene.current?.focus(p.id));}
  async function fullscreen() {try {if (document.fullscreenElement) await document.exitFullscreen();else await document.documentElement.requestFullscreen();} catch {setNotice('Tela cheia não disponível neste navegador.');}}
  const follow = (route: Route) => {setFollowing(route);setPathView(route);setIsolated(false);};
  const matches = catalog.filter(p => normalize(p.label).includes(normalize(search)));
  const list = () => <><label className="search"><Search size={16}/><input aria-label="Encontrar conjunto" placeholder="Encontrar conjunto" value={search} onChange={e => setSearch(e.target.value)}/><span>{countLabel}</span></label><div className="parts-list">{matches.map((p) => <button className={'part-row' + (p.id === selected ? ' selected' : '')} key={p.id} aria-pressed={p.id === selected} onClick={() => {select(p.id);setDrawer(false);}}><span>{String(catalog.indexOf(p) + 1).padStart(2, '0')}</span><strong>{p.label}</strong><ChevronRight size={14}/></button>)}{!matches.length && <small className="search-hint">Nenhum conjunto encontrado.</small>}</div></>;
  return <div className="app"><header className="header"><Brand/><div className="collection-label">ENERGIA EM MOVIMENTO <span>/</span> LAB {number}</div><a className="video-link" href="#video">Ver o vídeo <ArrowUpRight size={16}/></a></header>
    <main className="workspace" ref={workspace}><div className="heading"><p className="eyebrow"><span/> EXPERIMENTO {number} <i>—</i> DOIS CAMINHOS PARA A ÁGUA</p><h1>ITAIPU<br/>POR DENTRO<span>.</span></h1><p className="intro">{project.intro}</p></div>
      <div className="canvas-region"><div className="scene-host" ref={host}/>{error && <div className="scene-error" role="alert"><Box size={28}/><h2>Cena indisponível</h2><p>{error}</p><button className="primary" onClick={() => location.reload()}>Tentar novamente</button></div>}<div className="scene-mode"><span className={'status-dot' + (playing ? ' active' : '')}/>{isolated ? 'CONJUNTO ISOLADO' : pathView === 'compare' ? 'DOIS CAMINHOS' : pathView === 'generation' ? 'GERAÇÃO' : 'VERTEDOURO'}<span className="mode-divider"/>SEM ESCALA</div><div className="orbit-hint"><span className="hint-fine">Arraste para girar <i>·</i> Ctrl ou ⌘ + rolagem aproxima</span><span className="hint-coarse">Deslize para o lado para girar <i>·</i> Pinça aproxima</span></div></div>
      <aside className="sidebar"><div className="sidebar-label">DA ÁGUA À ELETRICIDADE.</div>{list()}<div className="sidebar-foot"><span className="mini-line"/><p>A água que gera passa pela turbina.<br/>A que sobra desce pelo vertedouro.</p><button className="text-button" disabled={!parts.length || Boolean(error)} onClick={() => guide(0)}>Conhecer a usina <ArrowRight size={15}/></button></div></aside>
      <nav className="view-switch" aria-label="Separar caminhos">{([['spillway','Vertedouro'],['generation','Geração'],['compare','Comparar']] as const).map(([id,label])=><button key={id} aria-pressed={pathView===id} className={pathView===id?'active':''} onClick={()=>{setPathView(id);setIsolated(false);if(id!=='compare')setFollowing(id);}}>{label}</button>)}</nav>
      <div className="path-legend"><span><i className="spillway-color"/>VERTEDOURO · SAÍDA INDEPENDENTE</span><span><i className="generation-color"/>GERAÇÃO · PASSA PELA TURBINA</span></div>
      <div className="camera-tools"><button aria-label="Aproximar" disabled={!parts.length} onClick={() => scene.current?.zoom(.85)}><Plus size={18}/></button><button aria-label="Afastar" disabled={!parts.length} onClick={() => scene.current?.zoom(1.15)}><Minus size={18}/></button><span/><button aria-label="Reenquadrar" onClick={() => scene.current?.home()}><Focus size={18}/></button><button aria-label="Mostrar malha" aria-pressed={wireframe} onClick={() => setWireframe(v => !v)}><Box size={18}/></button><span/><button aria-label="Salvar imagem PNG" disabled={!parts.length || Boolean(error)} onClick={() => scene.current?.capture()}><Download size={18}/></button><button className="format-button" aria-label="Salvar imagem vertical 9 por 16" disabled={!parts.length || Boolean(error)} onClick={() => scene.current?.capture(true)}>9:16</button>{Boolean(document.documentElement.requestFullscreen) && <button aria-label="Tela cheia" onClick={fullscreen}><Maximize size={17}/></button>}</div>
      {current && <section className="inspector" ref={inspector} aria-label="Conjunto selecionado"><div className="inspector-top"><span className="eyebrow">{tour === null ? 'EM DETALHE' : `CONHEÇA A USINA · ${tour + 1}/${count}`}</span><button className="icon-button" aria-label="Fechar detalhe" onClick={() => select(null)}><X size={16}/></button></div><h2>{current.label}</h2><p>{current.detail}</p><small>{current.note}</small><a className="part-source" href={current.source} target="_blank" rel="noreferrer">Consultar a fonte <ArrowUpRight size={12}/></a><div className="inspector-actions"><button disabled={!parts.length || Boolean(error)} aria-pressed={isolated} onClick={() => {setIsolated(v => !v);setPlaying(false);}}><Layers3 size={14}/>{isolated ? 'Ver usina inteira' : 'Isolar'}</button><button disabled={!parts.length || Boolean(error)} onClick={() => scene.current?.focus(current.id)}><Focus size={14}/>Aproximar</button></div>{tour !== null && <div className="inspector-actions"><button disabled={tour === 0} onClick={() => guide(tour - 1)}><ArrowLeft size={14}/>Anterior</button><button onClick={() => tour < count - 1 ? guide(tour + 1) : setTour(null)}>{tour < count - 1 ? 'Próximo conjunto' : 'Concluir'}<ArrowRight size={14}/></button></div>}</section>}
      <div className="mobile-actions"><button onClick={() => setDrawer(true)}><Layers3 size={16}/>Conjuntos <span>{count}</span></button><button disabled={!parts.length || Boolean(error)} onClick={() => guide(0)}>Conhecer a usina <ArrowRight size={16}/></button></div>
      <CycleControls hydro={hydro} following={following} playing={playing} cut={cut} disabled={!parts.length||Boolean(error)} setPlaying={setPlaying} setCut={setCut} onFollow={follow} onFlow={(route,value)=>setHydro(s=>setFlow(s,route,value))} onProgress={value=>{setPlaying(false);setIsolated(false);setHydro(s=>setProgress(s,following,value));}} reset={reset}/>
      <p className="mechanism-note">VERTEDOURO COM NÚMEROS DA ITAIPU E DA CHEIA DE OUTUBRO DE 2026 · ABERTURA DA COMPORTA ILUSTRATIVA · A ÁGUA NÃO PASSA PELO GERADOR</p>
    </main><VideoSection video={video}/><footer><span>UM EXPERIMENTO DO OVICTORLAB <i>© 2026</i></span><button onClick={() => setSources(true)}>Como funciona · Fontes e créditos <ArrowUpRight size={13}/></button><CollectionNav current="itaipu-por-dentro"/></footer>
    <Sources open={sources} onClose={() => setSources(false)}/><dialog ref={dialog} className="parts-dialog" aria-label="Conjuntos da usina" onClose={() => setDrawer(false)}><div className="dialog-top"><span className="eyebrow">CONHEÇA A USINA</span><button className="icon-button" aria-label="Fechar conjuntos" onClick={() => setDrawer(false)}><X size={18}/></button></div>{list()}</dialog><span className="sr-only" role="status" aria-live="polite">{notice}</span>
  </div>;
}
