class Wall {
  constructor(top, left, bottom, right) {
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
    this.collisionMask = new CollisionMask(CollisionMask.RECTANGLE, top, left, bottom, right);
  }

  update() {}

  draw() {
    stroke(0);
    fill(255);
    rect(this.left, this.top, this.right - this.left, this.bottom - this.top);
  }
}
