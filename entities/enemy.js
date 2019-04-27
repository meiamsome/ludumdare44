class Enemy extends Solid {
  constructor (level, x, y) {
    super();
    this.level = level;
    this.pos = createVector(x, y);
    this.facing = 0;
    this.moveOutVector = createVector(0, 0);
    this.collisionMask = new CollisionMask(CollisionMask.CIRCLE, this.pos, 16);
  }

  update() {
    // this.pos.x += input.keys.x;
    // this.pos.y += input.keys.y;
    this.pos.add(this.moveOutVector);
    this.moveOutVector.setMag(0);
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.facing);
    fill(255, 0, 0);
    circle(0, 0, 16);
    line(0, 0, 16, 0);

    pop();
  }

  onCollide(entity) {
    if (entity instanceof Wall || entity instanceof Player) {
      return collisionResults.MOVE_OUT;
    }
    if (entity instanceof Projectile) {
      this.deathDirection = entity.vel.copy();
      return collisionResults.DESTROY;
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
          .setMag(random(5))
          .add(this.deathDirection.setMag(5))
      ))
    }
  }

  onMoveOut(movement) {
    this.moveOutVector.add(movement);
  }
}
