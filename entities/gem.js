class Gem {
  constructor(level, value, pos, vel, deccel) {
    this.level = level;
    this.value = value;
    this.pos = pos;
    this.vel = vel;
    this.deccel = deccel;
    this.size = [0, 3, 5, 0, 0, 10][value];
    this.color = [
      null,
      [255, 0, 0],
      [0, 255, 0],
      null,
      null,
      [0, 0, 255],
    ][value];
    this.collisionMask = new CollisionMask(CollisionMask.CIRCLE, this.pos, this.size);
  }

  onCollide(entity) {
    if (entity instanceof Player) {
      this.level.collectGem(this);
      return collisionResults.DESTROY;
    }
    if (entity instanceof Solid) {
      return collisionResults.MOVE_OUT;
    }
  }

  onMoveOut(movement) {
    this.pos.add(movement);
    movement.normalize();
    this.vel.sub(movement.mult(this.vel.dot(movement)).mult(2));
  }

  update() {
    // this.pos.add(this.vel);
    let mag = this.vel.mag();
    while (mag > 0.1) {
      const result = traceRay(this.pos, this.vel, gemCollisionIncludes, gemCollisionExcludes, mag);
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
        this.pos.add(this.vel);
        mag = 0;
      }
    }



    this.vel.mult(this.deccel);
    // TODO: move toward player when close?
    if (!this.level.player.dead) {
      const toPlayer = this.level.player.pos.copy().sub(this.pos);
      toPlayer.setMag(max(0, 200 - toPlayer.mag()) / 200);
      this.vel.add(toPlayer.mult(3));
    }
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(QUARTER_PI);
    stroke(0);
    fill(...this.color);
    rect(-this.size/2, -this.size/2, this.size, this.size);
    pop();
  }
}

const gemCollisionIncludes = [Solid];
const gemCollisionExcludes = [Gem];
