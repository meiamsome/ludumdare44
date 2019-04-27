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

let room;

function createRoom() {

  entities.push(new Enemy(300, 300));
}

async function setup() {
  createCanvas(400, 400);
  ellipseMode(CENTER);

  input.keys = createVector(0, 0);
  input.mouse = createVector(0, 0);

  room = await new Level('test');

}

function draw() {
  getInput();

  room && room.update();

  background(220);

  room && room.draw();
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
  input.keys.setMag(1)

  input.mouse.x = mouseX;
  input.mouse.y = mouseY;
}

function mousePressed() {
  room && room.onClick();
}
