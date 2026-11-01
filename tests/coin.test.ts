import { describe, expect, it } from "vitest";
import { Coin } from "../src/coin";

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
});
