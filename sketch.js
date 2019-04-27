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

let screen;
let level;
let ui;
let endTime;

function moveToLevel(_level) {
  level = _level;
  screen = null;
  endTime = Date.now() + 60 * 1000;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  ellipseMode(CENTER);

  screen = new StartScreen();
  ui = new UI();

  input.keys = createVector(0, 0);
  input.mouse = createVector(0, 0);

  window.addEventListener('resize', () => {
    resizeCanvas(windowWidth, windowHeight);
  });
}

function scaleAndRenderScreen(screen) {
  let screenScale = Math.min(width / screen.width, height / screen.height);
  translate(width/2, height/2);
  scale(screenScale);
  screen.draw();
}

function draw() {
  background(32);
  if (screen) {
    return scaleAndRenderScreen(screen);
  }
  if (endTime < Date.now()) {
    screen = new DeathScreen();
    return;
  }
  getInput();

  level && level.update();
  ui.update();


  level && level.draw();
  ui.draw();
}

function keyPressed() {
  if (keyCode === ESCAPE && !screen) {
    screen = new PauseScreen();
    return;
  }
  if (screen) {
    return screen.onKeyPress && screen.onKeyPress();
  }
  if (level) {
    return level.onKeyPress && level.onKeyPress();
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
  input.keys.setMag(4)

  input.mouse.x = mouseX;
  input.mouse.y = mouseY;
}

function mousePressed() {
  if (screen) {
    return screen.onClick && screen.onClick();
  }
  level && level.onClick();
}
