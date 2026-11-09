import { Box3, PerspectiveCamera, Vector3 } from 'three';

export function framing(bounds: Box3, aspect: number, direction: Vector3, fov = 38) {
  const center = bounds.getCenter(new Vector3());
  const forward = direction.clone().normalize();
  // Match lookAt's vertical-view adjustment before measuring projected corners.
  if (Math.abs(forward.y) > .9999) forward.z += .001;
  forward.normalize();
  const right = new Vector3(0, 1, 0).cross(forward).normalize();
  const up = forward.clone().cross(right).normalize();
  const tanV = Math.tan(fov * Math.PI / 360), tanH = tanV * Math.max(.1, aspect);
  let distance = 1;
  for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
    const p = new Vector3(x, y, z).sub(center), toward = p.dot(forward);
    distance = Math.max(distance, Math.abs(p.dot(right)) / tanH + toward, Math.abs(p.dot(up)) / tanV + toward);
  }
  distance *= 1.08;
  return { center, distance, position: center.clone().addScaledVector(forward, distance) };
}

export function fit(camera: PerspectiveCamera, bounds: Box3, direction: Vector3) {
  const pose = framing(bounds, camera.aspect, direction, camera.fov);
  camera.position.copy(pose.position); camera.lookAt(pose.center); camera.updateProjectionMatrix();
  return pose.center;
}

/** Current orbit direction, from the target toward the camera. */
export const orbitDirection = (camera: PerspectiveCamera, target: Vector3) => camera.position.clone().sub(target);

/**
 * After an aspect change, keep the user's orbit (direction, target and zoom relative to the framing)
 * and only scale the distance so the same part of the model stays in view.
 */
export function keepOrbit(camera: PerspectiveCamera, target: Vector3, bounds: Box3, previousAspect: number) {
  const offset = orbitDirection(camera, target);
  const before = framing(bounds, previousAspect, offset, camera.fov).distance, after = framing(bounds, camera.aspect, offset, camera.fov).distance;
  camera.position.copy(target).addScaledVector(offset, after / before);
  camera.lookAt(target); camera.updateProjectionMatrix();
}
