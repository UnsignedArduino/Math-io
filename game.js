const map_width = 1000;
const map_height = 1000;

const map_center_x = map_width / 2;
const map_center_y = map_height / 2;

class MathIO {
  constructor() {
    this.camera = new Camera((map_center_x * tile_size) - (width / 2), 
                             (map_center_y * tile_size) - (height / 2));
    this.grid = new Grid(this.camera);

    this.things_to_manage = [
      this.grid
    ]

    this.prepare_grid();
  }

  prepare_grid() {
    for (let x = map_center_x - 2; x < map_center_x + 2; x ++) {
      for (let y = map_center_y - 2; y < map_center_y + 2; y ++){
        this.grid.add_item(new BaseTile(this.camera), x, y);
      }
    }
  }

  on_mouse_drag() {
    // Allows us to pan around
    const dmouseX = pmouseX - mouseX;
    const dmouseY = pmouseY - mouseY;
    this.camera.x += dmouseX;
    this.camera.y += dmouseY;
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
  }
}
