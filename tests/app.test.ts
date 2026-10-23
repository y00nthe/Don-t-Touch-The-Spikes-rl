import { describe, expect, it } from "vitest";
import { App, GameState } from "../src/app";
import { Menu } from "../src/menu";
import { MemoryStorage, defaultStorage } from "../src/storage";
import { createFakeCtx, seededRng } from "./fakeCtx";

function makeApp() {
  return new App(new Menu(), { storage: new MemoryStorage(), rng: seededRng(7) });
}

function startLevel(app: App, level: number) {
  const btn = new Menu().getButtons()[level - 1].getCenter();
  app.handleMouseDown(btn.x, btn.y);
}

describe("App (pętla główna)", () => {
  it("startuje w menu", () => {
    const app = makeApp();
    expect(app.getState()).toBe(GameState.MENU);
    expect(app.getGame()).toBeNull();
  });

  it("klik w przycisk poziomu uruchamia grę na tym poziomie", () => {
    const app = makeApp();
    startLevel(app, 3);
    expect(app.getState()).toBe(GameState.GAME);
    expect(app.getGame()!.getDifficulty()).toBe(3);
  });

  it("klik poza przyciskami nic nie robi", () => {
    const app = makeApp();
    app.handleMouseDown(5, 5);
    expect(app.getState()).toBe(GameState.MENU);
  });

  it("klawisze w menu są ignorowane", () => {
    const app = makeApp();
    app.handleKeyDown("Space");
    app.handleKeyDown("Escape");
    expect(app.getState()).toBe(GameState.MENU);
  });

  it("Escape wraca do menu", () => {
    const app = makeApp();
    startLevel(app, 1);
    app.handleKeyDown("Escape");
    expect(app.getState()).toBe(GameState.MENU);
    expect(app.getGame()).toBeNull();
  });

  it("klik w trakcie gry i po przegranej nic nie robi", () => {
    const app = makeApp();
    startLevel(app, 1);
    const game = app.getGame()!;
    app.handleMouseDown(0, 0);
    expect(game.isStarted()).toBe(false);

    app.handleKeyDown("Space");
    game.getBird().setY(10_000);
    game.update(0.016);
    expect(game.isGameOver()).toBe(true);
    app.handleMouseDown(0, 0);
    expect(game.isGameOver()).toBe(true);
  });

  it("klawisze trafiają do gry", () => {
    const app = makeApp();
    startLevel(app, 1);
    app.handleKeyDown("Space");
    expect(app.getGame()!.isStarted()).toBe(true);
  });

  it("frame rysuje menu albo grę", () => {
    const app = makeApp();
    let f = createFakeCtx();
    app.frame(0.016, f.ctx);
    expect(f.texts()).toContain("Easy");

    startLevel(app, 1);
    app.handleKeyDown("Space");
    const y0 = app.getGame()!.getBird().getY();
    f = createFakeCtx();
    app.frame(0.016, f.ctx);
    expect(f.texts()).toContain("BEST: 0");
    expect(app.getGame()!.getBird().getY()).not.toBe(y0);
  });
});

describe("storage", () => {
  it("MemoryStorage zapisuje i odczytuje", () => {
    const s = new MemoryStorage();
    expect(s.getItem("a")).toBeNull();
    s.setItem("a", "1");
    expect(s.getItem("a")).toBe("1");
  });

  it("defaultStorage działa bez przeglądarki", () => {
    const s = defaultStorage();
    s.setItem("x", "y");
    expect(s.getItem("x")).toBe("y");
  });
});
