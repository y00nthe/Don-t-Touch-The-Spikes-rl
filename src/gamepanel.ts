import { Bird } from "./bird";
import { Coin } from "./coin";
import {
  FONT,
  HEIGHT,
  LEVELS,
  MAX_DT,
  SPIKE_DELAY_TIME,
  WALL_MARGIN,
  WIDTH,
} from "./config";
import { intersects } from "./gameobject";
import { Spike, SPIKE_HEIGHT, SPIKE_WIDTH } from "./spike";
import { defaultStorage, KeyValueStorage } from "./storage";

export const STORAGE_KEYS = {
  highScore: "dtts.highScore",
  coins: "dtts.coins",
} as const;

export const SPIKE_SLOTS = Math.floor((HEIGHT - 2 * WALL_MARGIN) / SPIKE_HEIGHT);

export const MIN_FREE_SLOTS = 4;

export interface GamePanelOptions {
  rng?: () => number;
  storage?: KeyValueStorage;
  coinTexture?: CanvasImageSource | null;
  mainFont?: string;
}

export class GamePanel {
  private bird!: Bird;
  private spikesLeft: Spike[] = [];
  private spikesRight: Spike[] = [];
  private currentCoin: Coin | null = null;

  private score = 0;
  private highScore = 0;
  private coins = 0;
  private gameOver = false;
  private started = false;

  private readonly difficulty: number;
  private readonly speed: number;
  private readonly spikeFrequency: number;

  private waitingForSpikes = false;
  private spikeDelayTimer = 0;

  private readonly rng: () => number;
  private readonly storage: KeyValueStorage;
  private readonly coinTexture: CanvasImageSource | null;
  private readonly mainFont: string;

  constructor(level: number, options: GamePanelOptions = {}) {
    this.difficulty = Math.min(4, Math.max(1, Math.trunc(level) || 1));
    this.speed = LEVELS[this.difficulty].speed;
    this.spikeFrequency = LEVELS[this.difficulty].spikeFrequency;

    this.rng = options.rng ?? Math.random;
    this.storage = options.storage ?? defaultStorage();
    this.coinTexture = options.coinTexture ?? null;
    this.mainFont = options.mainFont ?? FONT;

    this.loadGameData();
    this.restartGame();
  }

  getBird(): Bird { return this.bird; }
  getSpikesLeft(): readonly Spike[] { return this.spikesLeft; }
  getSpikesRight(): readonly Spike[] { return this.spikesRight; }
  getCurrentCoin(): Coin | null { return this.currentCoin; }
  getScore(): number { return this.score; }
  getHighScore(): number { return this.highScore; }
  getCoins(): number { return this.coins; }
  getDifficulty(): number { return this.difficulty; }
  getSpeed(): number { return this.speed; }
  getSpikeFrequency(): number { return this.spikeFrequency; }
  isGameOver(): boolean { return this.gameOver; }
  isStarted(): boolean { return this.started; }
  isWaitingForSpikes(): boolean { return this.waitingForSpikes; }

  private loadGameData(): void {
    this.highScore = readInt(this.storage.getItem(STORAGE_KEYS.highScore));
    this.coins = readInt(this.storage.getItem(STORAGE_KEYS.coins));
  }

  private saveGameData(): void {
    this.storage.setItem(STORAGE_KEYS.highScore, String(this.highScore));
    this.storage.setItem(STORAGE_KEYS.coins, String(this.coins));
  }

  restartGame(): void {
    this.bird = new Bird(WIDTH / 2 - 10, HEIGHT / 2 - 10);
    this.bird.setVelocityX(this.speed);
    this.spikesLeft = [];
    this.spikesRight = [];
    this.score = 0;
    this.gameOver = false;
    this.started = false;
    this.waitingForSpikes = false;
    this.spikeDelayTimer = 0;
    this.currentCoin = null;

    this.generateSpikes();
    this.spawnCoin();
  }

  getSpikeCount(): number {
    const count = this.spikeFrequency + Math.floor(this.score / 5);
    return Math.min(count, SPIKE_SLOTS - MIN_FREE_SLOTS);
  }

  private generateSpikes(): void {
    const leftSide = this.bird.getVelocityX() < 0;
    const slots = Array.from({ length: SPIKE_SLOTS }, (_, i) => i);

    const count = this.getSpikeCount();
    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(this.rng() * (slots.length - i));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    const chosen = slots.slice(0, count).sort((a, b) => a - b);

    const x = leftSide ? 0 : WIDTH - SPIKE_WIDTH;
    const spikes = chosen.map((slot) => new Spike(x, WALL_MARGIN + slot * SPIKE_HEIGHT, leftSide));

    if (leftSide) this.spikesLeft = spikes;
    else this.spikesRight = spikes;
  }

  private spawnCoin(): void {
    const size = 30;
    const minX = 60;
    const maxX = WIDTH - 60 - size;
    const minY = WALL_MARGIN + 40;
    const maxY = HEIGHT - WALL_MARGIN - 40 - size;
    const x = minX + this.rng() * (maxX - minX);
    const y = minY + this.rng() * (maxY - minY);
    this.currentCoin = new Coin(x, y, this.coinTexture);
  }

