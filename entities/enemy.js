const EPBWait = function* (enemy, time) {
  let endTime = Date.now() + time;
  while (Date.now() < endTime) yield;
};

const EPBMoveTo = function* (enemy, position) {
  let dirVector = position.copy().sub(enemy.pos).setMag(4);
  while ((position.x - enemy.pos.x) ** 2 + (position.y - enemy.pos.y) ** 2 > 4 ** 2) {
    dirVector = position.copy().sub(enemy.pos).setMag(4);
    yield* EPBLookAt(enemy, position);
    yield enemy.pos.add(dirVector);
  }
  yield enemy.pos.set(position);
};

const EPBFace = function* (enemy, angle) {
  let delta = angle - enemy.facing;
  if (abs(delta) > PI) delta = PI - delta;
  while (abs(delta) % TWO_PI > PI/256) {
    enemy.facing = (enemy.facing + constrain(delta, -PI/256, PI/256)) % TWO_PI;
    yield;
    delta = angle - enemy.facing;
    if (abs(delta) > PI) delta = PI - delta;
  }
  enemy.facing = angle % TWO_PI;
};

const EPBLookAt = function* (enemy, position) {
  const mkAngle = () => position.copy().sub(enemy.pos).heading();
  let angle = mkAngle();
  let delta = angle - enemy.facing;
  if (abs(delta) > PI) delta = PI - delta;
  while (abs(enemy.facing - angle) % TWO_PI > PI/256) {
    enemy.facing = (enemy.facing + constrain(delta, -PI/256, PI/256)) % TWO_PI;
    yield;
    angle = mkAngle();
    delta = angle - enemy.facing;
    if (abs(delta) > PI) delta = PI - delta;
  }
  enemy.facing = angle % TWO_PI;
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
  while (true) {
    let wait = EPBLookAt(enemy, enemy.lastSawPlayerAt);
    for (const _ of EPBWait(enemy, 500)) {
      const { done } = wait.next();
      yield;
      if (done) wait = EPBLookAt(enemy, enemy.lastSawPlayerAt);
    }
    yield* EPBLookAt(enemy, enemy.lastSawPlayerAt);
    yield enemy.shoot();
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

  update() {
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

    if (!this.alert) {
      this.currentBehaviour.next();
    } else {
      if (seesPlayer) {
        this.activeVisibleBehaviour.next();
      } else {
        this.activeNotVisibleBehaviour.next();
      }
    }
  }

  draw() {

    // noStroke()
    // fill(255, 100);
    // beginShape();
    // vertex(this.pos.x, this.pos.y);
    // for (const { position } of this.rays) {
    //   vertex(position.x, position.y);
    // }
    // endShape();

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
      .setMag(50);
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
          .setMag(random(3, 5))
          .add(this.deathDirection),
        random(0.5, 0.9)
      ))
    }
  }

  onMoveOut(movement) {
    this.moveOutVector.add(movement);
  }
}
