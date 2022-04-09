const map_width = 1000;
const map_height = 1000;

const map_center_x = map_width / 2;
const map_center_y = map_height / 2;

class MathIO {
  constructor() {
    this.camera = new Camera((map_center_x * tile_size) - (width / 2), 
                             (map_center_y * tile_size) - (height / 2));

    this.things_to_manage = [];

    this.prepare_grid();
    this.prepare_ui();
  }

  prepare_ui() {
    const group = new WidgetGroup();
    
    this.game_group = new WidgetGroup();
    group.widgets.push(this.game_group);
    
    this.things_to_manage.push(group);

    this.selected_tile = GeneratorTile;
  }
  
  prepare_grid() {
    this.grid = new Grid(this.camera);
    
    for (let x = map_center_x - 2; x < map_center_x + 2; x ++) {
      for (let y = map_center_y - 2; y < map_center_y + 2; y ++){
        this.grid.add_item(new BaseTile(this.camera), x, y);
      }
    }

    this.things_to_manage.push(this.grid);
  }

  on_mouse_drag() {
    if (keyIsPressed && keyCode === CONTROL) {
      // Allows us to pan around
      const dmouseX = pmouseX - mouseX;
      const dmouseY = pmouseY - mouseY;
      this.camera.x += dmouseX;
      this.camera.y += dmouseY;
    }
  }

  on_mouse_press() {
    const cursor = this.cursor_loc();
    if (keyIsPressed && keyCode === CONTROL) {
      return;
    }
    if (mouseButton === LEFT) {
      this.grid.get_item(cursor.x, cursor.y);
      if (this.grid.get_item(cursor.x, cursor.y) == undefined) {
        this.grid.add_item(new this.selected_tile(this.camera), cursor.x, cursor.y);
      }
    } else if (mouseButton === RIGHT) {
      const item = this.grid.get_item(cursor.x, cursor.y);
      if (item != undefined && !(item instanceof BaseTile)) {
        this.grid.remove_item(cursor.x, cursor.y);
      }
    }
  }

  cursor_loc() {
    return createVector(
      Math.floor((this.camera.x + mouseX) / tile_size),
      Math.floor((this.camera.y + mouseY) / tile_size)
    );
  }

  update() {
    for (const item of this.things_to_manage) {
      item.update();
    }
  }

  draw(x, y, width, height) {
    for (const item of this.things_to_manage) {
      item.draw(x, y, width, height);
    }
    
    push();
    strokeWeight(0);
    fill(0);
    textSize(12);
    textAlign(LEFT, BOTTOM);
    const loc = this.cursor_loc();
    text(loc.x + ", " + loc.y, mouseX, mouseY)
    pop();
    
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
