class UI {
  constructor() {
    this.clock = new UIClock();
    this.crosshair = new UICrosshair();
    this.gemsCollected = 0;
    this.gemCollectionTimeout = null;
    this.gemDisplays = [];
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
  }

  collectGem(gem) {
    endTime += gem.value * 100;
    this.gemsCollected += gem.value * 100;
    if (this.gemCollectionTimeout) clearTimeout(this.gemCollectionTimeout);
    this.gemCollectionTimeout = setTimeout(() => this.endGemStreak(), 100);
  }

  endGemStreak() {
    this.gemDisplays.push(new UIGemDisplay(level.player.pos.copy().sub(createVector(0, 32)), this.gemsCollected));
    this.gemsCollected = 0;
    this.gemCollectionTimeout = null;
  }
}
