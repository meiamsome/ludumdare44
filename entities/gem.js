class Gem {
  constructor(level, value, pos, vel) {
    this.level = level;
    this.value = value;
    this.pos = pos;
    this.vel = vel;
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
      ui.collectGem(this);
      return collisionResults.DESTROY;
    }
    if (entity instanceof Solid) {
      return collisionResults.MOVE_OUT;
    }
  }

  onMoveOut(movement) {
    this.pos.add(movement);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.9);
    // TODO: move toward player when close?
    const toPlayer = this.level.player.pos.copy().sub(this.pos);
    toPlayer.setMag(max(0, 200 - toPlayer.mag()) / 200);
    this.vel.add(toPlayer);
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
