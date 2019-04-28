const collisionResults = {
  NONE: Symbol('NONE'),
  DESTROY: Symbol('DESTROY'),
  MOVE_OUT: Symbol('MOVE_OUT'),
}

function checkCollisions(entities, entity) {
  let totalMoveOut = createVector(0, 0);
  let moveOuts = 0;
  let result = collisionResults.NONE;
  for (let i = 0; i < entities.length; i++) {
    const other = entities[i];
    if (entity === other) {
      continue;
    }
    const collisionResult = entity.collisionMask.calculateCollision(other.collisionMask);
    if (collisionResult) {
      let leftResult = entity.onCollide && entity.onCollide(other);
      let rightResult = other.onCollide && other.onCollide(entity);
      if (leftResult === collisionResults.DESTROY) {
        result = leftResult;
      }
      if (rightResult === collisionResults.DESTROY) {
        other.onDestroy && other.onDestroy();
        entities.splice(i, 1);
        i--;
      }
      if (leftResult === collisionResults.MOVE_OUT) {
        totalMoveOut.add(collisionResult.moveLeft);
        moveOuts++;
        if (result !== collisionResults.DESTROY) {
          result = collisionResults.MOVE_OUT;
        }
      }
    }
  }
  if (result === collisionResults.DESTROY) {
    entity.onDestroy && entity.onDestroy();
    level.removeEntity(entity);
    return collisionResults.DESTROY;
  }
  return {
    type: result,
    moveOuts,
    totalMoveOut,
  };
}

function checkAllCollisions(entities) {
  outer:
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const leftEntity = entities[i];
      const rightEntity = entities[j];
      const collision = leftEntity.collisionMask.calculateCollision(rightEntity.collisionMask);
      if (collision) {
        let leftResult = leftEntity.onCollide && leftEntity.onCollide(rightEntity);
        let rightResult = rightEntity.onCollide && rightEntity.onCollide(leftEntity);
        if (rightResult === collisionResults.DESTROY) {
          rightEntity.onDestroy && rightEntity.onDestroy();
          entities.splice(j, 1);
          j--;
        }
        if (leftResult === collisionResults.DESTROY) {
          leftEntity.onDestroy && leftEntity.onDestroy();
          entities.splice(i, 1);
          i --;
          continue outer;
        }
        let moving = (leftResult === collisionResults.MOVE_OUT) + (rightResult === collisionResults.MOVE_OUT);
        if (moving === 2) {
          collision.moveLeft.mult(0.5);
          collision.moveRight.mult(0.5);
        }
        if (leftResult === collisionResults.MOVE_OUT) {
          leftEntity.onMoveOut(collision.moveLeft);
        }
        if (rightResult === collisionResults.MOVE_OUT) {
          rightEntity.onMoveOut(collision.moveRight);
        }
      }
    }
  }
}

class CollisionMask {
  constructor(type, ...args) {
    this._type = type;
    this._mask = new type(...args);
  }

  calculateCollision(other) {
    if (CollisionChecks[this._type.NAME] && CollisionChecks[this._type.NAME][other._type.NAME]) {
      return CollisionChecks[this._type.NAME][other._type.NAME](this._mask, other._mask);
    }
    if (CollisionChecks[other._type.NAME] && CollisionChecks[other._type.NAME][this._type.NAME]) {
      const result = CollisionChecks[other._type.NAME][this._type.NAME](other._mask, this._mask);
      return result && {
        moveLeft: result.moveRight,
        moveRight: result.moveLeft,
      };
    }
    throw new Error(`Cannot collide pair ${this._type.NAME} ${other._type.NAME}`)
  }
}

CollisionMask.NONE = class{};
CollisionMask.NONE.NAME = "NONE";

CollisionMask.LINE = class {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}
CollisionMask.LINE.NAME = "LINE";

CollisionMask.CIRCLE = class {
  constructor(pos, radius) {
    this.pos = pos;
    this.radius = radius;
  }
};
CollisionMask.CIRCLE.NAME = "CIRCLE";

CollisionMask.RECTANGLE = class {
  constructor(top, left, bottom, right) {
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
  }
};
CollisionMask.RECTANGLE.NAME = "RECTANGLE";

const CollisionChecks = {};

function assert(val) {
  if (!val) {
    throw new Error('Assertion failed');
  }
}

