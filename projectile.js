class Projectile {
  constructor(pos, vel) {
    this.pos = pos;
    this.vel = vel;
  }

  update() {
    this.lastPos = this.pos.copy();
    this.pos.add(this.vel);
  }

  draw() {
    push();
    if (!this.lastPos) {
      translate(this.pos.x, this.pos.y);
      circle(0, 0, 4);
    }
    line(this.pos.x, this.pos.y, this.lastPos.x, this.lastPos.y);
    pop();
  }
}
