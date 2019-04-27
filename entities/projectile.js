class Projectile {
  constructor(sourceEntity, pos, vel) {
    this.sourceEntity = sourceEntity;
    this.pos = pos;
    this.vel = vel;
    this.collisionMask = new CollisionMask(CollisionMask.CIRCLE, pos, 0);
    this.hasCollided = false;
    this.previousPositions = Array.from({ length: 1 }, () => this.pos.copy());
  }

  update() {
    if (this.hasCollided) return;
    this.previousPositions.push(this.pos.copy());
    const smallVel = this.vel.copy().mult(1 / Projectile.velInterpolation);
    for (var i = 0; i < Projectile.velInterpolation; i++) {
      this.pos.add(smallVel);

      checkCollisions(this);
      if (this.hasCollided) return;
    }
  }

  draw() {
    push();
    let previous = this.previousPositions.shift();
    line(this.pos.x, this.pos.y, previous.x, previous.y);
    pop();
    if (this.hasCollided && this.previousPositions.length === 0) {
      removeEntity(this);
    }
  }

  onCollide(other) {
    if (other === this.sourceEntity) return;
    this.hasCollided = true;
    console.log('Projectile collision')
    return collisionResults.NONE;
  }
}

Projectile.velInterpolation = 10;
