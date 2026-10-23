import { describe, expect, it } from "vitest";
import { Bird } from "../src/bird";
import { BIRD_GRAVITY, BIRD_JUMP_STRENGTH } from "../src/config";
import { createFakeCtx } from "./fakeCtx";

describe("Bird", () => {
  it("ma rozmiar 20x20 i stoi w miejscu na starcie", () => {
    const b = new Bird(100, 200);
    expect(b.getBounds()).toEqual({ x: 100, y: 200, width: 20, height: 20 });
    expect(b.getVelocityX()).toBe(0);
    expect(b.getVelocityY()).toBe(0);
  });

  it("jump ustawia prędkość pionową", () => {
    const b = new Bird(0, 0);
    b.jump();
    expect(b.getVelocityY()).toBe(BIRD_JUMP_STRENGTH);
  });

  it("update przesuwa ptaka i dodaje grawitację", () => {
    const b = new Bird(0, 100);
    b.setVelocityX(200);
    b.jump();
    b.update(0.1);
    expect(b.getX()).toBeCloseTo(20);
    expect(b.getY()).toBeCloseTo(100 + BIRD_JUMP_STRENGTH * 0.1);
    expect(b.getVelocityY()).toBeCloseTo(BIRD_JUMP_STRENGTH + BIRD_GRAVITY * 0.1);
  });

  it("spada pod wpływem grawitacji", () => {
    const b = new Bird(0, 0);
    for (let i = 0; i < 10; i++) b.update(0.01);
    expect(b.getY()).toBeGreaterThan(0);
    expect(b.getVelocityY()).toBeCloseTo(BIRD_GRAVITY * 0.1);
  });

  it("reverseVelocityX odwraca kierunek i zwrot dzioba", () => {
    const b = new Bird(0, 0);
    b.setVelocityX(150);
    expect(b.isFacingRight()).toBe(true);
    b.reverseVelocityX();
    expect(b.getVelocityX()).toBe(-150);
    expect(b.isFacingRight()).toBe(false);
  });

  it("rysuje ciało i dziób po właściwej stronie", () => {
    const b = new Bird(100, 100);
    b.setVelocityX(100);
    let f = createFakeCtx();
    b.draw(f.ctx);
    expect(f.named("fillRect")[0].args).toEqual([100, 100, 20, 20]);
    expect(f.named("lineTo")[0].args[0]).toBe(130);

    b.reverseVelocityX();
    f = createFakeCtx();
    b.draw(f.ctx);
    expect(f.named("lineTo")[0].args[0]).toBe(90);
    expect(f.named("fill")).toHaveLength(1);
  });
});
