class MathIO {
  constructor() {
    this.camera = new Camera(-(width / 2), -(height / 2));
    this.grid = new Grid(this.camera);

    this.things_to_manage = [
      this.grid
    ]

    this.grid.add_item(new BaseTile(this.camera), 0, 0);
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
