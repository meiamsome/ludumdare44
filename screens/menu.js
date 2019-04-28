class MenuScreen {
  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.optionHeight = 64;
    this.optionSpacing = 20;
    this.clicking = false;
    this.options = [];
  }

  draw() {
    // stroke(255, 0, 0);
    // fill(0);
    // rect(-this.width/2, -this.height/2, this.width, this.height);
    textAlign(CENTER, CENTER);
    fill(255);
    stroke(255);
    textSize(120);
    text("GAME NAME HERE", 0, -400);
    textSize(32);
    const height = this.optionHeight + (this.optionHeight + this.optionSpacing) * (this.options.length - 1);
    translate(0, -height / 2);
    input.mouse.add(0, height / 2);
    let anyHovered = false;
    for (const option of this.options) {
      let hovered = input.mouse.x > -150 && input.mouse.x < 150 && input.mouse.y > -this.optionHeight / 2 && input.mouse.y < this.optionHeight / 2;
      anyHovered = anyHovered || hovered;
      if (hovered) {
        fill(255, 55);
        if (this.clicking) {
          option.onClick();
        }
      } else {
        noFill();
      }
      rect(-150, -this.optionHeight / 2, 300, this.optionHeight);
      fill(255);
      stroke(255);
      text(option.name, 0, 4);
      translate(0, this.optionHeight + this.optionSpacing);
      input.mouse.add(0, - (this.optionHeight + this.optionSpacing));
    }
    cursor(anyHovered ? 'pointer' : 'default');
    this.clicking = false;
  }

  onClick() {
    this.clicking = true;
  }
}
