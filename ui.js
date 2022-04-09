class Widget {
  constructor() {
    
  }

  update() {
    
  }

  draw(x, y, width, height) {
    
  }
}

class WidgetButton extends Widget {
  constructor(p5clickable) {
    super();
    this.clickable = p5clickable;
  }

  draw(x, y, width, height) {
    this.clickable.draw();
  }
}

class WidgetGroup {
  constructor() {
    this.widgets = [];
  }

  update() {
    for (let widget of this.widgets) {
      widget.update();
    }
  }

  draw(x, y, width, height) {
    for (let widget of this.widgets) {
      widget.draw(x, y, width, height);
    }
  }
}

const button_color = "#FFFFFF";
const button_hover_color = "#D0D0D0";
const button_click_color = "#9E9E9E";
const button_disabled_color = "#505050";

function create_button(text, x, y, width, height, on_click) {
  let btn = new Clickable();
  btn.text = text;
  btn.x = x;
  btn.y = y;
  btn.width = width;
  btn.height = height;
  btn.enabled = true;
  btn.onOutside = () => {
    btn.color = btn.enabled ? button_color : button_disabled_color;
  };
  btn.onHover = () => {
    btn.color = btn.enabled ? button_hover_color : button_disabled_color;
  };
  btn.on_click = on_click;
  btn.onPress = () => {
    if (!btn.enabled) {
      return;
    }
    btn.color = button_click_color;
    btn.on_click();
  };
  return new WidgetButton(btn);
}
