function _checkMatchFunction(clss, entity) {
  try {
    if (entity instanceof clss) return true;
  } catch(e) {}
  return entity === clss;
}

let memoizeHits = 0;
let memoizeMisses = 0;
let invalidationByLength = 0;
let invalidationByKey = 0;
let cache = null;
function memoize(fn, changes) {
  if (cache) {
    if (cache.keys.length !== changes.length) {
      cache = null;
      invalidationByLength ++;
    } else if (changes.some((v, i) => v !== cache.keys[i])) {
      cache = null;
      invalidationByKey ++;
    } else {
      memoizeHits ++;
    }
  }
  if (!cache) {
    memoizeMisses ++;
    cache = {
      keys: changes,
      value: fn()
    }
  }
  return cache.value;
}

function traceRay(pos, direction, include=[OpaqueSolid], ignore=[], maxDistance=4096, maxSteps=10, minSteps=10) {
  const startPos = pos.copy();
  const middlePos = direction.copy().setMag(maxDistance).add(pos);
  const endPos = middlePos.copy();

  let curDistance = maxDistance;
  let distance = 0;
  let searchEntities = memoize(() => level.entities.filter(entity => {
    if (ignore.some(x => _checkMatchFunction(x, entity))) return false;
    if (include.some(x => _checkMatchFunction(x, entity))) return true;
    return false;
  }), [level.entities.length, include, ignore]);
  let entities = [];

  const tempEntityClose = {
    collisionMask: new CollisionMask(CollisionMask.LINE, startPos, middlePos),
    onCollide(entity) {
      entities.push(entity);
    },
  }

  checkCollisions(searchEntities, tempEntityClose);
  if (!entities.length) return null;

  for (let i = 0; (i < minSteps || entities.length > 1) && i < maxSteps; i++) {
    middlePos.set(endPos.copy().add(startPos).mult(0.5));
    curDistance /= 2;
    searchEntities = entities;
    entities = [];
    checkCollisions(searchEntities, tempEntityClose);
    if (entities.length) {
      endPos.set(middlePos);
      continue;
    }
    entities = searchEntities;
    startPos.set(middlePos);
    distance += curDistance;
  }
  return {
    closest: entities[0],
    distance,
  };
}

function adaptiveTrace(pos, minAngle, maxAngle, include=[Solid], exclude=[], minDeltaSq=25 ** 2, maxSteps=10, maxDistance=1000) {
  let seen = new Set();
  let rays = [{ dir: minAngle }, { dir: (minAngle + maxAngle) / 2 }, { dir: maxAngle }];
  let lastLength = 0;
  while (lastLength !== rays.length) {
    lastLength = rays.length;
    for (const ray of rays) {
      if (!ray.distance) {
        let dir = p5.Vector.fromAngle(ray.dir);
        const result = traceRay(pos, dir, include, exclude, maxDistance);
        if (result) {
          const { closest, distance } = result;
          ray.position = dir.setMag(distance).add(pos);
          ray.distance = distance;
          ray.closest = closest;
          seen.add(closest);
        } else {
          ray.position = dir.setMag(maxDistance).add(pos);
          ray.distance = maxDistance;
        }
      }
    }

    if (maxSteps -- === 0) break;

    for (let i = 0; i < rays.length - 1; i++) {
      let { dir: leftDir, position: leftPos } = rays[i];
      let { dir: rightDir, position: rightPos } = rays[i + 1];
      let deltaX = leftPos.x - rightPos.x;
      let deltaY = leftPos.y - rightPos.y;
      let deltaSq = deltaX * deltaX + deltaY * deltaY;
      if (deltaSq > minDeltaSq) {
        rays.splice(i + 1, 0, { dir: (leftDir + rightDir) / 2 });
        i++;
      }
    }
  }

  return {
    rays,
    seen,
  };
}
