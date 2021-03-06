const north = 0;
const east = 1;
const south = 2;
const west = 3;

class Item extends GridItem {
  constructor(cam, number) {
    super(cam);
    this.number = number;
    this.moved = false;
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
    this.input_slots = (new Array(this.input_count)).fill(undefined);
    this.output_slot = undefined;
  }

  tile_will_reference(col, row) {
    return this.get_next_tile(col, row);
  }

  on_new_frame() {
    if (this.output_slot instanceof Item) {
      this.output_slot.moved = false;
    }
    for (const i of this.input_slots) {
      if (i instanceof Item) {
        i.moved = false;
      }
    }
  }

  free_slots() {
    let slots = 0;
    for (let slot of this.input_slots) {
      if (slot == undefined) {
        slots ++;
      }
    }
    return slots;
  }

  can_accept_input(col, row) {
    return this.free_slots() > 0;
  }

  accept_input(item, col, row) {
    for (let i = 0; i < this.input_count; i ++) {
      if (this.input_slots[i] == undefined) {
        this.input_slots[i] = item;
      }
    }
  }

  get_next_tile(col, row) {
    let new_loc = createVector(col, row);
    if (this.out === north) {
      new_loc = new_loc.add(0, -1);
    } else if (this.out === east) {
      new_loc = new_loc.add(1, 0);
    } else if (this.out === south) {
      new_loc = new_loc.add(0, 1);
    } else if (this.out === west) {
      new_loc = new_loc.add(-1, 0);
    }
    return this.main_grid.get_item(new_loc.x, new_loc.y);
  }

  get_direction_from_us(col, row) {
    const our_col = this.grid_loc.x;
    const our_row = this.grid_loc.y;
    if (our_col === col && our_row === row + 1) {
      return north;
    } else if (our_col === col - 1 && our_row === row) {
      return east;
    } else if (our_col === col && our_row === row - 1) {
      return south;
    } else if (our_col === col + 1 && our_row === row) {
      return west;
    } else {
      return undefined;
    }
  }
  
  can_send_output(col, row) {
    let next_tile = this.get_next_tile(col, row);
    if (next_tile == undefined) {
      // console.log("can't send cause no tile");
      return false;
    }
    let found_unmoved = false;
    for (const item of this.input_slots) {
      if (item == undefined) {
        continue;
      }// else if (!item.moved) {
      //   found_unmoved = true;
      //   break;
      // }
    }
    // if (!found_unmoved) {
    //   return false;
    // }
    return next_tile.can_accept_input(col, row);
  }

  send_output(col, row) {
    if (!this.can_send_output(col, row)) {
      return;
    }
    let next_tile = this.get_next_tile(col, row);
    next_tile.accept_input(this.output_slot, col, row);
    this.output_slot.moved = true;
    this.output_slot = undefined;
  }

  process_items() {
    const item1 = this.input_slots[0];
    const item2 = this.input_slots[1];
    this.input_slots.fill(undefined);
    // process items here
    // right now this will eat items
    // return a new item to send it out
    return undefined;
  }
  
  update(col, row) {
    if (!this.can_send_output(col, row)) {
      return;
    }
    this.output_slot = this.process_items();
    if (this.output_slot == undefined) {
      return;
    }
    this.send_output(col, row);
  }

