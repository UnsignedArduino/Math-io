const bg_color = 220;

const window_diff = 20;

let game = undefined;

function setup() {
  createCanvas(windowWidth - window_diff, windowHeight - window_diff);
  game = new MathIO();
}

function draw() {
  background(bg_color);
  game.update();
  game.draw(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth - window_diff, windowHeight - window_diff);
}
