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
      if (playerHere) {
        textSize(32);
        stroke(0);
        fill(255);
        textAlign(CENTER, TOP);
        if(readyToLeave) {
          text("Press E to Leave", width/2, 100)
        } else {
          text("Defeat All Enemies To Continue", width/2, 100)
        }
      }
    }
  }
}
