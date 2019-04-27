class EndZone {
  constructor(level, top, left, bottom, right) {
    this.level = level;
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
    this.collisionMask = new CollisionMask(CollisionMask.RECTANGLE, top, left, bottom, right);
    this.playerHere = false;
    this.readyToLeave = false;
  }

  update() {
    this.playerHere = false;
    this.level.checkCollisions(this);
    this.readyToLeave = this.level.entities.filter(e => e instanceof Enemy).length === 0;
  }

  onCollide(entity) {
    if (entity instanceof Player) {
      this.playerHere = true;
    }
  }

  draw() {
    stroke(0);
    fill(100);
    if (this.playerHere) {
      if (this.readyToLeave) {
        fill(200, 255, 200);
      } else {
        fill(255, 100, 100);
      }
    }
    rect(this.left, this.top, this.right - this.left, this.bottom - this.top);
  }

  onKeyPress() {
    if (key === 'e' && this.playerHere && this.readyToLeave) {
      screen = new LevelCompleteScreen(endTime - Date.now());
    }
  }
}
