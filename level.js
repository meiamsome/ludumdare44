class Level {
  constructor(levelName) {
    this.entities = [];
    this.gemsCollected = 0;
    this.gemCollectionTimeout = null;
    return this._loadLevel(levelName);
  }

  async _loadLevel(levelName) {
    const request = await fetch(`levels/${levelName}.json`);
    this.data = await request.json();
    return this._loadFromData();
  }

  _loadFromData() {
    this.width = this.data.width;
    this.height = this.data.height;
    randomSeed(this.data.randomSeed);
    this.entities = [];
    this.addEntity(new Wall(-16, -16, -1, this.width + 16));
    this.addEntity(new Wall(-16, -16, this.height + 16, -1));
    this.addEntity(new Wall(-16, this.width + 1, this.height + 16, this.width + 16));
    this.addEntity(new Wall(this.height + 1, -16, this.height + 16, this.width + 16));

    for (const { top, left, bottom, right } of this.data.walls) {
      this.addEntity(new Wall(top, left, bottom, right));
    }

    for (const { top, left, bottom, right } of this.data.endZones) {
      this.addEntity(new EndZone(this, top, left, bottom, right));
    }

    for (const { x, y } of this.data.enemies) {
      this.addEntity(new Enemy(this, x, y));
    }

    this.player = new Player(this, this.data.player.x, this.data.player.y);
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
    if (this.endTime < Date.now()) {
      screen = new DeathScreen();
      return;
    }
    for (const entity of this.entities) {
      entity.update();
    }
    checkAllCollisions(this.entities);
  }

  begin() {
    if (this.gemCollectionTimeout) {
      clearTimeout(this.gemCollectionTimeout);
    }
    this.gemCollectionTimeout = null;
    this.gemsCollected = 0;
    this.endTime = Date.now() + 60 * 1000;
  }

  collectGem(gem) {
    this.endTime += gem.value * 100;
    this.gemsCollected += gem.value * 100;
    if (this.gemCollectionTimeout) clearTimeout(this.gemCollectionTimeout);
    this.gemCollectionTimeout = setTimeout(() => this.endGemStreak(), 100);
  }

  endGemStreak() {
    ui.createGemDisplay(this.player.pos.copy().sub(createVector(0, 32)), this.gemsCollected);
    this.gemsCollected = 0;
    this.gemCollectionTimeout = null;
  }

  draw() {
    for (const entity of this.entities) {
      entity.draw();
    }
  }

  finish() {
    screen = new LevelCompleteScreen(this.endTime - Date.now());
  }

  onClick() {
    this.player.onClick();
  }

  onKeyPress() {
    if (key === 'r') {
      this._loadFromData();
      this.begin();
      return;
    }
    for (const entity of this.entities) {
      entity.onKeyPress && entity.onKeyPress();
    }
  }
}
