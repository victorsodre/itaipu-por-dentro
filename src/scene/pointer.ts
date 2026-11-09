export type PointerSample = { x: number; y: number; time: number };
/** Tap thresholds: anything longer or farther is an orbit drag or an accidental touch, not a selection. */
export const TAP_MAX_MOVE = 6, TAP_MAX_MS = 450;
export const isTap = (start: PointerSample, end: PointerSample) =>
  Math.hypot(end.x - start.x, end.y - start.y) <= TAP_MAX_MOVE && end.time - start.time <= TAP_MAX_MS;
