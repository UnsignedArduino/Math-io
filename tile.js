const north = 0;
const east = 1;
const south = 2;
const west = 3;

class Tile extends GridItem {
  constructor(cam, in_dir, out_dir, alpha) {
    super(cam);
    this.in = in_dir;
    this.out = out_dir;
    this.alpha = alpha == undefined ? 255 : alpha;
  }
}

class BaseTile extends Tile {
  draw(x, y, width, height) {
    push();
    rectMode(CORNER);  // makes it x, y, width, height
    stroke(51, this.alpha);
    strokeWeight(1);
    fill(190, this.alpha);
    const size = tile_size * this.camera.zoom;
    const draw_x = x + (this.grid_loc.x * size) - this.camera.x;
    const draw_y = y + (this.grid_loc.y * size) - this.camera.y;
    rect(draw_x, draw_y, size, size);
    pop();
  }
}

class ExtractorTile extends Tile {
  draw(x, y, width, height) {
    push();
    rectMode(CORNER);  // makes it x, y, width, height
    stroke(51, this.alpha);
    strokeWeight(1);
    fill(160, this.alpha);
    const size = tile_size * this.camera.zoom;
    const draw_x = x + (this.grid_loc.x * size) - this.camera.x;
    const draw_y = y + (this.grid_loc.y * size) - this.camera.y;
    rect(draw_x, draw_y, size, size);
    pop();
    if (this.camera.zoom > 0.5) {
      push();
      const some_size = Math.round(size * 0.1);
      const half_size = Math.round(size / 2);
      const top = createVector(draw_x + half_size, draw_y + some_size);
      const right = createVector(draw_x + size - some_size, draw_y + half_size);
      const bottom = createVector(draw_x + half_size, draw_y + size - some_size);
      const left = createVector(draw_x + some_size, draw_y + half_size);
      if (this.out === north) {
        line(left.x, left.y, top.x, top.y);
        line(top.x, top.y, right.x, right.y);
      } else if (this.out === east) {
        line(top.x, top.y, right.x, right.y);
        line(right.x, right.y, bottom.x, bottom.y);
      } else if (this.out === south) {
        line(right.x, right.y, bottom.x, bottom.y);
        line(bottom.x, bottom.y, left.x, left.y);
      } else if (this.out === west) {
        line(bottom.x, bottom.y, left.x, left.y);
        line(left.x, left.y, top.x, top.y);
      }
      pop();
    }
  }
}

class OreTile extends Tile {
  draw(x, y, width, height) {
    const size = tile_size * this.camera.zoom;
    const draw_x = x + (this.grid_loc.x * size) - this.camera.x;
    const draw_y = y + (this.grid_loc.y * size) - this.camera.y;
    const half_size = size / 2;
    push();
    rectMode(CORNER);  // makes it x, y, width, height
    stroke(51, this.alpha);
    strokeWeight(1);
    fill(100);
    rect(draw_x, draw_y, size, size);
    pop();
    if (this.camera.zoom > 0.5) {
      // text
      push();
      stroke(0);
      strokeWeight(2);
      fill(255);
      textSize(12 * this.camera.zoom);
      textAlign(CENTER, CENTER);
      text("1", draw_x + half_size, draw_y + half_size);
      pop();
    }
  }
}
