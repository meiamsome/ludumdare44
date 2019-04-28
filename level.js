const playerSearchIncludes = [OpaqueSolid];
const playerSearchExcludes = [Player];

const wallTypes = {
  GLASS: Glass,
  WALL: Wall,
}

class Level {
  constructor(levelName) {
    this.levelName = levelName;
    this.entities = [];
    this.raysPerFrame = 0;
    this.gemsCollected = 0;
    this.gemCollectionTimeout = null;
    this.highScore = +localStorage.getItem(`highscores.${this.levelName}`);
    return this._loadLevel(levelName);
  }

  async _loadLevel() {
    const request = await fetch(`levels/${this.levelName}.json`);
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

    for (const { type, top, left, bottom, right } of this.data.walls) {
      const Type = wallTypes[type] || Wall;
      this.addEntity(new Type(top, left, bottom, right));
    }

    for (const { top, left, bottom, right } of this.data.endZones) {
      this.addEntity(new EndZone(this, top, left, bottom, right));
    }

    this.patrols = [];
    if (this.data.patrols) {
      this.patrols = this.data.patrols.map(
        patrol => patrol.map(
          ({ x, y }) => ({ position: createVector(x, y) })
        )
      );
    }

    for (const { mode, patrolId, startAt, _facing, _x, _y } of this.data.enemies) {
      let x = _x;
      let y = _y;
      let facing = _facing;
      let passiveBehaviour = EnemyPassiveBehaviourStandAndLook()
      if (mode === "patrol") {
        const patrol = this.patrols[patrolId].slice();
        if (startAt) {
          patrol.push(...patrol.splice(0, startAt));
        }
        passiveBehaviour = EnemyPassiveBehaviourPatrol(patrol);
        if (!x || !y) {
          ({ x, y } = patrol[0].position);
          if (!facing) {
            facing = patrol[1 % patrol.length].position.copy().sub(patrol[0].position).heading();
          }
        } else if (!facing) {
          facing = createVector(x, y).copy().sub(patrol[0].position).heading();
        }
      }
      let pos = createVector(x, y);
      this.addEntity(new Enemy(this, pos, facing, passiveBehaviour));
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
    if (this.endTime < Date.now() && !(screen instanceof DeathScreen)) {
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
    this.startTime = Date.now();
    this.endTime = Date.now() + 60 * 1000;
    this.startFrame = frameCount;
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
    // this.player.draw();

    const angle = PI * 114 /360;

    const {
      rays,
      seen,
    } = adaptiveTrace(this.player.pos, this.player.mouseAngle - angle, this.player.mouseAngle + angle, playerSearchIncludes, playerSearchExcludes);

    // return;
    if (this.player.dead) return;

    drawingContext.globalCompositeOperation = "destination-in";
    // drawingContext.filter = 'blur(4px)';
    noStroke()
    fill(255);
    beginShape();
    vertex(this.player.pos.x, this.player.pos.y);
    for (const { position } of rays) {
      vertex(position.x, position.y);
    }
    endShape();
    drawingContext.filter = 'none';
    blendMode(BLEND);
    this.raysPerFrame = rays.length;

    for (const entity of this.entities) {
      if ([Wall, Glass].some(clss => entity instanceof clss)) {
        entity.draw();
      }
    }
    for (const visible of seen.values()) {
      visible.draw();
    }
    this.player.draw();
  }

  finish() {
    let score = this.endTime - Date.now();
    let isHighScore = false;
    if (!this.highScore || score > this.highScore) {
      isHighScore = true;
    }
    screen = new LevelCompleteScreen(score, this.highScore);
    if (isHighScore) {
      localStorage.setItem(`highscores.${this.levelName}`, score);
      this.highScore = score;
    }
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
