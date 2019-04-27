class Level {
  constructor(levelName) {
    this.entities = [];
    return this._loadLevel(levelName);
  }

  async _loadLevel(levelName) {
    const request = await fetch(`levels/${levelName}.json`);
    const result = await request.json();

    this.width = result.width;
    this.height = result.height;
    this.addEntity(new Wall(-16, -16, -1, this.width + 16));
    this.addEntity(new Wall(-16, -16, this.height + 16, -1));
    this.addEntity(new Wall(-16, this.width + 1, this.height + 16, this.width + 16));
    this.addEntity(new Wall(this.height + 1, -16, this.height + 16, this.width + 16));

    for (const { top, left, bottom, right } of result.walls) {
      this.addEntity(new Wall(top, left, bottom, right));
    }

    for (const { top, left, bottom, right } of result.endZones) {
      this.addEntity(new EndZone(this, top, left, bottom, right));
    }

    for (const { x, y } of result.enemies) {
      this.addEntity(new Enemy(this, x, y));
    }

    this.player = new Player(this, result.player.x, result.player.y);
    this.addEntity(this.player);

    return this;
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  removeEntity(entity) {
    let index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  checkCollisions(entity) {
    return checkCollisions(this.entities, entity);
  }

  update() {
    for (const entity of this.entities) {
      entity.update();
    }
    checkAllCollisions(this.entities);
  }

  draw() {
    for (const entity of this.entities) {
      entity.draw();
    }
  }

  onClick() {
    this.player.onClick();
  }

  onKeyPress() {
    for (const entity of this.entities) {
      entity.onKeyPress && entity.onKeyPress();
    }
  }
}
