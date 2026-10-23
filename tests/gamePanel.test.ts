import { describe, expect, it } from "vitest";
import { HEIGHT, LEVELS, SPIKE_DELAY_TIME, WALL_MARGIN, WIDTH } from "../src/config";
import { GamePanel, MIN_FREE_SLOTS, SPIKE_SLOTS, STORAGE_KEYS } from "../src/gamepanel";
import { MemoryStorage } from "../src/storage";
import { createFakeCtx, seededRng } from "./fakeCtx";

function makeGame(level = 1, storage = new MemoryStorage(), seed = 42) {
  return new GamePanel(level, { storage, rng: seededRng(seed) });
}

function hover(game: GamePanel) {
  const b = game.getBird();
  b.setY(HEIGHT / 2 - 10);
  b.jump();

  (b as unknown as { velocityY: number }).velocityY = 0;
}

describe("GamePanel – start", () => {
  it.each([1, 2, 3, 4])("poziom %i ustawia prędkość i liczbę kolców", (level) => {
    const g = makeGame(level);
    expect(g.getDifficulty()).toBe(level);
    expect(g.getSpeed()).toBe(LEVELS[level].speed);
    expect(g.getSpikeFrequency()).toBe(LEVELS[level].spikeFrequency);
    expect(g.getBird().getVelocityX()).toBe(LEVELS[level].speed);
  });

  it("nieprawidłowy poziom jest przycinany do 1-4", () => {
    expect(makeGame(0).getDifficulty()).toBe(1);
    expect(makeGame(99).getDifficulty()).toBe(4);
  });

  it("ptak startuje na środku, gra czeka na pierwszy skok", () => {
    const g = makeGame();
    const b = g.getBird();
    expect(b.getX()).toBe(WIDTH / 2 - 10);
    expect(b.getY()).toBe(HEIGHT / 2 - 10);
    expect(g.isStarted()).toBe(false);
    g.update(1);
    expect(b.getY()).toBe(HEIGHT / 2 - 10);
    expect(g.isGameOver()).toBe(false);
  });

  it("na starcie są kolce na prawej ścianie i moneta", () => {
    const g = makeGame(2);
    expect(g.getSpikesRight()).toHaveLength(LEVELS[2].spikeFrequency);
    expect(g.getSpikesLeft()).toHaveLength(0);
    expect(g.getCurrentCoin()).not.toBeNull();
    expect(g.getScore()).toBe(0);
  });

  it("kolce mieszczą się między sufitem a podłogą i nie nachodzą na siebie", () => {
    const g = makeGame(4);
    const ys = g.getSpikesRight().map((s) => s.getY());
    expect(new Set(ys).size).toBe(ys.length);
    for (const s of g.getSpikesRight()) {
      expect(s.getX()).toBe(WIDTH - 16);
      expect(s.isLeftSide()).toBe(false);
      expect(s.getY()).toBeGreaterThanOrEqual(WALL_MARGIN);
      expect(s.getY() + s.getHeight()).toBeLessThanOrEqual(HEIGHT - WALL_MARGIN);
    }
  });

  it("moneta pojawia się w bezpiecznym obszarze", () => {
    for (let seed = 1; seed < 50; seed++) {
      const c = makeGame(1, new MemoryStorage(), seed).getCurrentCoin()!;
      expect(c.getX()).toBeGreaterThanOrEqual(60);
      expect(c.getX() + c.getWidth()).toBeLessThanOrEqual(WIDTH - 60);
      expect(c.getY()).toBeGreaterThanOrEqual(WALL_MARGIN);
      expect(c.getY() + c.getHeight()).toBeLessThanOrEqual(HEIGHT - WALL_MARGIN);
    }
  });
});

describe("GamePanel – sterowanie", () => {
  it("Spacja rozpoczyna grę i podbija ptaka", () => {
    const g = makeGame();
    g.handleInput("Space");
    expect(g.isStarted()).toBe(true);
    expect(g.getBird().getVelocityY()).toBeLessThan(0);
    const y0 = g.getBird().getY();
    g.update(0.016);
    expect(g.getBird().getY()).toBeLessThan(y0);
  });

  it("tylko spacja skacze", () => {
    for (const key of ["ArrowUp", "KeyW", "KeyQ", "Enter"]) {
      const g = makeGame();
      g.handleInput(key);
      expect(g.isStarted()).toBe(false);
    }
  });
});

