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
    let strings = [
      `You survived with ${this.timeRemaining}ms remaining.`
    ];
    if (!this.highScore) {
    } else if(this.highScore < this.timeRemaining) {
      strings.push(`New high score!`, `Your previous high score was ${this.highScore}ms`);
    } else {
      strings.push(`Your high score is ${this.highScore}ms`);
    }

    if (level.player) {
      if (level.player.hits === 0) {
        strings.push(`PERFECT: You took no damage`);
      } else {
        strings.push(`You took ${level.player.hits} hit${level.player.hits > 1 ? 's' : ''}`);
      }

      if (level.player.seenByCount === 0) {
        strings.push(`PERFECT: You were unseen`);
      } else if (level.player.seenByCount === 1) {
        strings.push(`One guard saw you`);
      } else {
        strings.push(`${level.player.seenByCount} guards saw you`);
      }
    }
    text(strings.join(`\n`), 0, 0);
  }

  onClick() {
    screen = new StartScreen('test');
  }
}
