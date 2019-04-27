class Player {
  constructor () {
    this.x = 0;
    this.y = 0;
  }

  update() {
    this.x += input.horizontal;
    this.y += input.vertical;
  }

  draw() {
    rect(this.x, this.y, 16, 16);
  }
}
