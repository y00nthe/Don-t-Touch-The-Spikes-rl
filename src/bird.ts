import { GameObject } from "./gameobject";
import { BIRD_GRAVITY, BIRD_JUMP_STRENGTH } from "./config";

export class Bird extends GameObject {
  private velocityX = 0;
  private velocityY = 0;
  private facingRight = true;

  constructor(x: number, y: number) {
    super(x, y, 20, 20);
  }

  getVelocityX(): number { return this.velocityX; }
  getVelocityY(): number { return this.velocityY; }
  isFacingRight(): boolean { return this.facingRight; }

  setVelocityX(vx: number): void {
    this.velocityX = vx;
    if (vx !== 0) this.facingRight = vx > 0;
  }

  reverseVelocityX(): void {
    this.setVelocityX(-this.velocityX);
  }

  jump(): void {
    this.velocityY = BIRD_JUMP_STRENGTH;
  }

  override update(dt: number): void {
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    this.velocityY += BIRD_GRAVITY * dt;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#000000";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    const beakW = this.width * 0.5;
    const beakH = this.height * 0.5;
    const centerY = this.y + this.height / 2;

    ctx.fillStyle = "rgb(255, 165, 0)";
    ctx.beginPath();
    if (this.facingRight) {
      ctx.moveTo(this.x + this.width, centerY - beakH / 2);
      ctx.lineTo(this.x + this.width + beakW, centerY);
      ctx.lineTo(this.x + this.width, centerY + beakH / 2);
    } else {
      ctx.moveTo(this.x, centerY - beakH / 2);
      ctx.lineTo(this.x - beakW, centerY);
      ctx.lineTo(this.x, centerY + beakH / 2);
    }
    ctx.closePath();
    ctx.fill();
  }
}
