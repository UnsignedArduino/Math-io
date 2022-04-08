const bg_color = 220;

const window_diff = 20;

const desired_fps = 60;
let last_fps_time = 0;
let last_fps = 0;

let game = undefined;

function setup() {
  createCanvas(windowWidth - window_diff, windowHeight - window_diff);
  frameRate(desired_fps);
  game = new MathIO();
}

function draw() {
  background(bg_color);
  
  game.update();
  game.draw(0, 0, width, height);

  if (millis() - last_fps_time > 1000) {
    last_fps_time = millis();
    last_fps = Math.round(frameRate());
  }
  push();
  textAlign(RIGHT, TOP);
  textSize(12);
  fill(0);
  text("FPS: " + last_fps, width - 10, 10);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth - window_diff, windowHeight - window_diff);
}
