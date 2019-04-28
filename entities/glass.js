class Glass extends TransparentSolid {
  constructor(top, left, bottom, right) {
    super();
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
    this.collisionMask = new CollisionMask(CollisionMask.RECTANGLE, top, left, bottom, right);
  }

  update() {}

  draw() {
    strokeWeight(5);
    stroke(255);
    fill(255, 0.3);
    rect(this.left + 3, this.top + 3, this.right - this.left - 6, this.bottom - this.top - 6);
    strokeWeight(1);
  }
}
