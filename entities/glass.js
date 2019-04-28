class Glass extends TransparentSolid {
  constructor(top, left, bottom, right) {
    super();
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
    this.health = 100;
    this.collisionMask = new CollisionMask(CollisionMask.RECTANGLE, top, left, bottom, right);
  }

  update() {}

  draw() {
    strokeWeight(5);
    stroke(255);
    fill(255, 0.3);
    rect(this.left + 3, this.top + 3, this.right - this.left - 6, this.bottom - this.top - 6);
    strokeWeight(1);
    if (this.health < 80) {
      line(this.left + 5, this.top + 15, this.left + 15, this.top + 5);
      line(this.right -5, this.bottom - 15, this.right - 15, this.bottom - 5);
    }
  }

  onCollide(other) {
    if (other instanceof Projectile) {
      this.health -= 10;
      if (this.health === 0) {
        return collisionResults.DESTROY;
      }
    }
  }
}
