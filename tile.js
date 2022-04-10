const north = 0;
const east = 1;
const south = 2;
const west = 3;

class Item extends GridItem {
  constructor(cam, number) {
    super(cam);
    this.number = number;
  }

  draw(x, y, width, height) {
    push();
    stroke(0);
    strokeWeight(2);
    fill(255);
    textSize(12 * this.camera.zoom);
    textAlign(CENTER, CENTER);
    text(this.number, x, y);
    pop();
  }
}

class Tile extends GridItem {
  constructor(cam, in_dir, out_dir, main_grid, ore_grid) {
    super(cam);
    this.in = in_dir;
    this.out = out_dir;
    this.main_grid = main_grid;
    this.ore_grid = ore_grid;
    this.input_count = 2;
    this.input_slots = [undefined, undefined];
    this.output_slot = undefined;
    this.output_slot = new Item(this.camera, 1);
  }

  can_accept_input() {
    for (let slot of this.input_slots) {
      if (slot == undefined) {
        return true;
      }
    }
    return false;
  }

  accept_input(item) {
    for (let i = 0; i < this.input_count; i ++) {
      if (this.input_slots[i] == undefined) {
        this.input_slots[i] = item;
      }
    }
  }

  draw_item(x, y) {
    if (this.output_slot != undefined) {
      this.output_slot.draw(x, y);
    }
  }
}

class BaseTile extends Tile {
  can_accept_input() {
    return true;
  }

  accept_input(item) {
    // base tile just eats everything
  }
  
  draw(x, y, width, height) {
    push();
    rectMode(CORNER);  // makes it x, y, width, height
    stroke(51);
    strokeWeight(this.camera.zoom > 0.5 ? 1 : 0);
    fill(190);
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
    stroke(51);
    strokeWeight(this.camera.zoom > 0.5 ? 1 : 0);
    fill(160);
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

class ConveyorTile extends Tile {
  draw(x, y, width, height) {
    push();
    rectMode(CORNERS);  // makes it x1, y1, x2, y2
    stroke(51);
    strokeWeight(this.camera.zoom > 0.5 ? 1 : 0);
    fill(120);
    const size = tile_size * this.camera.zoom;
    let some_size = Math.round(size * 0.3);
    const draw_x = x + (this.grid_loc.x * size) - this.camera.x;
    const draw_y = y + (this.grid_loc.y * size) - this.camera.y;
    const top_left = createVector(draw_x + some_size, draw_y + some_size);
    const top_right = createVector(draw_x + size - some_size, draw_y + some_size);
    const bottom_left = createVector(draw_x + some_size, draw_y + size - some_size);
    const bottom_right = createVector(draw_x + size - some_size, draw_y + size - some_size);
    if (this.in === north) {
      rect(top_left.x, top_left.y - some_size, bottom_right.x, bottom_right.y);
    } else if (this.in === east) {
      rect(top_left.x, top_left.y, bottom_right.x + some_size, bottom_right.y);
    } else if (this.in === south) {
      rect(top_left.x, top_left.y, bottom_right.x, bottom_right.y + some_size);
    } else if (this.in === west) {
      rect(top_left.x - some_size, top_left.y, bottom_right.x, bottom_right.y);
    }
    if (this.out === north) {
      rect(top_left.x, top_left.y - some_size - 1, top_right.x, top_right.y + 1);
    } else if (this.out === east) {
      rect(top_right.x - 1, top_right.y, bottom_right.x + some_size + 1, bottom_right.y);
    } else if (this.out === south) {
      rect(bottom_left.x, bottom_left.y - 1, bottom_right.x, bottom_right.y + some_size + 1);
    } else if (this.out === west) {
      rect(top_left.x - some_size - 1, top_left.y, bottom_left.x + 1, bottom_left.y);
    }
    if (this.camera.zoom > 0.5) {
      const thickness = 1;
      strokeWeight(2);
      stroke(120);
      if (this.out === north) {
        line(top_left.x + thickness, top_right.y + 1, top_right.x - thickness, top_right.y + 1);
      } else if (this.out === east) {
        line(top_right.x - 1, top_right.y + thickness, top_right.x - 1, bottom_right.y - thickness);
      } else if (this.out === south) {
        line(bottom_left.x + thickness, bottom_left.y - 1, bottom_right.x - thickness, bottom_right.y - 1);
      } else if (this.out === west) {
        line(top_left.x + 1, top_left.y + thickness, bottom_left.x + 1, bottom_left.y - thickness);
      }
      strokeWeight(1);
      stroke(0);
      some_size = Math.round(size * 0.4);
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
      this.draw_item(draw_x + half_size, draw_y + half_size);
    }
    pop();
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
    stroke(51);
    strokeWeight(this.camera.zoom > 0.5 ? 1 : 0);
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