  private checkSpikeCollision(spike: Spike): boolean {
    return intersects(this.bird.getBounds(), spike.getHitbox());
  }

  private endGame(): void {
    this.gameOver = true;
    if (this.score > this.highScore) this.highScore = this.score;
    this.saveGameData();
  }

  private onWallBounce(): void {
    this.score++;
    this.spikesLeft = [];
    this.spikesRight = [];
    this.waitingForSpikes = true;
    this.spikeDelayTimer = 0;
    if (!this.currentCoin && this.score % 3 === 0) this.spawnCoin();
  }

  update(dt: number): void {
    dt = Math.min(Math.max(dt, 0), MAX_DT);
    this.currentCoin?.update(dt);

    if (this.gameOver || !this.started) return;

    this.bird.update(dt);
    const bird = this.bird;

    for (const spike of [...this.spikesLeft, ...this.spikesRight]) {
      if (this.checkSpikeCollision(spike)) {
        this.endGame();
        return;
      }
    }

    if (bird.getY() < WALL_MARGIN || bird.getY() + bird.getHeight() > HEIGHT - WALL_MARGIN) {
      this.endGame();
      return;
    }

    if (bird.getX() <= 0) {
      bird.setX(0);
      bird.reverseVelocityX();
      this.onWallBounce();
    } else if (bird.getX() + bird.getWidth() >= WIDTH) {
      bird.setX(WIDTH - bird.getWidth());
      bird.reverseVelocityX();
      this.onWallBounce();
    }

    if (this.currentCoin && intersects(bird.getBounds(), this.currentCoin.getBounds())) {
      this.coins++;
      this.currentCoin = null;
      this.saveGameData();
    }

    if (this.waitingForSpikes) {
      this.spikeDelayTimer += dt;
      if (this.spikeDelayTimer >= SPIKE_DELAY_TIME) {
        this.generateSpikes();
        this.waitingForSpikes = false;
      }
    }
  }

  handleInput(key: string): void {
    if (this.gameOver) {
      if (key === "Space") this.restartGame();
      return;
    }
    if (key === "Space") this.jump();
  }

  jump(): void {
    if (this.gameOver) return;
    this.started = true;
    this.bird.jump();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "rgb(235, 235, 235)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "rgb(200, 200, 200)";
    ctx.font = `120px ${this.mainFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(this.score), WIDTH / 2, HEIGHT / 2);

    ctx.fillStyle = "rgb(170, 170, 170)";
    ctx.font = `20px ${this.mainFont}`;
    ctx.fillText(`BEST: ${this.highScore}`, WIDTH / 2, HEIGHT / 2 + 80);
    ctx.fillText(`MONETY: ${this.coins}`, WIDTH / 2, HEIGHT / 2 + 108);

    drawCeilingAndFloor(ctx);
    for (const s of this.spikesLeft) s.draw(ctx);
    for (const s of this.spikesRight) s.draw(ctx);
    this.currentCoin?.draw(ctx);
    this.bird.draw(ctx);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (!this.started && !this.gameOver) {
      ctx.fillStyle = "rgb(60, 60, 60)";
      ctx.font = `20px ${this.mainFont}`;
      ctx.fillText("Spacja – skok", WIDTH / 2, HEIGHT / 2 + 150);
    }

    if (this.gameOver) this.drawGameOver(ctx);
  }

  private drawGameOver(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgb(235, 50, 50)";
    ctx.font = `48px ${this.mainFont}`;
    ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = `22px ${this.mainFont}`;
    ctx.fillText(`Wynik: ${this.score}`, WIDTH / 2, HEIGHT / 2 - 10);
    ctx.fillText(`Best: ${this.highScore}`, WIDTH / 2, HEIGHT / 2 + 20);
    ctx.font = `16px ${this.mainFont}`;
    ctx.fillText("Spacja – restart,  Esc – menu", WIDTH / 2, HEIGHT / 2 + 70);
  }
}

function readInt(value: string | null): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function drawCeilingAndFloor(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "rgb(50, 50, 50)";
  ctx.fillRect(0, 0, WIDTH, WALL_MARGIN - 14);
  ctx.fillRect(0, HEIGHT - WALL_MARGIN + 14, WIDTH, WALL_MARGIN - 14);

  const tooth = 20;
  ctx.beginPath();
  for (let x = 0; x < WIDTH; x += tooth) {
    ctx.moveTo(x, WALL_MARGIN - 14);
    ctx.lineTo(x + tooth / 2, WALL_MARGIN);
    ctx.lineTo(x + tooth, WALL_MARGIN - 14);

    ctx.moveTo(x, HEIGHT - WALL_MARGIN + 14);
    ctx.lineTo(x + tooth / 2, HEIGHT - WALL_MARGIN);
    ctx.lineTo(x + tooth, HEIGHT - WALL_MARGIN + 14);
  }
  ctx.closePath();
  ctx.fill();
}
