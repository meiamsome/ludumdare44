class Projectile extends Solid {
  constructor(level, sourceEntityClass, pos, vel) {
    super();
    this.level = level;
    this.sourceEntityClass = sourceEntityClass;
    this.pos = pos;
    this.vel = vel;
    this.collisionMask = new CollisionMask(CollisionMask.CIRCLE, pos, 0);
    this.hasCollided = false;
    this.previousPositions = Array.from({ length: 1 }, () => this.pos.copy());
  }

  update() {
    this.previousPositions.pop();
    if (this.hasCollided && this.previousPositions.length === 0) {
      this.level.removeEntity(this);
    }
    if (this.hasCollided) return;
    this.previousPositions.push(this.pos.copy());
    const result = traceRay(this.pos, this.vel, [Solid], [this.sourceEntityClass], this.vel.mag());
    if (result) {
      const { distance } = result;
      this.pos.add(this.vel.copy().setMag(distance + 0.01));
    } else {
      this.pos.add(this.vel);
    }
  }

  draw() {
    stroke(255);
    let previous = this.previousPositions[0];
    line(this.pos.x, this.pos.y, previous.x, previous.y);
  }

  onCollide(other) {
    if (other instanceof this.sourceEntityClass) return;
    if (!(other instanceof Solid)) return;
    this.hasCollided = true;
    console.log('Projectile collision')
    return collisionResults.NONE;
  }
}

Projectile.velInterpolation = 10;
