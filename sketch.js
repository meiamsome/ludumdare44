const input = {
  keys: null,
  mouse: null,
};
const keyCodes = {
  a: 65,
  d: 68,
  s: 83,
  w: 87,
};
let player;
const entities = [];
function removeEntity(entity) {
  let index = entities.indexOf(entity);
  if (index !== -1) {
    entities.splice(index, 1);
  }
}

function createRoom() {
  entities.push(new Wall(-16, -16, -1, width + 16));
  entities.push(new Wall(-16, -16, height + 16, -1));
  entities.push(new Wall(-16, width + 1, height + 16, width + 16));
  entities.push(new Wall(height + 1, -16, height + 16, width + 16));
  entities.push(new Wall(200, 200, 250, 250));
}

function setup() {
  createCanvas(400, 400);
  ellipseMode(CENTER);

  input.keys = createVector(0, 0);
  input.mouse = createVector(0, 0);

  createRoom();
  player = new Player();
  entities.push(player);
}

function draw() {
  getInput();

  for (const entity of entities) {
    entity.update();
  }
  checkAllCollisions();

  background(220);

  for (const entity of entities) {
    entity.draw()
  }
}

function getInput() {
  input.keys.x = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(keyCodes["a"])) {
    input.keys.x -= 1;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(keyCodes["d"])) {
    input.keys.x += 1;
  }

  input.keys.y = 0;
  if (keyIsDown(UP_ARROW) || keyIsDown(keyCodes["w"])) {
    input.keys.y -= 1;
  }
  if (keyIsDown(DOWN_ARROW) || keyIsDown(keyCodes["s"])) {
    input.keys.y += 1;
  }

  input.mouse.x = mouseX;
  input.mouse.y = mouseY;
}

function mousePressed() {
  player.onClick();
}
