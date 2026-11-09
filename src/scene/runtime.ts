import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createModel, DIORAMA_BOUNDS, DEFAULT_DIRECTION } from './model.ts';
import { applyHydro } from './rig.ts';
import { initialState } from '../simulation/hydro.ts';
import { fit, keepOrbit, orbitDirection } from './camera.ts';
import { isTap, type PointerSample } from './pointer.ts';
import { saveSceneImage } from './capture.ts';
import type { SceneHandle, ViewState } from './types.ts';

export function createScene(host: HTMLElement, onSelect: (id: string) => void, onError: (text: string) => void): SceneHandle {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));renderer.localClippingEnabled = true;
  renderer.toneMapping = T.ACESFilmicToneMapping;renderer.toneMappingExposure = 1;renderer.shadowMap.enabled = true;renderer.shadowMap.type = T.PCFShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Corte educativo de Itaipu em 3D, com a unidade geradora e o vertedouro. Arraste para girar ou selecione um conjunto na lista.');
  host.append(canvas);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(38, 1, .1, 400);
  const controls = new OrbitControls(camera, canvas);controls.enableDamping = false;controls.minDistance = 1;controls.maxDistance = 180;
  // OrbitControls blocks every touch gesture; let vertical swipes scroll the page and keep horizontal drags and pinch for the model.
  canvas.style.touchAction = 'pan-y';
  const room = new RoomEnvironment(), pmrem = new T.PMREMGenerator(renderer), env = pmrem.fromScene(room, .04);scene.environment = env.texture;scene.environmentIntensity = .5;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight('#dbe8ff', '#483d30', 1.15));
  const key = new T.DirectionalLight('#fff1d2', 2.5);key.position.set(10, 25, 18);key.castShadow = true;key.shadow.mapSize.set(1024, 1024);key.shadow.camera.left = -30;key.shadow.camera.right = 30;key.shadow.camera.top = 24;key.shadow.camera.bottom = -24;key.shadow.camera.far = 90;key.shadow.bias = -.0005;scene.add(key);
  const rim = new T.DirectionalLight('#b4d3ff', 1.9);rim.position.set(-6, 5, -5);scene.add(rim);
  const model = createModel();scene.add(model.root);
  const highlight = new T.BoxHelper(new T.Object3D(), '#ffd21f');highlight.visible = false;scene.add(highlight);
  let state: ViewState = { hydro: initialState(), pathView: 'compare', following: 'spillway', cut: true, selected: null, isolated: false, wireframe: false };
  let disposed = false, active = false, contextLost = false, last = -Infinity;
  let previousPose: {position: T.Vector3; target: T.Vector3} | null = null;
  const selectedPart = () => model.parts.find(p => p.id === state.selected);
  const bounds = () => state.isolated && selectedPart() ? new T.Box3().setFromObject(selectedPart()!.group) : DIORAMA_BOUNDS;
  const invalidate = () => {if (disposed || active || document.hidden || contextLost) return;active = true;renderer.setAnimationLoop(frame);};
  function frame(time: number) {
    if (time - last < 1000 / 30) return;last = time;
    renderer.render(scene, camera);
    const data = canvas.dataset;data.renderCount = String(Number(data.renderCount ?? 0) + 1);
    data.drawCalls = String(renderer.info.render.calls);data.triangles = String(renderer.info.render.triangles);
    data.cameraPose = JSON.stringify([...camera.position.toArray(), ...controls.target.toArray()]);
    renderer.setAnimationLoop(null);active = false;
  }
  /** Frames the bounds from a direction; the explicit reset uses the default one, everything else keeps the user's orbit. */
  const frameFrom = (box: T.Box3, direction: T.Vector3) => {controls.target.copy(fit(camera, box, direction));controls.update();invalidate();};
  const home = () => frameFrom(bounds(), DEFAULT_DIRECTION);
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();if (width < 1 || height < 1) return;
    const current = renderer.getSize(new T.Vector2()), previousAspect = camera.aspect, aspect = width / height;
    if (current.x !== width || current.y !== height) renderer.setSize(width, height);
    camera.aspect = aspect;camera.updateProjectionMatrix();
    if (Math.abs(previousAspect - aspect) > .0001) {keepOrbit(camera, controls.target, bounds(), previousAspect);controls.update();}
    invalidate();
  };
  const observer = new ResizeObserver(resize);observer.observe(host);controls.addEventListener('change', invalidate);
  // The wheel scrolls the page; Ctrl/⌘ + wheel (and trackpad pinch, which sets ctrlKey) zooms the model.
  const wheel = (e: WheelEvent) => {if (!e.ctrlKey && !e.metaKey) e.stopImmediatePropagation();};
  host.addEventListener('wheel', wheel, { capture: true });
  // A selection needs a real tap: one pointer, short, almost still. Drags, pinches and taps on empty space change nothing.
  const pointers = new Map<number, PointerSample>();let multiTouch = false;
  const pointerDown = (e: PointerEvent) => {pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, time: e.timeStamp });if (pointers.size > 1) multiTouch = true;};
  const pointerEnd = (e: PointerEvent) => {
    const start = pointers.get(e.pointerId);pointers.delete(e.pointerId);
    const tap = e.type === 'pointerup' && start && !multiTouch && isTap(start, { x: e.clientX, y: e.clientY, time: e.timeStamp });
    if (!pointers.size) multiTouch = false;
    if (!tap) return;
    const rect = canvas.getBoundingClientRect(), ray = new T.Raycaster(), candidates: T.Mesh[] = [];
    ray.setFromCamera(new T.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), camera);
    for (const part of model.parts) part.group.traverseVisible(o => {if (o instanceof T.Mesh) candidates.push(o);});
    const hits = ray.intersectObjects(candidates, false).filter(hit => {
      const materials = Array.isArray((hit.object as T.Mesh).material) ? (hit.object as T.Mesh).material as T.Material[] : [(hit.object as T.Mesh).material as T.Material];
      return !materials.some(m => m.clippingPlanes?.some(p => p.distanceToPoint(hit.point) < 0));
    });
    let current: T.Object3D | undefined = hits[0]?.object;
    while (current && !current.userData.partId) current = current.parent ?? undefined;
    if (current) onSelect(current.userData.partId);
  };
  canvas.addEventListener('pointerdown', pointerDown);canvas.addEventListener('pointerup', pointerEnd);canvas.addEventListener('pointercancel', pointerEnd);
  const visibility = () => {if (document.hidden) {renderer.setAnimationLoop(null);active = false;} else {last = -Infinity;invalidate();}};
  document.addEventListener('visibilitychange', visibility);
  const lost = (e: Event) => {e.preventDefault();contextLost = true;renderer.setAnimationLoop(null);active = false;onError('A cena 3D foi interrompida. Recarregue para restaurá-la. As explicações e fontes continuam disponíveis.');};
  canvas.addEventListener('webglcontextlost', lost);
  applyHydro(model, state.hydro, state.cut, state.pathView, state.following);resize();home();
  return {
    parts: model.parts,
    update(next) {
      const previous = state;state = next;
      applyHydro(model, state.hydro, state.cut, state.pathView, state.following);
      if (previous.wireframe !== state.wireframe) model.root.traverse(o => {if (o instanceof T.Mesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m instanceof T.MeshStandardMaterial) m.wireframe = state.wireframe;});
      if (previous.isolated !== state.isolated || previous.selected !== state.selected) {
        model.helpers.visible = !state.isolated;
        for (const part of model.parts) part.group.visible = !state.isolated || part.id === state.selected;
        const selected = selectedPart();highlight.visible = Boolean(selected) && !state.isolated;
        if (selected) highlight.setFromObject(selected.group);
      }
      if (!previous.isolated && state.isolated) {previousPose = {position: camera.position.clone(), target: controls.target.clone()};frameFrom(bounds(), orbitDirection(camera, controls.target));}
      if (previous.isolated && !state.isolated && previousPose) {camera.position.copy(previousPose.position);controls.target.copy(previousPose.target);controls.update();previousPose = null;}
      canvas.dataset.hydro = JSON.stringify(state.hydro);canvas.dataset.pathView = state.pathView;canvas.dataset.cut = String(state.cut);invalidate();
    },
    home,
    focus(id) {const part = model.parts.find(p => p.id === id);if (part) frameFrom(new T.Box3().setFromObject(part.group), orbitDirection(camera, controls.target));},
    zoom(factor) {camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();invalidate();},
    capture(portrait = false) {saveSceneImage(renderer, scene, camera, bounds(), portrait);invalidate();},
    dispose() {
      disposed = true;renderer.setAnimationLoop(null);observer.disconnect();controls.removeEventListener('change', invalidate);controls.dispose();
      host.removeEventListener('wheel', wheel, { capture: true });
      canvas.removeEventListener('pointerdown', pointerDown);canvas.removeEventListener('pointerup', pointerEnd);canvas.removeEventListener('pointercancel', pointerEnd);canvas.removeEventListener('webglcontextlost', lost);document.removeEventListener('visibilitychange', visibility);
      model.dispose();env.dispose();highlight.geometry.dispose();(highlight.material as T.Material).dispose();renderer.dispose();canvas.remove();
    },
  };
}
