const tile_size = 32;

class Grid {
  constructor(cam, rows, cols) {
    this.camera = cam;
    this.grid = [];
    this.rows = rows;
    this.columns = cols;
    // for (let y = 0; y < rows; y ++) {
    //   this.grid.push([]);
    //   for (let x = 0; x < cols; x ++) {
    //     this.grid[y].push(undefined);
    //   }
    // }
    this.all_items = [];
  }

  add_item(item, x, y) {
    if (y >= this.grid.length) {
      while (this.grid.length <= y) {
        this.grid.push([]);
      }
    }
    const row = this.grid[y];
    if (x >= row.length) {
      while (row.length <= x) {
        row.push([]);
      }
    }
    row[x] = item;
    this.grid[y] = row;
    item.grid_loc = createVector(x, y);
    this.all_items.push(item);
  }

  get_item(x, y) {
    const row = this.grid[y];
    if (row == undefined) {
      return undefined;
    } else {
      if (Array.isArray(row[x]) && row[x].length === 0) {
        row[x] = undefined;
      }
      return row[x];
    }
  }
  
  remove_item(x, y) {
    if (y > this.grid.length) {
      return undefined;
    }
    const row = this.grid[y];
    if (x > row.length) {
      return undefined;
    }
    const item = row[x];
    if (item != undefined) {
      item.grid_loc = undefined;
      const index = this.all_items.indexOf(item);
      if (index != -1) {
        this.all_items.splice(index, 1);
      }
    }
    row[x] = undefined;
    this.grid[y] = row;
    return item;
  }

  reorder_items() {
    // this reorders the items so they are backwards from the conveyor belts direction
    // this prevents items from teleporting like 5 conveyor belts a tick
    
  }
  
  update() {
    for (const item of this.all_items) {
      item.update(item.grid_loc.x, item.grid_loc.y);
    }
  }

  draw(x, y, width, height) {
    const screen_top_row = Math.floor(this.camera.y / tile_size / this.camera.zoom);
    const screen_bottom_row = Math.floor((this.camera.y + height) / tile_size / this.camera.zoom);
    const screen_left_col = Math.floor(this.camera.x / tile_size / this.camera.zoom);
    const screen_right_col = Math.floor((this.camera.x + width) / tile_size / this.camera.zoom);
    for (const item of this.all_items) {
      if (item.grid_loc.x >= screen_left_col && item.grid_loc.x <= screen_right_col &&
          item.grid_loc.y >= screen_top_row && item.grid_loc.y <= screen_bottom_row) {
        item.draw(x, y, width, height);
      }
    }
  }
}

class GridItem {
  constructor(cam) {
    this.camera = cam;
  }

  update() {
    
  }

  draw(x, y, width, height) {
    
  }
}
