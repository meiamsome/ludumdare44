class DeathScreen {
  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.lastUpdate = Date.now();
    this.canContinue = false;
    setTimeout(() => this.canContinue = true, 1000);
  }

  draw() {
    let time = Date.now();
    let deltaT = time - this.lastUpdate;
    this.lastUpdate = time;
    level.update(deltaT);
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
    if (this.canContinue) {
      text("You DIED.\nClick to try again", 0, 0);
    } else {
      text("You DIED.", 0, 0);
    }
  }

  onKeyPress() {
    if (keyCode === ESCAPE) {
      screen = null;
    }
  }

  onClick() {
    if (this.canContinue) {
      screen = new StartScreen('test');
    }
  }
}
