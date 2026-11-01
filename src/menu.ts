import { Button } from "./button";
import { FONT, HEIGHT, LEVELS, WIDTH } from "./config";

const LEVEL_COLORS = [
  "rgb(76, 175, 80)",
  "rgb(255, 170, 0)",
  "rgb(235, 50, 50)",
  "rgb(103, 58, 183)",
];

const CARD = { x: 40, y: 165, width: WIDTH - 80, height: 340 };

export class Menu {
  private readonly levelButtons: Button[] = [];

  constructor(private readonly fontFamily = FONT) {
    for (let i = 0; i < 4; i++) {
      const y = CARD.y + 50 + i * 80;
      this.levelButtons.push(
        new Button(WIDTH / 2, y, CARD.width - 40, 60, LEVELS[i + 1].name, fontFamily, LEVEL_COLORS[i], 24),
      );
    }
  }

  getButtons(): readonly Button[] { return this.levelButtons; }

  handleClick(mouseX: number, mouseY: number): number {
    return this.levelButtons.findIndex((b) => b.isClicked(mouseX, mouseY)) + 1;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    drawBackground(ctx);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `40px ${this.fontFamily}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("SELECT LEVEL", WIDTH / 2, 110);

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.roundRect(CARD.x, CARD.y + 8, CARD.width, CARD.height, 20);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(CARD.x, CARD.y, CARD.width, CARD.height, 20);
    ctx.fill();

    this.levelButtons.forEach((btn, i) => {
      btn.draw(ctx);
      drawDifficultyDots(ctx, btn, i + 1);
    });
  }
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "rgb(52, 58, 92)");
  gradient.addColorStop(1, "rgb(24, 26, 42)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const size = 40;
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.beginPath();
  for (let row = 0; row * size < HEIGHT + size; row++) {
    const offset = row % 2 === 0 ? 0 : size / 2;
    for (let x = -size; x < WIDTH + size; x += size) {
      const left = x + offset;
      const top = row * size;
      ctx.moveTo(left, top + size * 0.7);
      ctx.lineTo(left + size * 0.3, top + size * 0.2);
      ctx.lineTo(left + size * 0.6, top + size * 0.7);
      ctx.closePath();
    }
  }
  ctx.fill();
}

function drawDifficultyDots(ctx: CanvasRenderingContext2D, btn: Button, level: number): void {
  const b = btn.getBounds();
  const cy = b.y + b.height / 2;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i < level ? "#ffffff" : "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.arc(b.x + b.width - 62 + i * 14, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