  draw_item(x, y) {
    if (this.output_slot != undefined) {
      this.output_slot.draw(x, y);
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

class BaseTile extends Tile {  
  can_accept_input(col, row) {
    return true;
  }

  accept_input(item, col, row) {
    // eat input for now
  }
  
  can_send_output(col, row) {
    // base tile doesn't need to send anything
    return false;
  }

  send_output(col, row) {
    // base tile doesn't need to send anything
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
  can_accept_input(col, row) {
    return false;  // extractors don't accept
  }

  accept_input(item, col, row) {
    // do nothing with the items
  }
  
  can_send_output(col, row) {
    if (this.ore_grid.get_item(col, row) == undefined) {
      return false;
    }
    let next_tile = this.get_next_tile(col, row);
    if (next_tile == undefined) {
      return false;
    }
    return next_tile.can_accept_input(col, row);
  }

  send_output(col, row) {
    if (!this.can_send_output(col, row)) {
      return;
    }
    let next_tile = this.get_next_tile(col, row);
    const item = new Item(this.camera, 1);
    item.moved = true;
    // console.log("generated item moved");
    next_tile.accept_input(item, col, row);
  }

  update(col, row) {
    if (!this.can_send_output(col, row)) {
      return;
    }
    this.send_output(col, row);
  }
  
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
  constructor(cam, in_dir, out_dir, main_grid, ore_grid) {
    super(cam, in_dir, out_dir, main_grid, ore_grid);
    this.input_count = 0;
    this.input_slots = (new Array(this.input_count)).fill(undefined);
  }

  can_send_output(col, row) {
    let next_tile = this.get_next_tile(col, row);
    if (next_tile == undefined) {
      // console.log("can't send cause no tile");
      return false;
    }
    // if (next_tile.can_accept_input(col, row)) {
    //   console.log("can send to " + next_tile.grid_loc.x + ", " + next_tile.grid_loc.y)
    // } else {
    //   console.log("can't send to " + next_tile.grid_loc.x + ", " + next_tile.grid_loc.y)
    // }
    // for (const item of this.input_slots) {
    //   if (item == undefined) {
    //     continue;
    //   } else if (item.moved) {
    //     console.log("cannot send item cause it moved already");
    //     return false;
    //   }
    // }
    if (this.output_slot != undefined && this.output_slot.moved) {
      // console.log("cannot send item cause it moved already");
      return false;
    }
    return next_tile.can_accept_input(col, row);
  }

  can_accept_input(col, row) {
    const previous_tile = this.main_grid.get_item(col, row);
    if (this.output_slot != undefined) {
      return false;
    }
    return previous_tile.out === ((this.in + 2) % 4);
  }
  
  accept_input(item, col, row) {
    this.output_slot = item;
  }
  
  process_items() {
    const item1 = this.output_slot;
    this.output_slot = undefined;
    return item1;
  }

  update(col, row) {
    if (!this.can_send_output(col, row)) {
      return;
    } else if (this.output_slot == undefined) {
      return;
    }
    this.output_slot = this.process_items();
    this.send_output(col, row);
  }
  
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

class MergerTile extends Tile {
  constructor(cam, in_dir, out_dir, main_grid, ore_grid) {
    super(cam, in_dir, out_dir, main_grid, ore_grid);
    this.input_count = 3;
    this.input_slots = (new Array(this.input_count)).fill(undefined);
    this.direction_accepting = (out_dir + 1) % 4;
    this.last_processed = 0;
  }

  on_new_frame() {
    super.on_new_frame();
    this.direction_accepting = (this.direction_accepting + 1) % 4;
    if (this.direction_accepting === this.out) {
      this.direction_accepting = (this.direction_accepting + 1) % 4;
    }
  }
  
  can_accept_input(col, row) {
    const previous_tile = this.main_grid.get_item(col, row);
    if (this.direction_accepting !== this.get_direction_from_us(col, row)) {
      return false;
    }
    if (this.free_slots() > 0) {
      return previous_tile.out !== (this.out + 2) % 4;
    } else {
      return false;
    }
  }
  
  accept_input(item, col, row) {
    for (let i = 0; i < this.input_count; i ++) {
      if (this.input_slots[i] == undefined) {
        this.input_slots[i] = item;
        break;
      }
    }
  }

  process_items() {
    while (this.free_slots() < this.input_count) {
      this.last_processed = (this.last_processed + 1) % this.input_count;
      const item = this.input_slots[this.last_processed];
      if (item != undefined) {
        this.input_slots[this.last_processed] = undefined;
        return item;
      }
    }
  }
  
  draw(x, y, width, height) {
    push();
    rectMode(CORNER);  // makes it x, y, width, height
    stroke(51);
    strokeWeight(this.camera.zoom > 0.5 ? 1 : 0);
    fill(100);
    const size = tile_size * this.camera.zoom;
    const draw_x = x + (this.grid_loc.x * size) - this.camera.x;
    const draw_y = y + (this.grid_loc.y * size) - this.camera.y;
    rect(draw_x, draw_y, size, size);
    // text(this.direction_accepting + ", " + this.last_processed, draw_x, draw_y);
    if (this.camera.zoom > 0.5) {
      strokeWeight(1);
      stroke(0);
      const half_size = Math.round(size / 2);
      // directional lines
      {
        const some_size = Math.round(size * 0.2);
        const top = createVector(draw_x + half_size, draw_y + some_size);
        const right = createVector(draw_x + size - some_size, draw_y + half_size);
        const bottom = createVector(draw_x + half_size, draw_y + size - some_size);
        const left = createVector(draw_x + some_size, draw_y + half_size);
        const center = createVector(draw_x + half_size, draw_y + half_size);
        if (this.out !== north) {
          line(top.x, top.y, center.x, center.y);
        }
        if (this.out !== east) {
          line(right.x, right.y, center.x, center.y);
        }
        if (this.out !== south) {
          line(bottom.x, bottom.y, center.x, center.y);
        }
        if (this.out !== west) {
          line(left.x, left.y, center.x, center.y);
        }
      }
      // smaller directional lines
      {
        const offset_size = Math.round(size * 0.3);
        const top = createVector(draw_x + half_size, draw_y + offset_size);
        const right = createVector(draw_x + size - offset_size, draw_y + half_size);
        const bottom = createVector(draw_x + half_size, draw_y + size - offset_size);
        const left = createVector(draw_x + offset_size, draw_y + half_size);
        const center = createVector(draw_x + half_size, draw_y + half_size);
        if (this.out === north) {
          line(top.x, top.y, center.x, center.y);
        } else if (this.out === east) {
          line(right.x, right.y, center.x, center.y);
        } else if (this.out === south) {
          line(bottom.x, bottom.y, center.x, center.y);
        } else if (this.out === west) {
          line(left.x, left.y, center.x, center.y);
        }
      }
      // arrow
      {
        strokeWeight(2);
        const some_size = Math.round(size * 0.4);
        const offset_size = Math.round(size * 0.1);
        const top = createVector(draw_x + half_size, draw_y + some_size);
        const right = createVector(draw_x + size - some_size, draw_y + half_size);
        const bottom = createVector(draw_x + half_size, draw_y + size - some_size);
        const left = createVector(draw_x + some_size, draw_y + half_size);
        if (this.out === north) {
          line(left.x, left.y - offset_size, top.x, top.y - offset_size);
          line(top.x, top.y - offset_size, right.x, right.y - offset_size);
        } else if (this.out === east) {
          line(top.x + offset_size, top.y, right.x + offset_size, right.y);
          line(right.x + offset_size, right.y, bottom.x + offset_size, bottom.y);
        } else if (this.out === south) {
          line(right.x, right.y + offset_size, bottom.x, bottom.y + offset_size);
          line(bottom.x, bottom.y + offset_size, left.x, left.y + offset_size);
        } else if (this.out === west) {
          line(bottom.x - offset_size, bottom.y, left.x - offset_size, left.y);
          line(left.x - offset_size, left.y, top.x - offset_size, top.y);
        }
      }
    }
    pop();
  }
}

class SplitterTile extends Tile {
  constructor(cam, in_dir, out_dir, main_grid, ore_grid) {
    super(cam, in_dir, out_dir, main_grid, ore_grid);
    this.input_count = 3;
    this.input_slots = (new Array(this.input_count)).fill(undefined);
    this.last_processed = 0;
    this.failures = 0;
  }

  on_new_frame() {
    super.on_new_frame();
  }
  
  can_accept_input(col, row) {
    const previous_tile = this.main_grid.get_item(col, row);
    if (this.free_slots() > 0) {
      // if (previous_tile.out === (this.in + 2) % 4) {
      //   console.log("can accept because right direction");
      // } else {
      //   console.log("can't accept input because wrong direction!");
      // }
      return previous_tile.out === (this.in + 2) % 4;
    } else {
      // console.log("can't accept because no free space");
      return false;
    }
  }
  
  accept_input(item, col, row) {
    for (let i = 0; i < this.input_count; i ++) {
      if (this.input_slots[i] == undefined) {
        this.input_slots[i] = item;
        break;
      }
    }
  }

  process_items() {
    for (const item in this.input_slots) {
      if (item != undefined) {
        continue;
      }
      return;
    }
    while (this.free_slots() < this.input_count) {
      this.last_processed = (this.last_processed + 1) % this.input_count;
      const item = this.input_slots[this.last_processed];
      if (item != undefined) {
        this.input_slots[this.last_processed] = undefined;
        return item;
      }
    }
  }

  update(col, row) {
    if (this.failures >= 2) {
      this.failures = 0;
      this.out = (this.out + 1) % 4;
      if (this.out === this.in) {
        this.out = (this.out + 1) % 4;
      }
    }
    if (!this.can_send_output(col, row)) {
      this.failures ++;
      return;
    }
    this.output_slot = this.process_items();
    if (this.output_slot == undefined) {
      return;
    }
    this.send_output(col, row);
    this.out = (this.out + 1) % 4;
    if (this.out === this.in) {
      this.out = (this.out + 1) % 4;
    }
  }
  
  draw(x, y, width, height) {
    push();
    rectMode(CORNER);  // makes it x, y, width, height
    stroke(51);
    strokeWeight(this.camera.zoom > 0.5 ? 1 : 0);
    fill(90);
    const size = tile_size * this.camera.zoom;
    const draw_x = x + (this.grid_loc.x * size) - this.camera.x;
    const draw_y = y + (this.grid_loc.y * size) - this.camera.y;
    rect(draw_x, draw_y, size, size);
    // text(this.direction_accepting + ", " + this.last_processed, draw_x, draw_y);
    if (this.camera.zoom > 0.5) {
      strokeWeight(1);
      stroke(0);
      const half_size = Math.round(size / 2);
      // directional lines
      {
        const some_size = Math.round(size * 0.2);
        const top = createVector(draw_x + half_size, draw_y + some_size);
        const right = createVector(draw_x + size - some_size, draw_y + half_size);
        const bottom = createVector(draw_x + half_size, draw_y + size - some_size);
        const left = createVector(draw_x + some_size, draw_y + half_size);
        const center = createVector(draw_x + half_size, draw_y + half_size);
        if (this.in !== north) {
          line(top.x, top.y, center.x, center.y);
        }
        if (this.in !== east) {
          line(right.x, right.y, center.x, center.y);
        }
        if (this.in !== south) {
          line(bottom.x, bottom.y, center.x, center.y);
        }
        if (this.in !== west) {
          line(left.x, left.y, center.x, center.y);
        }
      }
      // smaller directional lines
      {
        const offset_size = Math.round(size * 0.3);
        const top = createVector(draw_x + half_size, draw_y + offset_size);
        const right = createVector(draw_x + size - offset_size, draw_y + half_size);
        const bottom = createVector(draw_x + half_size, draw_y + size - offset_size);
        const left = createVector(draw_x + offset_size, draw_y + half_size);
        const center = createVector(draw_x + half_size, draw_y + half_size);
        if (this.in === north) {
          line(top.x, top.y, center.x, center.y);
        } else if (this.in === east) {
          line(right.x, right.y, center.x, center.y);
        } else if (this.in === south) {
          line(bottom.x, bottom.y, center.x, center.y);
        } else if (this.in === west) {
          line(left.x, left.y, center.x, center.y);
        }
      }
      // arrow
      {
        strokeWeight(2);
        const some_size = Math.round(size * 0.4);
        const offset_size = Math.round(size * 0.1);
        const top = createVector(draw_x + half_size, draw_y + some_size);
        const right = createVector(draw_x + size - some_size, draw_y + half_size);
        const bottom = createVector(draw_x + half_size, draw_y + size - some_size);
        const left = createVector(draw_x + some_size, draw_y + half_size);
        if (this.in === north) {
          line(left.x, left.y - (offset_size * 3), top.x, top.y - offset_size);
          line(top.x, top.y - offset_size, right.x, right.y - (offset_size * 3));
        } else if (this.in === east) {
          line(top.x + (offset_size * 3), top.y, right.x + offset_size, right.y);
          line(right.x + offset_size, right.y, bottom.x + (offset_size * 3), bottom.y);
        } else if (this.in === south) {
          line(right.x, right.y + (offset_size * 3), bottom.x, bottom.y + offset_size);
          line(bottom.x, bottom.y + offset_size, left.x, left.y + (offset_size * 3));
        } else if (this.in === west) {
          line(bottom.x - (offset_size * 3), bottom.y, left.x - offset_size, left.y);
          line(left.x - offset_size, left.y, top.x - (offset_size * 3), top.y);
        }
      }
    }
    pop();
  }
}