CollisionChecks[CollisionMask.LINE.NAME] = {
  [CollisionMask.LINE.NAME]: (left, right) => {
    const {
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
    } = left;
    const {
      start: { x: x3, y: y3 },
      end: { x: x4, y: y4 },
    } = right;
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (abs(denominator) < 0.01) return;
    const tNumerator = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);
    if (Math.sign(tNumerator) !== Math.sign(denominator) || abs(tNumerator) > abs(denominator)) return;
    const uNumerator = - ((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3));
    if (Math.sign(uNumerator) !== Math.sign(denominator) || abs(uNumerator) > abs(denominator)) return;
    return {
      // TODO
    };
  },
  [CollisionMask.CIRCLE.NAME]: (line, circle) => {
    const { start, end } = line;
    const { pos, radius } = circle;
    let lineVector = end.copy().sub(start);
    let maxLength = lineVector.mag();
    let targetLength = lineVector.normalize().dot(pos.copy().sub(start));
    targetLength = constrain(targetLength, 0, maxLength);
    lineVector.setMag(targetLength).add(start).sub(pos);
    if (lineVector.magSq() < radius * radius) {
      return {
        // TODO
      }
    };
  },
  [CollisionMask.RECTANGLE.NAME]: (line, rectangle) => {
    const { top, left, bottom, right } = rectangle;
    return CollisionChecks[CollisionMask.LINE.NAME][CollisionMask.LINE.NAME](line, {
        start: { x: left, y: top },
        end: { x: left, y: bottom },
      }) ||
      CollisionChecks[CollisionMask.LINE.NAME][CollisionMask.LINE.NAME](line, {
        start: { x: left, y: bottom },
        end: { x: right, y: bottom },
      }) ||
      CollisionChecks[CollisionMask.LINE.NAME][CollisionMask.LINE.NAME](line, {
        start: { x: right, y: bottom },
        end: { x: right, y: top },
      }) ||
      CollisionChecks[CollisionMask.LINE.NAME][CollisionMask.LINE.NAME](line, {
        start: { x: right, y: top },
        end: { x: left, y: top },
      });
  },
};

CollisionChecks[CollisionMask.CIRCLE.NAME] = {
  [CollisionMask.CIRCLE.NAME]: (left, right) => {
    let radius = left.radius + right.radius;
    let xOff = left.pos.x - right.pos.x;
    let yOff = left.pos.y - right.pos.y;
    let magSq = yOff * yOff + xOff * xOff;
    if (magSq <= radius * radius) {
      let scale = Math.sqrt((radius * radius - magSq) / magSq);
      const resolutionVector = createVector(xOff * scale, yOff * scale);
      return {
        moveLeft: resolutionVector,
        moveRight: resolutionVector.copy().mult(-1),
      };
    }
  },
  [CollisionMask.RECTANGLE.NAME]: (leftEntity, rightEntity) => {
    const { pos: { x, y }, radius } = leftEntity;
    const { top, left, bottom, right } = rightEntity;
    if (x < left - radius || y < top - radius || x > right + radius || y > bottom + radius) {
      return;
    }
    let potentialMove = null;
    if (y > top && y < bottom && x > left - radius && x < right + radius) {
      if (2 * x < left + right) {
        potentialMove = left - radius - x;
      } else {
        potentialMove =  right + radius - x;
      }
    }
    if (x > left && x < right && y > top - radius && y < bottom + radius) {
      let newPotentialMove;
      if (2 * y < top + bottom) {
        newPotentialMove = top - radius - y;
      } else {
        newPotentialMove = bottom + radius - y;
      }
      if (!potentialMove || abs(newPotentialMove) < abs(potentialMove)) {
        return {
          moveLeft: createVector(0, newPotentialMove),
          moveRight: createVector(0, -newPotentialMove),
        };
      }
    }
    if (potentialMove) {
      return {
        moveLeft: createVector(potentialMove, 0),
        moveRight: createVector(-potentialMove, 0),
      };
    }
    return (
      CollisionChecks[CollisionMask.CIRCLE.NAME][CollisionMask.CIRCLE.NAME](leftEntity, {
        radius: 0,
        pos: createVector(left + 1, top + 1),
      }) ||
      CollisionChecks[CollisionMask.CIRCLE.NAME][CollisionMask.CIRCLE.NAME](leftEntity, {
        radius: 0,
        pos: createVector(right - 1, top + 1),
      }) ||
      CollisionChecks[CollisionMask.CIRCLE.NAME][CollisionMask.CIRCLE.NAME](leftEntity, {
        radius: 0,
        pos: createVector(left + 1, bottom - 1),
      }) ||
      CollisionChecks[CollisionMask.CIRCLE.NAME][CollisionMask.CIRCLE.NAME](leftEntity, {
        radius: 0,
        pos: createVector(right - 1, bottom - 1),
      })
    );
  }
};

CollisionChecks[CollisionMask.RECTANGLE.NAME] = {
  [CollisionMask.RECTANGLE.NAME]: (left, right) => {
    if (
      left.right <= right.left ||
      left.left >= right.right ||
      left.bottom <= right.top ||
      left.top >= right.bottom
    ) {
      return null;
    }

    const correctionVectors = [
      createVector(left.right - right.left, 0),
      createVector(left.left - right.right, 0),
      createVector(0, left.bottom - right.top),
      createVector(0, left.top - right.bottom),
    ]

    correctionVectors.sort((a, b) => a.magSq() - b.magSq());

    const moveRight = correctionVectors[0];
    return {
      moveLeft: moveRight.copy().mult(-1),
      moveRight
    }
  }
}

CollisionChecks[CollisionMask.NONE.NAME] = Object.values(CollisionMask)
  .map(other => [other.NAME, () => null])
  .reduce((obj, [k, v]) => (obj[k] = v, obj), {});
