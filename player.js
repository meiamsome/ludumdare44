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
}
