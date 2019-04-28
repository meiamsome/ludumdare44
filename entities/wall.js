class Wall extends OpaqueSolid {
  constructor(top, left, bottom, right) {
    super();
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
    this.collisionMask = new CollisionMask(CollisionMask.RECTANGLE, top, left, bottom, right);
  }

  draw() {
    stroke(0);
    fill(255);
    rect(this.left, this.top, this.right - this.left, this.bottom - this.top);
  }
}
