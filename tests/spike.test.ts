import { describe, expect, it } from "vitest";
import { Spike } from "../src/spike";
import { createFakeCtx } from "./fakeCtx";

describe("Spike", () => {
  it("ma rozmiar 16x36", () => {
    const s = new Spike(0, 100, true);
    expect(s.getBounds()).toEqual({ x: 0, y: 100, width: 16, height: 36 });
    expect(s.isLeftSide()).toBe(true);
  });

  it("hitbox jest mniejszy o margines 5px", () => {
    const s = new Spike(10, 100, false);
    expect(s.getHitbox()).toEqual({ x: 15, y: 105, width: 6, height: 26 });
  });

  it("lewy kolec wskazuje w prawo, prawy w lewo", () => {
    const left = createFakeCtx();
    new Spike(0, 0, true).draw(left.ctx);
    expect(left.named("lineTo")[0].args).toEqual([16, 18]);

    const right = createFakeCtx();
    new Spike(384, 0, false).draw(right.ctx);
    expect(right.named("lineTo")[0].args).toEqual([384, 18]);
  });
});
