const bg_color = 220;

const window_diff = 20;

function setup() {
  createCanvas(windowWidth - window_diff, windowHeight - window_diff);
}

function draw() {
  background(bg_color);
}

function windowResized() {
  resizeCanvas(windowWidth - window_diff, windowHeight - window_diff);
}
