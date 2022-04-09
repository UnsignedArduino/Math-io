class BaseTile extends GridItem {
  draw(x, y, width, height) {
    push();
    rectMode(CORNER);  // makes it x, y, width, height
    stroke(51);
    strokeWeight(1);
    fill(190);
    const size = tile_size * this.camera.zoom;
    const draw_x = x + (this.grid_loc.x * size) - this.camera.x;
    const draw_y = y + (this.grid_loc.y * size) - this.camera.y;
    rect(draw_x, draw_y, size, size);
    pop();
  }
}

class GeneratorTile extends GridItem {
  draw(x, y, width, height) {
    push();
    rectMode(CORNER);  // makes it x, y, width, height
    stroke(51);
    strokeWeight(1);
    fill(160);
    const size = tile_size * this.camera.zoom;
    const draw_x = x + (this.grid_loc.x * size) - this.camera.x;
    const draw_y = y + (this.grid_loc.y * size) - this.camera.y;
    rect(draw_x, draw_y, size, size);
    pop();
  }
}
