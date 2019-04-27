class Player {
  constructor (level, x, y) {
    this.level = level;
    this.pos = createVector(x, y);
    this.moveOutVector = createVector(0, 0);
    this.collisionMask = new CollisionMask(CollisionMask.CIRCLE, this.pos, 16);
  }

  update() {
    this.pos.x += input.keys.x;
    this.pos.y += input.keys.y;
    this.pos.add(this.moveOutVector);
    this.moveOutVector.setMag(0);
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    const mouseAngle = input.mouse.copy().sub(this.pos).heading();
    rotate(mouseAngle);
    circle(0, 0, 16);
    line(0, 0, 16, 0);

    pop();
  }

  onClick() {
    const direction = input.mouse
      .copy()
      .sub(this.pos);
    const position = direction
      .copy()
      .setMag(32)
      .add(this.pos);
    const vel = direction
      .copy()
      .setMag(50);
    const projectile = new Projectile(this.level, this, position, vel);
    this.level.addEntity(projectile);
  }

  onCollide(entity) {
    if (entity instanceof Wall) {
      console.log("We're in a wall")
      return collisionResults.MOVE_OUT;
    }
    console.log('Player collision');
  }

  onMoveOut(movement) {
    this.moveOutVector.add(movement);
  }
}
