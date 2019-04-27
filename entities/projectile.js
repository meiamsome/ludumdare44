class Projectile extends Solid {
  constructor(level, sourceEntity, pos, vel) {
    super();
    this.level = level;
    this.sourceEntity = sourceEntity;
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
    const smallVel = this.vel.copy().mult(1 / Projectile.velInterpolation);
    for (var i = 0; i < Projectile.velInterpolation; i++) {
      this.pos.add(smallVel);

      this.level.checkCollisions(this);
      if (this.hasCollided) return;
    }
  }

  draw() {
    stroke(255);
    let previous = this.previousPositions[0];
    line(this.pos.x, this.pos.y, previous.x, previous.y);
  }

  onCollide(other) {
    if (other === this.sourceEntity) return;
    if (!(other instanceof Solid)) return;
    this.hasCollided = true;
    console.log('Projectile collision')
    return collisionResults.NONE;
  }
}

Projectile.velInterpolation = 10;
