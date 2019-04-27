class LevelCompleteScreen {
  constructor(timeRemaining, highScore) {
    this.timeRemaining = timeRemaining;
    this.highScore = highScore;
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
    if (!this.highScore) {
      text(`You survived with ${this.timeRemaining}ms remaining.`, 0, 0);
    } else if(this.highScore < this.timeRemaining) {
      text(`You survived with ${this.timeRemaining}ms remaining.\nNew high score!\nYour previous high score was ${this.highScore}ms`, 0, 0);
    } else {
      text(`You survived with ${this.timeRemaining}ms remaining.\nYour high score is ${this.highScore}ms`, 0, 0);
    }
  }

  onClick() {
    screen = new StartScreen('test');
  }
}
