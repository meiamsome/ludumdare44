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

function setup() {
  createCanvas(400, 400);
  ellipseMode(CENTER);

  input.keys = createVector(0, 0);
  input.mouse = createVector(0, 0);

  player = new Player();
  entities.push(player);
}

function draw() {
  getInput();
  player.update();

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
