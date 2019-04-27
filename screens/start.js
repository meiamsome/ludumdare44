class StartScreen {
  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.level = null;
    this._loadLevel();
  }

  async _loadLevel() {
    this.level = await new Level('test');
  }

  draw() {
    // stroke(255, 0, 0);
    // fill(0);
    // rect(-this.width/2, -this.height/2, this.width, this.height);
    textAlign(CENTER, CENTER);
    fill(255);
    stroke(255);
    textSize(120);
    text("GAME NAME HERE", 0, -400);
    textSize(32);
    if (this.level) {
      text("Click to start", 0, 0);
    } else {
      text("Loading...", 0, 0);
    }
  }

  onClick() {
    if (this.level) {
      moveToLevel(this.level);
    }
  }
}
