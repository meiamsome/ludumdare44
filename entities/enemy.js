const enemyBehaviourReturns = {
  DONE_STEP: Symbol('EBR: Done step'),
  GET_DELTA_T: Symbol('EBR: Get delta time'),
}

const EPBWait = function* (enemy, time) {
  while (time > 0) {
    time -= yield enemyBehaviourReturns.GET_DELTA_T;
    yield enemyBehaviourReturns.DONE_STEP;
  }
};

const maxMoveSpeed = 120;
const EPBMoveTo = function* (enemy, position) {
  let timeDelta = (yield enemyBehaviourReturns.GET_DELTA_T) / 1000;
  let dirVector = position.copy().sub(enemy.pos);
  while (dirVector.magSq() > (maxMoveSpeed * timeDelta) ** 2) {
    enemy.pos.add(dirVector.setMag(maxMoveSpeed * timeDelta));
    yield enemyBehaviourReturns.DONE_STEP;
    yield* EPBLookAt(enemy, position);
    dirVector = position.copy().sub(enemy.pos);
    timeDelta = (yield enemyBehaviourReturns.GET_DELTA_T) / 1000;
  }
  enemy.pos.set(position);
  yield enemyBehaviourReturns.DONE_STEP;
};

const maxAngleDelta = 2 * Math.PI;
const EPBFace = function* (enemy, angle) {
  let delta = angle - enemy.facing;
  if (abs(delta) > PI) delta = PI - delta;
  let timeDelta = (yield enemyBehaviourReturns.GET_DELTA_T) / 1000;
  while (abs(delta) % TWO_PI > maxAngleDelta * timeDelta) {
    enemy.facing = (enemy.facing + constrain(delta, -maxAngleDelta * timeDelta, maxAngleDelta * timeDelta)) % TWO_PI;
    yield enemyBehaviourReturns.DONE_STEP;
    delta = angle - enemy.facing;
    if (abs(delta) > PI) delta = PI - delta;
    deltaT = (yield enemyBehaviourReturns.GET_DELTA_T) / 1000;
  }
  enemy.facing = angle % TWO_PI;
  yield enemyBehaviourReturns.DONE_STEP;
};

const EPBLookAt = function* (enemy, position) {
  const mkAngle = () => position.copy().sub(enemy.pos).heading();
  let angle = mkAngle();
  let delta = angle - enemy.facing;
  if (abs(delta) > PI) delta = PI - delta;
  let timeDelta = (yield enemyBehaviourReturns.GET_DELTA_T) / 1000;
  while (abs(enemy.facing - angle) % TWO_PI > maxAngleDelta * timeDelta) {
    enemy.facing = (enemy.facing + constrain(delta, -maxAngleDelta * timeDelta, maxAngleDelta * timeDelta)) % TWO_PI;
    yield enemyBehaviourReturns.DONE_STEP;
    angle = mkAngle();
    delta = angle - enemy.facing;
    if (abs(delta) > PI) delta = PI - delta;
    deltaT = (yield enemyBehaviourReturns.GET_DELTA_T) / 1000;
  }
  enemy.facing = angle % TWO_PI;
  yield enemyBehaviourReturns.DONE_STEP;
};


const EnemyPassiveBehaviourStandAndLook = (origin, initialFacing, delta) => function* (enemy) {
  yield* EPBMoveTo(enemy, origin);
  yield* EPBFace(enemy, initialFacing);
  while(true) {
    yield* EPBWait(enemy, 5000);
    yield* EPBFace(enemy, initialFacing + delta);
    yield* EPBWait(enemy, 200);
    yield* EPBFace(enemy, initialFacing - delta);
    yield* EPBWait(enemy, 200);
    yield* EPBFace(enemy, initialFacing);
  }
}

const EnemyPassiveBehaviourPatrol = points => function* (enemy) {
  while(true) {
    for (const { position, type, args } of points) {
      yield* EPBMoveTo(enemy, position);
      if (type) {
        yield* type(enemy, ...args);
      }
    }
  }
}

