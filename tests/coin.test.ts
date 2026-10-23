import { describe, expect, it } from "vitest";
import { Coin } from "../src/coin";
import { createFakeCtx } from "./fakeCtx";

describe("Coin", () => {
  it("ma rozmiar 30x30", () => {
    expect(new Coin(5, 6).getBounds()).toEqual({ x: 5, y: 6, width: 30, height: 30 });
  });

  it("update zlicza czas", () => {
    const c = new Coin(0, 0);
    c.update(0.25);
    c.update(0.25);
    expect(c.getTotalTime()).toBeCloseTo(0.5);
  });

  it("przezroczystość pulsuje w zakresie 155..255", () => {
    const c = new Coin(0, 0);
    expect(c.getAlpha()).toBeCloseTo(205 / 255);
    c.update(0.25);
    expect(c.getAlpha()).toBeCloseTo(1);
    c.update(0.5);
    expect(c.getAlpha()).toBeCloseTo(155 / 255);
  });

  it("rysuje obrazek, gdy jest tekstura", () => {
    const img = {} as CanvasImageSource;
    const f = createFakeCtx();
    new Coin(10, 20, img).draw(f.ctx);
    expect(f.named("drawImage")[0].args).toEqual([img, 10, 20, 30, 30]);
    expect(f.named("save")).toHaveLength(1);
    expect(f.named("restore")).toHaveLength(1);
  });

  it("bez tekstury rysuje zapasowe kółko", () => {
    const f = createFakeCtx();
    new Coin(10, 20).draw(f.ctx);
    expect(f.named("drawImage")).toHaveLength(0);
    expect(f.named("arc")[0].args.slice(0, 3)).toEqual([25, 35, 15]);
  });
});
