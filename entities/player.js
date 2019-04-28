class Player extends Solid {
  constructor (level, x, y) {
    super();
    this.level = level;
    this.pos = createVector(x, y);
    this.moveOutVector = createVector(0, 0);
    this.mouseAngle = 0;
    this.collisionMask = new CollisionMask(CollisionMask.CIRCLE, this.pos, 16);
  }

  update() {
    this.pos.x += input.keys.x;
    this.pos.y += input.keys.y;
    this.pos.add(this.moveOutVector);
    this.moveOutVector.setMag(0);
    this.mouseAngle = input.mouse.copy().sub(this.pos).heading();
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.mouseAngle);
    stroke(0);
    fill(255);
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
  }

  onMoveOut(movement) {
    this.moveOutVector.add(movement);
  }
}
