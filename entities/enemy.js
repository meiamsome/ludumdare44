class Enemy {
  constructor (x, y) {
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
      return collisionResults.DESTROY;
    }
  }

  onMoveOut(movement) {
    this.moveOutVector.add(movement);
  }
}
