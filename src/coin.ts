import { GameObject } from "./gameobject";

export class Coin extends GameObject {
  private totalTime = 0;
  private readonly texture: CanvasImageSource | null;

  constructor(x: number, y: number, texture: CanvasImageSource | null = null) {
    super(x, y, 30, 30);
    this.texture = texture;
  }

  getTotalTime(): number { return this.totalTime; }

  override update(dt: number): void {
    this.totalTime += dt;
  }

  getAlpha(): number {
    const sineValue = Math.sin(this.totalTime * Math.PI * 2);
    return (205 + sineValue * 50) / 255;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.getAlpha();
    if (this.texture) {
      ctx.drawImage(this.texture, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = "#f5c518";
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
