const tile_size = 32;

class Grid {
  constructor(cam) {
    this.camera = cam;
    this.grid = [
      [undefined]
    ];
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
  
  update() {
    for (const item of this.all_items) {
      item.update();
    }
  }

  draw(x, y, width, height) {
    for (const item of this.all_items) {
      item.draw(x, y, width, height);
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
