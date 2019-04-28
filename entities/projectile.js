class Projectile extends Solid {
  constructor(level, sourceEntityClass, pos, vel) {
    super();
    this.level = level;
    this.sourceEntityClass = sourceEntityClass;
    this.pos = pos;
    this.vel = vel;
    this.collisionMask = new CollisionMask(CollisionMask.CIRCLE, pos, 1);
    this.hasCollided = false;
    this.willCollide = false;
    this.previousPositions = Array.from({ length: 1 }, () => this.pos.copy());
  }

  update(deltaT) {
    this.hasCollided = this.willCollide;
    this.previousPositions.shift();
    if (this.hasCollided && this.previousPositions.length === 0) {
      this.level.removeEntity(this);
    }
    if (this.hasCollided) return;
    this.previousPositions.push(this.pos.copy());
    const result = traceRay(this.pos, this.vel, [Solid], [this.sourceEntityClass, Projectile], this.vel.mag() * deltaT / 1000);
    if (result) {
      const { distance, closest } = result;
      this.pos.add(this.vel.copy().setMag(distance + 0.1));
      checkAllCollisions([ closest ], this);
      // this.level.removeEntity(this);
    } else {
      this.pos.add(this.vel.copy().mult(deltaT / 1000));
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
    this.willCollide = true;
    console.log('Projectile collision')
    return collisionResults.NONE;
  }
}

Projectile.velInterpolation = 10;
