class UI {
  constructor() {
    this.clock = new UIClock();
    this.crosshair = new UICrosshair();
  }

  draw() {
    this.clock.draw();
    this.crosshair.draw();
  }
}
