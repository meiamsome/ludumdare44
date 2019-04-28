class Player extends OpaqueSolid {
  constructor (level, x, y) {
    super();
    this.level = level;
    this.dead = false;
    this.pos = createVector(x, y);
    this.moveOutVector = createVector(0, 0);
    this.mouseAngle = 0;
    this.collisionMask = new CollisionMask(CollisionMask.CIRCLE, this.pos, 16);
    this.deathDirection = createVector(0, 0);
  }

  update(deltaT) {
    this.pos.add(this.moveOutVector);
    this.moveOutVector.setMag(0);
    let vec = input.keys.copy().mult(deltaT / 1000);
    this.pos.x += vec.x;
    this.pos.y += vec.y;
    for (let i = 0; i < 5; i++) {
      const {
        moveOuts,
        totalMoveOut,
        type,
      } = this.level.checkCollisions(this);
      if (type !== collisionResults.MOVE_OUT) {
        break;
      }
      this.pos.add(totalMoveOut.div(moveOuts));
    }
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
      .setMag(16)
      .add(this.pos);
    const vel = direction
      .copy()
      .setMag(2500);
    const projectile = new Projectile(this.level, Player, position, vel);
    this.level.addEntity(projectile);
  }

  onCollide(entity) {
    if (entity instanceof Wall || entity instanceof Glass) {
      console.log("We're in a wall");
      return collisionResults.MOVE_OUT;
    }
    if (entity instanceof Projectile) {
      if (entity.sourceEntityClass !== Player) {
        this.deathDirection = entity.vel.copy();
        this.score = this.level.endTime - Date.now();
        this.level.endTime -= 100000;
        this.dead = true;
        return collisionResults.DESTROY;
      }
    }
  }

  onMoveOut(movement) {
    this.moveOutVector.add(movement);
  }

  onDestroy() {
    let count = this.score / 100;
    while (count >= 1) {
      let value = random([1, 1, 1, 1, 2, 2, 5]);
      if (value > count) continue;
      count -= value;
      this.level.addEntity(new Gem(
        this.level,
        value,
        this.pos.copy(),
        p5.Vector.random2D()
          .setMag(random(180, 300))
          .add(this.deathDirection),
        random(0.5, 0.9)
      ))
    }
  }
}
