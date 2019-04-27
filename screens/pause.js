class PauseScreen {
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
    push();
    resetMatrix();
    level.draw();
    fill(0, 0, 0, 100);
    rect(0, 0, width, height);
    pop();
    textAlign(CENTER, CENTER);
    fill(255);
    stroke(255);
    textSize(120);
    text("GAME NAME HERE", 0, -400);
    textSize(32);
    text("PAUSED\nPress escape to resume", 0, 0);
  }

  onKeyPress() {
    if (keyCode === ESCAPE) {
      screen = null;
    }
  }
}
