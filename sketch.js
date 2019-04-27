const input = {
  horizontal: 0,
  vertical: 0,
};
const keyCodes = {
  a: 65,
  d: 68,
  s: 83,
  w: 87,
};
const player = new Player();
const entities = [
  player
];

function setup() {
  createCanvas(400, 400);
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
  input.horizontal = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(keyCodes["a"])) {
    input.horizontal -= 1;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(keyCodes["d"])) {
    input.horizontal += 1;
  }

  input.vertical = 0;
  if (keyIsDown(UP_ARROW) || keyIsDown(keyCodes["w"])) {
    input.vertical -= 1;
  }
  if (keyIsDown(DOWN_ARROW) || keyIsDown(keyCodes["s"])) {
    input.vertical += 1;
  }

}