describe("GamePanel – zasady", () => {
  it("spadnięcie na podłogę kończy grę", () => {
    const g = makeGame();
    g.handleInput("Space");
    for (let i = 0; i < 200 && !g.isGameOver(); i++) g.update(0.016);
    expect(g.isGameOver()).toBe(true);
    expect(g.getBird().getY() + 20).toBeGreaterThan(HEIGHT - WALL_MARGIN);
  });

  it("uderzenie w sufit kończy grę", () => {
    const g = makeGame();
    g.handleInput("Space");
    g.getBird().setY(WALL_MARGIN + 1);
    g.update(0.016);
    expect(g.isGameOver()).toBe(true);
  });

  it("odbicie od ściany: punkt, zmiana kierunku, kolce po opóźnieniu po drugiej stronie", () => {
    const g = makeGame(1);
    g.handleInput("Space");

    (g as unknown as { spikesRight: unknown[] }).spikesRight = [];
    const b = g.getBird();
    b.setX(WIDTH - 21);
    hover(g);
    g.update(0.016);

    expect(g.getScore()).toBe(1);
    expect(b.getVelocityX()).toBeLessThan(0);
    expect(b.getX()).toBe(WIDTH - 20);
    expect(g.isWaitingForSpikes()).toBe(true);
    expect(g.getSpikesLeft()).toHaveLength(0);

    hover(g);
    g.update(SPIKE_DELAY_TIME / 2);
    expect(g.getSpikesLeft()).toHaveLength(0);

    for (let t = 0; t < SPIKE_DELAY_TIME; t += 0.05) {
      hover(g);
      g.update(0.05);
    }
    expect(g.isWaitingForSpikes()).toBe(false);
    expect(g.getSpikesLeft()).toHaveLength(LEVELS[1].spikeFrequency);
    expect(g.getSpikesRight()).toHaveLength(0);
    expect(g.isGameOver()).toBe(false);
  });

  it("odbicie od lewej ściany też daje punkt", () => {
    const g = makeGame(1);
    g.handleInput("Space");
    const b = g.getBird();
    b.setVelocityX(-150);
    b.setX(1);
    hover(g);
    g.update(0.016);
    expect(g.getScore()).toBe(1);
    expect(b.getX()).toBe(0);
    expect(b.getVelocityX()).toBe(150);
  });

  it("dotknięcie kolca kończy grę", () => {
    const g = makeGame(1);
    g.handleInput("Space");
    const spike = g.getSpikesRight()[0];
    const b = g.getBird();
    b.setX(spike.getX() - 10);
    b.setY(spike.getY() + 8);
    (b as unknown as { velocityY: number }).velocityY = 0;
    g.update(0.016);
    expect(g.isGameOver()).toBe(true);
  });

  it("ptak omija kolec, gdy przelatuje obok", () => {
    const g = makeGame(1);
    g.handleInput("Space");
    const spike = g.getSpikesRight()[0];
    const b = g.getBird();

    b.setX(spike.getX() - 10);
    hover(g);

    const taken = new Set(g.getSpikesRight().map((s) => s.getY()));
    let slotY = WALL_MARGIN;
    while (taken.has(slotY)) slotY += 36;
    b.setY(slotY + 8);
    g.update(0.016);
    expect(g.isGameOver()).toBe(false);
  });

  it("zebranie monety zwiększa licznik i zapisuje go", () => {
    const storage = new MemoryStorage();
    const g = makeGame(1, storage);
    g.handleInput("Space");
    const coin = g.getCurrentCoin()!;
    g.getBird().setX(coin.getX() + 5);
    g.getBird().setY(coin.getY() + 5);
    g.update(0.001);
    expect(g.getCoins()).toBe(1);
    expect(g.getCurrentCoin()).toBeNull();
    expect(storage.getItem(STORAGE_KEYS.coins)).toBe("1");
  });

  it("liczba kolców rośnie z wynikiem, ale zawsze zostaje przejście", () => {
    const g = makeGame(4);
    const internal = g as unknown as { score: number };
    internal.score = 0;
    expect(g.getSpikeCount()).toBe(LEVELS[4].spikeFrequency);
    internal.score = 10;
    expect(g.getSpikeCount()).toBe(LEVELS[4].spikeFrequency + 2);
    internal.score = 1000;
    expect(g.getSpikeCount()).toBe(SPIKE_SLOTS - MIN_FREE_SLOTS);
  });

  it("po końcu gry update nic nie zmienia, a skok nie działa", () => {
    const g = makeGame();
    g.handleInput("Space");
    g.getBird().setY(HEIGHT);
    g.update(0.016);
    expect(g.isGameOver()).toBe(true);
    const pos = g.getBird().getBounds();
    g.update(0.016);
    g.jump();
    expect(g.getBird().getBounds()).toEqual(pos);
  });

  it("duży skok czasu (lag) jest przycinany", () => {
    const g = makeGame();
    g.handleInput("Space");
    const x0 = g.getBird().getX();
    g.update(5);
    expect(g.getBird().getX() - x0).toBeCloseTo(LEVELS[1].speed * 0.05);
  });
});

