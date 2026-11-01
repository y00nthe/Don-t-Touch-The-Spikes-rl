import { GamePanel, GamePanelOptions } from "./gamepanel";
import { Menu } from "./menu";

export enum GameState {
  MENU = "MENU",
  GAME = "GAME",
}

export class App {
  private state = GameState.MENU;
  private game: GamePanel | null = null;

  constructor(
    private readonly menu: Menu,
    private readonly gameOptions: GamePanelOptions = {},
  ) {}

  getState(): GameState { return this.state; }
  getGame(): GamePanel | null { return this.game; }

  handleMouseDown(x: number, y: number): void {
    if (this.state === GameState.MENU) {
      const level = this.menu.handleClick(x, y);
      if (level > 0) {
        this.game = new GamePanel(level, this.gameOptions);
        this.state = GameState.GAME;
      }
    }
  }

  handleKeyDown(code: string): void {
    if (this.state !== GameState.GAME || !this.game) return;
    if (code === "Escape") {
      this.game = null;
      this.state = GameState.MENU;
      return;
    }
    this.game.handleInput(code);
  }

  frame(dt: number, ctx: CanvasRenderingContext2D): void {
    if (this.state === GameState.MENU) {
      this.menu.draw(ctx);
    } else if (this.game) {
      this.game.update(dt);
      this.game.draw(ctx);
    }
  }
}
