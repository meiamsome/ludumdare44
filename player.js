class Player {
  constructor () {
    this.pos = createVector(100, 100);
  }

  update() {
    this.pos.x += input.keys.x;
    this.pos.y += input.keys.y;
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
      .setMag(16)
      .add(this.pos);
    const vel = direction
      .copy()
      .setMag(50);
    const projectile = new Projectile(position, vel);
    entities.push(projectile);
  }
}
