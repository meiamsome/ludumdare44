class DeathScreen {
  constructor() {
    this.width = 1920;
    this.height = 1080;
  }

  draw() {
    level.update();
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
    text("You DIED.", 0, 0);
  }

  onKeyPress() {
    if (keyCode === ESCAPE) {
      screen = null;
    }
  }

  onClick() {
    screen = new StartScreen('test');
  }
}
