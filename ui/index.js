class UI {
  constructor() {
    this.clock = new UIClock();
    this.crosshair = new UICrosshair();
    this.gemDisplays = [];
  }

  createGemDisplay(position, value) {
    this.gemDisplays.push(new UIGemDisplay(position, value));
  }

  update() {
    for (const gemDisplay of this.gemDisplays) {
      gemDisplay.update();
    }
  }

  draw() {
    this.clock.draw();
    this.crosshair.draw();
    for (const gemDisplay of this.gemDisplays) {
      gemDisplay.draw();
    }
    if (level) {
      let playerHere = false;
      let readyToLeave = false;
      for (const entity of level.entities) {
        if (!(entity instanceof EndZone)) continue;
        playerHere |= entity.playerHere;
        readyToLeave |= entity.readyToLeave;
      }
      textSize(32);
      stroke(0);
      fill(255);
      if (playerHere) {
        textAlign(CENTER, TOP);
        if(readyToLeave) {
          text("Press E to Leave", width/2, 100)
        } else {
          text("Defeat All Enemies To Continue", width/2, 100)
        }
      }
      textAlign(LEFT, TOP);
      let fps = 1000 * (frameCount - level.startFrame) / (Date.now() - level.startTime);
      text(`${nf(fps, 2, 2)}fps, ${nf(level.raysPerFrame, 2)}rpf`, 0, 0);
    }
  }
}