describe("GamePanel – rekord i restart", () => {
  it("rekord zapisuje się po końcu gry i wczytuje w nowej grze", () => {
    const storage = new MemoryStorage();
    const g = makeGame(1, storage);
    g.handleInput("Space");
    (g as unknown as { score: number }).score = 7;
    g.getBird().setY(HEIGHT);
    g.update(0.016);
    expect(g.getHighScore()).toBe(7);
    expect(storage.getItem(STORAGE_KEYS.highScore)).toBe("7");

    const g2 = makeGame(3, storage);
    expect(g2.getHighScore()).toBe(7);
  });

  it("niższy wynik nie nadpisuje rekordu", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.highScore, "10");
    const g = makeGame(1, storage);
    g.handleInput("Space");
    g.getBird().setY(HEIGHT);
    g.update(0.016);
    expect(g.getHighScore()).toBe(10);
  });

  it("uszkodzone dane w pamięci traktowane są jako 0", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.highScore, "abc");
    storage.setItem(STORAGE_KEYS.coins, "-5");
    const g = makeGame(1, storage);
    expect(g.getHighScore()).toBe(0);
    expect(g.getCoins()).toBe(0);
  });

  it("Spacja po końcu gry restartuje grę, monety zostają", () => {
    const g = makeGame();
    (g as unknown as { coins: number }).coins = 3;
    g.handleInput("Space");
    (g as unknown as { score: number }).score = 4;
    g.getBird().setY(HEIGHT);
    g.update(0.016);
    expect(g.isGameOver()).toBe(true);

    g.handleInput("Space");
    expect(g.isGameOver()).toBe(false);
    expect(g.isStarted()).toBe(false);
    expect(g.getScore()).toBe(0);
    expect(g.getCoins()).toBe(3);
    expect(g.getBird().getX()).toBe(WIDTH / 2 - 10);
  });

  it("tylko spacja restartuje", () => {
    for (const key of ["KeyR", "Enter", "ArrowUp"]) {
      const g = makeGame();
      g.handleInput("Space");
      g.getBird().setY(HEIGHT);
      g.update(0.016);
      g.handleInput(key);
      expect(g.isGameOver()).toBe(true);
    }
  });
});

describe("GamePanel – rysowanie", () => {
  it("przed startem pokazuje podpowiedź i wynik", () => {
    const f = createFakeCtx();
    makeGame().draw(f.ctx);
    expect(f.texts()).toContain("0");
    expect(f.texts()).toContain("Spacja – skok");
    expect(f.texts()).toContain("MONETY: 0");
  });

  it("po końcu gry pokazuje ekran końca", () => {
    const g = makeGame();
    g.handleInput("Space");
    g.getBird().setY(HEIGHT);
    g.update(0.016);
    const f = createFakeCtx();
    g.draw(f.ctx);
    expect(f.texts()).toContain("GAME OVER");
    expect(f.texts()).toContain("Wynik: 0");
    expect(f.texts()).toContain("Spacja – restart,  Esc – menu");
    expect(f.texts()).not.toContain("Spacja – skok");
  });
});
