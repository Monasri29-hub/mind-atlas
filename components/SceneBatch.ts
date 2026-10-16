import * as T from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { WorldBuild } from './WorldArchitecture';

/** Batch opaque static meshes, keeping moving objects and project picking independent. */
export function batchWorld(parent: T.Group, built: WorldBuild) {
  const moving = new Set(built.animations.map(a => a.object));
  const scopes: T.Object3D[] = [parent, ...built.exhibits];
  parent.updateWorldMatrix(true, true);
  for (const scope of scopes) {
    const inverse = scope.matrixWorld.clone().invert();
    const buckets = new Map<string, T.Mesh[]>();
    scope.traverse(object => {
      if (!(object instanceof T.Mesh) || object instanceof T.InstancedMesh || object.children.length || Array.isArray(object.material) || object.material.transparent) return;
      let ancestor: T.Object3D | null = object;
      while (ancestor && ancestor !== scope) {
        if (moving.has(ancestor) || ancestor.userData.project) return;
        ancestor = ancestor.parent;
      }
      const key = object.material.uuid + Object.keys(object.geometry.attributes).sort().join(',');
      const bucket = buckets.get(key) || []; bucket.push(object); buckets.set(key, bucket);
    });
    for (const objects of buckets.values()) {
      if (objects.length < 2) continue;
      const geometries = objects.map(object => {
        const transform = inverse.clone().multiply(object.matrixWorld);
        const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
        geometry.applyMatrix4(transform);
        // A reflected mesh needs reversed winding once its transform is baked.
        if (transform.determinant() < 0) for (const attribute of Object.values(geometry.attributes)) {
          const attr = attribute as T.BufferAttribute, array = attr.array, stride = attr.itemSize;
          for (let i = 0; i < attr.count; i += 3) for (let j = 0; j < stride; j++) {
            const b = (i + 1) * stride + j, c = (i + 2) * stride + j, value = array[b];
            array[b] = array[c]; array[c] = value;
          }
        }
        return geometry;
      });
      const geometry = mergeGeometries(geometries, false);
      geometries.forEach(g => g.dispose());
      if (!geometry) continue;
      const batch = new T.Mesh(geometry, objects[0].material); batch.name = 'Static architecture'; scope.add(batch);
      objects.forEach(object => object.removeFromParent());
    }
  }
  parent.updateWorldMatrix(true, true);
}
