class PauseScreen {
  constructor() {
    this.width = 1920;
    this.height = 1080;
  }

  draw() {
    push();
    resetMatrix();
    translate(width / 2, height / 2);
    level.draw();
    resetMatrix();
    fill(0, 0, 0, 100);
    rect(-width, -height, 2 * width, 2 * height);
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
