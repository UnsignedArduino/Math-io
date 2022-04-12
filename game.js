const bg_color = 220;
const bg_ro_color = 200;

const map_width = 1000;
const map_height = 1000;

const map_center_x = map_width / 2;
const map_center_y = map_height / 2;

const zoom_diff = 0.1;

const ore_seed = "math_io_ore";
const ore_spots = 1000;
const ore_spread = 0.5;
const ore_spread_sub = 0.1;

const all_tiles = [ExtractorTile, ConveyorTile, MergerTile];

const update_time = 100;  // ms per grid update

class MathIO {
  constructor() {
    this.camera = new Camera((map_center_x * tile_size) - (width / 2), 
                             (map_center_y * tile_size) - (height / 2));

    this.things_to_manage = [];

    this.prepare_grids();
    this.prepare_ui();

    this.last_grid_update = millis();
  }

  prepare_ui() {
    const group = new WidgetGroup();
    
    this.game_group = new WidgetGroup();
    group.widgets.push(this.game_group);
    
    this.things_to_manage.push(group);

    this.change_selected_tile(ExtractorTile);
    this.change_in_dir(south);
    this.change_out_dir(north);
  }
  
  prepare_grids() {   
    this.ore_grid = new Grid(this.camera, map_width, map_height);
    this.grid = new Grid(this.camera, map_width, map_height);
    
    const seeder = xmur3(ore_seed);
    const rander = sfc32(seeder(), seeder(), seeder(), seeder());
    const generate_blob = (x, y, chance) => {
      this.ore_grid.get_item(x, y);
      this.ore_grid.add_item(new OreTile(this.camera, undefined, undefined, this.grid, this.ore_grid), x, y);
      if (rander() < chance && y > 1) {
        generate_blob(x, y - 1, chance - ore_spread_sub)
      }
      if (rander() < chance && x < map_width - 1) {
        generate_blob(x + 1, y, chance - ore_spread_sub)
      }
      if (rander() < chance && y < map_height - 1) {
        generate_blob(x, y + 1, chance - ore_spread_sub)
      }
      if (rander() < chance && x > 1) {
        generate_blob(x - 1, y, chance - ore_spread_sub)
      }
    }
    for (let i = 0; i < ore_spots; i ++) {
      const x = Math.round(rander() * map_width);
      const y = Math.round(rander() * map_height);
      // console.log((i + 1) + "/" + ore_spots + ": " + x + ", " + y);
      generate_blob(x, y, ore_spread);
    }

    for (let x = map_center_x - 2; x < map_center_x + 2; x ++) {
      for (let y = map_center_y - 2; y < map_center_y + 2; y ++){
        this.grid.add_item(new BaseTile(this.camera, undefined, undefined, this.grid, this.ore_grid), x, y);
      }
    }

    this.things_to_manage.push(this.ore_grid);
    this.things_to_manage.push(this.grid);
  }

  on_mouse_drag() {
    if (keyIsPressed && keyCode === CONTROL) {
      const dmouseX = pmouseX - mouseX;
      const dmouseY = pmouseY - mouseY;
      this.camera.x += dmouseX;
      this.camera.y += dmouseY;
    } else {
      if (this.camera.zoom > 0.5) {
        this.maybe_add_stuff();
      }
    }
    this.restrain_cam();
    return false;
  }

  on_mouse_wheel(event) {
    const d = event.delta;
    if (keyIsPressed) {
      if (keyCode === SHIFT) {
        this.camera.x += d;
      } else if (keyCode === CONTROL) {
        let new_zoom = this.camera.zoom - (d / 100);
        new_zoom = Math.min(Math.max(new_zoom, 0 + zoom_diff), 2);
        new_zoom = Math.round(new_zoom * 10) / 10;
        this.set_zoom(new_zoom);
      }
    } else {
      this.camera.y += d;
    }
    this.restrain_cam();
    return false;
  }

  on_mouse_press() {
    if (keyIsPressed && keyCode === CONTROL) {
      return;
    }
    if (this.camera.zoom > 0.5) {
      this.maybe_add_stuff();
    }
    return false;
  }

  on_key_press() {
    const code = key.charAt(0);
    const char = code.charCodeAt(0)
    if (key === "r") {
      this.change_out_dir((this.out_dir + 1) % 4);
    } else if (key === "R") {
      this.change_in_dir((this.in_dir + 1) % 4);
    } else if (char >= 49 &&  // char "1"
               char < 49 + all_tiles.length) {
      const i = parseInt(code, 10) - 1;
      this.change_selected_tile(all_tiles[i]);
    }
    return false;
  }

  cursor_loc() {
    return createVector(
      Math.floor((this.camera.x + mouseX) / tile_size / this.camera.zoom),
      Math.floor((this.camera.y + mouseY) / tile_size / this.camera.zoom)
    );
  }

