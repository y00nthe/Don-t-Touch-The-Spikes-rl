import { GameObject, Rect } from "./gameobject";

export const SPIKE_WIDTH = 16;
export const SPIKE_HEIGHT = 36;

export class Spike extends GameObject {
  private readonly leftSide: boolean;

  constructor(x: number, y: number, leftSide: boolean) {
    super(x, y, SPIKE_WIDTH, SPIKE_HEIGHT);
    this.leftSide = leftSide;
  }

  isLeftSide(): boolean { return this.leftSide; }

  getHitbox(): Rect {
    const margin = 5;
    return {
      x: this.x + margin,
      y: this.y + margin,
      width: this.width - 2 * margin,
      height: this.height - 2 * margin,
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "rgb(50, 50, 50)";
    ctx.beginPath();
    if (this.leftSide) {
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height / 2);
      ctx.lineTo(this.x, this.y + this.height);
    } else {
      ctx.moveTo(this.x + this.width, this.y);
      ctx.lineTo(this.x, this.y + this.height / 2);
      ctx.lineTo(this.x + this.width, this.y + this.height);
    }
    ctx.closePath();
    ctx.fill();
  }
}
