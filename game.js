class MathIO {
  constructor() {
    this.camera = new Camera(width / 2, height / 2);
    this.grid = new Grid(this.camera);

    this.things_to_manage = [
      this.grid
    ]
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
