class UIGemDisplay {
  constructor(pos, value) {
    this.pos = pos.copy();
    this.alpha = 1;
    this.value = value;
  }

  update() {
    this.pos.y -= 2;
    this.alpha *= 0.9;
  }

  draw() {
    stroke(0, this.alpha * 255);
    fill(255, this.alpha * 255);
    textAlign(CENTER, CENTER);
    text(`+${this.value}ms`, this.pos.x, this.pos.y);
  }
}
