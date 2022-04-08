class Grid {
  constructor(cam) {
    this.camera = cam;
    this.grid = [
      [undefined]
    ];
    this.all_items = [];
  }

  add_item(item, x, y) {
    if (y > this.grid.length) {
      while (this.grid.length < y) {
        this.grid.push([]);
      }
    }
    const row = this.grid[y];
    if (x > row.length) {
      while (row.length < x) {
        row.push([]);
      }
    }
    row[x] = item;
    this.grid[y] = row;
    item["grid_x"] = x;
    item["grid_y"] = y;
    this.all_items.push(item);
  }

  get_item(x, y) {
    const row = this.grid[y];
    if (row == undefined) {
      return undefined;
    } else {
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
      item["grid_x"] = undefined;
      item["grid_y"] = undefined;
      const index = this.all_items.indexOf(item);
      if (index != -1) {
        this.all_items.splice(index, 1);
      }
    }
    row[x] = undefined;
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