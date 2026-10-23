import { contains, Rect } from "./gameobject";

export class Button {
  private readonly bounds: Rect;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    readonly label: string,
    private readonly fontFamily: string,
    readonly color: string,
    private readonly fontSize = 20,
  ) {
    this.bounds = { x: x - width / 2, y: y - height / 2, width, height };
  }

  getBounds(): Rect {
    return { ...this.bounds };
  }

  getCenter(): { x: number; y: number } {
    const b = this.bounds;
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const b = this.bounds;
    const radius = Math.min(14, b.height / 2);

    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.roundRect(b.x, b.y + 4, b.width, b.height, radius);
    ctx.fill();

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.width, b.height, radius);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.label, b.x + b.width / 2, b.y + b.height / 2);
  }

  isClicked(mouseX: number, mouseY: number): boolean {
    return contains(this.bounds, mouseX, mouseY);
  }
}
