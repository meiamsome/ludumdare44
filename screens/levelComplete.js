class LevelCompleteScreen {
  constructor(timeRemaining) {
    this.timeRemaining = timeRemaining;
    this.width = 1920;
    this.height = 1080;
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
    text(`You survived with ${this.timeRemaining}ms remaining`, 0, 0);
  }
}
