const collisionResults = {
  NONE: Symbol('NONE'),
  DESTROY: Symbol('DESTROY'),
  MOVE_OUT: Symbol('MOVE_OUT'),
}

function checkCollisions(entity) {
  let result = collisionResults.NONE;
  for (let i = 0; i < entities.length; i++) {
    const other = entities[i];
    if (entity === other) {
      continue;
    }
    if (entity.collisionMask.calculateCollision(other.collisionMask)) {
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
    }
  }
  if (result === collisionResults.DESTROY) {
    entity.onDestroy && entity.onDestroy();
    removeEntity(entity);
  }
  return result;
}

function checkAllCollisions() {
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
    if (CollisionChecks[this._type] && CollisionChecks[this._type][other._type]) {
      return CollisionChecks[this._type][other._type](this._mask, other._mask);
    }
    if (CollisionChecks[other._type] && CollisionChecks[other._type][this._type]) {
      const result = CollisionChecks[other._type][this._type](other._mask, this._mask);
      return result && {
        moveLeft: result.moveRight,
        moveRight: result.moveLeft,
      };
    }
    throw new Error(`Cannot collide pair ${this._type.NAME} ${other._type.NAME}`)
  }
}

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

CollisionChecks[CollisionMask.CIRCLE] = {
  [CollisionMask.CIRCLE]: (left, right) => {
    const lToR = left.pos.copy().sub(right.pos);
    if (lToR.magSq() <= (left.radius + right.radius) * (left.radius + right.radius)) {
      const resolutionVector = lToR.copy().setMag(left.radius + right.radius - lToR.mag());
      return {
        moveLeft: resolutionVector,
        moveRight: resolutionVector.copy().mult(-1),
      };
    }
  },
  [CollisionMask.RECTANGLE]: (leftEntity, rightEntity) => {
    const { pos: { x, y }, radius } = leftEntity;
    const { top, left, bottom, right } = rightEntity;
    if (y > top && y < bottom && x > left - radius && x < right + radius) {
      if (2 * x < left + right) {
        return {
          moveLeft: createVector(left - radius - x, 0),
          moveRight: createVector(x - left + radius, 0),
        };
      } else {
        return {
          moveLeft: createVector(right + radius - x, 0),
          moveRight: createVector(x - right - radius, 0),
        };
      }
    }
    if (x > left && x < right && y > top - radius && y < bottom + radius) {
      if (2 * y < top + bottom) {
        return {
          moveLeft: createVector(0, top - radius - y),
          moveRight: createVector(0, y - top + radius),
        };
      } else {
        return {
          moveLeft: createVector(0, bottom + radius - y),
          moveRight: createVector(0, y - bottom - radius),
        };
      }
    }
    return (
      CollisionChecks[CollisionMask.CIRCLE][CollisionMask.CIRCLE](leftEntity, {
        radius: 0,
        pos: createVector(left, top),
      }) ||
      CollisionChecks[CollisionMask.CIRCLE][CollisionMask.CIRCLE](leftEntity, {
        radius: 0,
        pos: createVector(right, top),
      }) ||
      CollisionChecks[CollisionMask.CIRCLE][CollisionMask.CIRCLE](leftEntity, {
        radius: 0,
        pos: createVector(left, bottom),
      }) ||
      CollisionChecks[CollisionMask.CIRCLE][CollisionMask.CIRCLE](leftEntity, {
        radius: 0,
        pos: createVector(right, bottom),
      })
    );
  }
};
