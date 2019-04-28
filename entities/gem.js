class Gem {
  constructor(level, value, pos, vel, deccel, isPlayer) {
    this.level = level;
    this.value = value;
    this.pos = pos;
    this.vel = vel;
    this.deccel = deccel;
    this.isPlayer = isPlayer;
    this.size = [0, 3, 5, 0, 0, 10][value];
    this.color = [
      null,
      [255, 0, 0],
      [0, 255, 0],
      null,
      null,
      [0, 0, 255],
    ][value];
    this.alpha = 255;
    this.collisionMask = new CollisionMask(CollisionMask.CIRCLE, this.pos, this.size);
  }

  onCollide(entity) {
    if (entity instanceof Player) {
      if (!this.isPlayer) {
        this.level.collectGem(this);
        return collisionResults.DESTROY;
      }
    } else if (entity instanceof Solid) {
      return collisionResults.MOVE_OUT;
    }
  }

  onMoveOut(movement) {
    this.pos.add(movement);
    movement.normalize();
    this.vel.sub(movement.mult(this.vel.dot(movement)).mult(2));
  }

  update(deltaT) {
    // this.pos.add(this.vel);
    let mag = this.vel.mag() * deltaT / 1000;
    for (let i = 0; i < 10 && mag > 0.1; i++) {
      const result = traceRay(this.pos, this.vel, gemCollisionIncludes, this.isPlayer ? playerGemCollisionExcludes : gemCollisionExcludes, mag);
      if (result) {
        const { distance, closest } = result;
        this.pos.add(this.vel.copy().setMag(distance + 0.01));
        const collision = checkCollisions([closest], this);
        this.pos.add(this.vel.copy().setMag(-0.01));
        if (collision === collisionResults.DESTROY) return;
        if (collision && collision.totalMoveOut) {
          const { totalMoveOut } = collision;
          totalMoveOut.normalize();
          this.vel.sub(totalMoveOut.mult(this.vel.dot(totalMoveOut)).mult(2));
        }
        mag -= distance;
      } else {
        this.pos.add(this.vel.copy().setMag(mag));
        mag = 0;
      }
    }



    this.vel.mult(this.deccel);
    // TODO: move toward player when close?
    if (!this.level.player.dead && !this.isPlayer) {
      const toPlayer = this.level.player.pos.copy().sub(this.pos);
      toPlayer.setMag(max(0, 200 - toPlayer.mag()) / 200);
      this.vel.add(toPlayer.mult(18 * deltaT));
    }
    if (this.isPlayer) {
      this.alpha *= 0.9;
      if (this.alpha < 2) {
        this.level.removeEntity(this);
      }
    }
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(QUARTER_PI);
    stroke(0);
    fill(...this.color, this.alpha);
    rect(-this.size/2, -this.size/2, this.size, this.size);
    pop();
  }
}

const gemCollisionIncludes = [Solid];
const gemCollisionExcludes = [Gem];
const playerGemCollisionExcludes = [Gem, Player];