const EPBAttack = () => function* (enemy) {
  yield* EPBWait(enemy, 500);
  let lookAt = EPBLookAt(enemy, enemy.lastSawPlayerAt);
  while (true) {
    let delay = EPBWait(enemy, 500);
    let done = false;
    let value;
    let deltaT;

    waitLoop:
    while (true) {
      deltaT = yield enemyBehaviourReturns.GET_DELTA_T;
      secondLoop:
      while (true) {
        ({ done, value } = delay.next(deltaT));
        if (done) {
          break waitLoop;
        }
        switch (value) {
          case enemyBehaviourReturns.DONE_STEP:
          break secondLoop;
        }
      }

      lookAtLoop:
      while (true) {
        ({ done, value } = lookAt.next(deltaT));
        if (done) {
          lookAt = EPBLookAt(enemy, enemy.lastSawPlayerAt);
          continue;
        }
        switch (value) {
          case enemyBehaviourReturns.DONE_STEP:
            break lookAtLoop;
        }
      }

      yield enemyBehaviourReturns.DONE_STEP;
    }
    yield* lookAt;
    enemy.shoot();
    yield enemyBehaviourReturns.DONE_STEP;
  }
}

class Enemy extends OpaqueSolid {
  constructor (level, pos, facing, passiveBehaviour) {
    super();
    if (!level) return;
    const Type = class extends Enemy {
      constructor() {
        super();
        this.type = Type;
        this.level = level;
        this.pos = pos;
        this.facing = facing;
        this.fov = PI * 114 / 360;
        this.moveOutVector = createVector(0, 0);
        this.collisionMask = new CollisionMask(CollisionMask.CIRCLE, this.pos, 16);
        this.passiveBehaviour = passiveBehaviour;
        this.currentBehaviour = this.passiveBehaviour(this);
        this.alert = false;
        this.lastSawPlayerAt = null;
        this.activeVisibleBehaviour = EPBAttack()(this);
        this.activeNotVisibleBehaviour = EnemyPassiveBehaviourStandAndLook(this.pos, this.facing, PI)(this);
      }
    }
    return new Type();
  }

  update(deltaT) {
    // this.pos.x += input.keys.x;
    // this.pos.y += input.keys.y;
    this.pos.add(this.moveOutVector);
    this.moveOutVector.setMag(0);
    const {
      rays,
      seen,
    } = adaptiveTrace(this.pos, this.facing - this.fov, this.facing + this.fov, [OpaqueSolid], [this.type]);//, 50**2, 5, 500);
    this.rays = rays;
    let seesPlayer = seen.has(level.player);
    if (seesPlayer) {
      if (!this.lastSawPlayerAt) {
        this.level.player.seenByCount ++;
      }
      this.alert = true;
      this.lastSawPlayerAt = level.player.pos.copy();
    }
    if (!this.alert) {
      for (const entity of seen.values()) {
        if (entity instanceof Enemy && entity.alert) {
          this.alert = true;
        }
      }
    }

    let behaviour = this.currentBehaviour;
    if (this.alert) {
      if (seesPlayer) {
        behaviour = this.activeVisibleBehaviour;
      } else {
        behaviour = this.activeNotVisibleBehaviour;
      }
    }
    outer:
    while (true) {
      let { value } = behaviour.next(deltaT);
      switch(value) {
        case enemyBehaviourReturns.DONE_STEP:
          break outer;
        case enemyBehaviourReturns.GET_DELTA_T:
          continue;
        default:
          throw new Error('Invalid yield from enemy behaviour')
      }
    }
  }

  draw() {
    if (this.level.debug) {
      noStroke()
      fill(255, 100);
      beginShape();
      vertex(this.pos.x, this.pos.y);
      for (const { position } of this.rays) {
        vertex(position.x, position.y);
      }
      endShape();
    }

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.facing);
    if (this.alert) {
      fill(255, 0, 0);
    } else {
      fill(255, 100, 100);
    }
    stroke(0);
    circle(0, 0, 16);
    line(0, 0, 16, 0);

    pop();
  }

  shoot() {
    const direction = p5.Vector.fromAngle(this.facing);
    const position = direction
      .copy()
      .setMag(16)
      .add(this.pos);
    const vel = direction
      .copy()
      .setMag(2500);
    const projectile = new Projectile(this.level, this.type, position, vel);
    this.level.addEntity(projectile);
  }

  onCollide(entity) {
    if (entity instanceof Projectile) {
      if (entity.sourceEntityClass !== this.type) {
        this.deathDirection = entity.vel.copy().mult(0.3);
        return collisionResults.DESTROY;
      }
    }
    if (entity instanceof Solid) {
      return collisionResults.MOVE_OUT;
    }
  }

  onDestroy() {
    const count = random(10, 50);
    for(let i = 0; i < count; i ++) {
      this.level.addEntity(new Gem(
        this.level,
        random([1, 1, 1, 1, 2, 2, 5]),
        this.pos.copy(),
        p5.Vector.random2D()
          .setMag(random(180, 300))
          .add(this.deathDirection),
        random(0.5, 0.9)
      ))
    }
  }

  onMoveOut(movement) {
    this.moveOutVector.add(movement);
  }
}