  set_zoom(new_zoom) {
    const previous_loc = createVector(
      (this.camera.x + mouseX) / this.camera.zoom,
      (this.camera.y + mouseY) / this.camera.zoom
    );
    console.log("new zoom: " + new_zoom);
    this.camera.zoom = new_zoom;
    const new_loc = createVector(
      (this.camera.x + mouseX) / this.camera.zoom,
      (this.camera.y + mouseY) / this.camera.zoom
    );
    const diff_loc = previous_loc.sub(new_loc);
    const adjusted_loc = diff_loc.mult(this.camera.zoom);
    this.camera.x += adjusted_loc.x;
    this.camera.y += adjusted_loc.y;
  }

  restrain_cam() {
    const screen_top_row = Math.floor(this.camera.y / tile_size / this.camera.zoom);
    let screen_bottom_row = Math.floor((this.camera.y + height) / tile_size / this.camera.zoom);
    const screen_left_col = Math.floor(this.camera.x / tile_size / this.camera.zoom);
    let screen_right_col = Math.floor((this.camera.x + width) / tile_size / this.camera.zoom);
    if (screen_top_row < 0) {
      this.camera.y = 0;
    } else if (screen_bottom_row >= map_height) {
      while (screen_bottom_row >= map_height) {
        this.camera.y --;
        screen_bottom_row = Math.floor((this.camera.y + height) / tile_size / this.camera.zoom);
      }
    }
    if (screen_left_col < 0) {
      this.camera.x = 0;
    } else if (screen_right_col >= map_width) {
      while (screen_right_col >= map_width) {
        this.camera.x --;
        screen_right_col = Math.floor((this.camera.x + width) / tile_size / this.camera.zoom);
      }
    }
  }

  maybe_add_stuff() {
    const cursor = this.cursor_loc();
    if (mouseButton === LEFT) {
      this.grid.get_item(cursor.x, cursor.y);
      if (this.grid.get_item(cursor.x, cursor.y) == undefined) {
        this.grid.add_item(new this.selected_tile(this.camera, this.in_dir, this.out_dir, this.grid, this.ore_grid), cursor.x, cursor.y);
      }
    } else if (mouseButton === RIGHT) {
      const item = this.grid.get_item(cursor.x, cursor.y);
      if (item != undefined && !(item instanceof BaseTile)) {
        this.grid.remove_item(cursor.x, cursor.y);
      }
    }
  }

  change_selected_tile(new_tile) {
    this.selected_tile = new_tile;
    console.log("selected tile: " + new_tile.name);
    this.cursor_tile = new new_tile(this.camera, this.in_dir, this.out_dir, this.grid, this.ore_grid);
    this.change_in_dir(this.in_dir);
    this.change_out_dir(this.out_dir);
  }

  change_in_dir(dir) {
    this.in_dir = dir;
    if (this.selected_tile === ConveyorTile && this.in_dir === this.out_dir) {
      this.in_dir = (this.in_dir + 1) % 4;
    }
    console.log("in dir: " + this.in_dir);
    console.log("out dir: " + this.out_dir);
    this.cursor_tile = new this.selected_tile(this.camera, this.in_dir, this.out_dir, this.grid, this.ore_grid);
  }

  change_out_dir(dir) {
    this.out_dir = dir;
    if (this.selected_tile === ConveyorTile && this.in_dir === this.out_dir) {
      this.out_dir = (this.out_dir + 1) % 4;
    }
    console.log("in dir: " + this.in_dir);
    console.log("out dir: " + this.out_dir);
    this.cursor_tile = new this.selected_tile(this.camera, this.in_dir, this.out_dir, this.grid, this.ore_grid);
  }
  
  update() {
    for (const item of this.things_to_manage) {
      if (item !== this.grid) {
        item.update();
      }
    }
    if (millis() - this.last_grid_update > update_time) {
      this.last_grid_update = millis();
      this.grid.update();
    }
  }

  draw(x, y, width, height) {
    background(this.camera.zoom > 0.5 ? bg_color : bg_ro_color);
    
    for (const item of this.things_to_manage) {
      item.draw(x, y, width, height);
    }

    // cursor location
    push();
    strokeWeight(0);
    fill(0);
    textSize(12);
    textAlign(LEFT, BOTTOM);
    const loc = this.cursor_loc();
    text(loc.x + ", " + loc.y, mouseX, mouseY)
    pop();

    // cursor preview
    if (this.camera.zoom > 0.5) {
      this.cursor_tile.grid_loc = loc;
      this.cursor_tile.draw(x, y, width, height);
    } else {
      // cursor block
      push();
      rectMode(CORNER);  // makes it x, y, width, height
      stroke(0);
      strokeWeight(1);
      noFill();
      const size = tile_size * this.camera.zoom;
      const draw_x = (loc.x * size) - this.camera.x;
      const draw_y = (loc.y * size) - this.camera.y;
      rect(draw_x, draw_y, size, size);
      pop();
    }
  }
}
