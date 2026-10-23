import { describe, expect, it } from "vitest";
import { contains, GameObject, intersects } from "../src/gameobject";

class Dummy extends GameObject {
  draw(): void {}
}

describe("GameObject", () => {
  it("przechowuje pozycję i rozmiar", () => {
    const o = new Dummy(1, 2, 3, 4);
    expect([o.getX(), o.getY(), o.getWidth(), o.getHeight()]).toEqual([1, 2, 3, 4]);
    o.setX(10);
    o.setY(20);
    expect(o.getBounds()).toEqual({ x: 10, y: 20, width: 3, height: 4 });
  });

  it("domyślne update niczego nie zmienia", () => {
    const o = new Dummy(1, 2, 3, 4);
    o.update(1);
    expect(o.getBounds()).toEqual({ x: 1, y: 2, width: 3, height: 4 });
  });
});

describe("intersects / contains", () => {
  const a = { x: 0, y: 0, width: 10, height: 10 };

  it("wykrywa nachodzące prostokąty", () => {
    expect(intersects(a, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
    expect(intersects(a, { x: 2, y: 2, width: 2, height: 2 })).toBe(true);
  });

  it("stykające się krawędziami nie kolidują", () => {
    expect(intersects(a, { x: 10, y: 0, width: 5, height: 5 })).toBe(false);
    expect(intersects(a, { x: 0, y: 10, width: 5, height: 5 })).toBe(false);
  });

  it("contains sprawdza punkt", () => {
    expect(contains(a, 0, 0)).toBe(true);
    expect(contains(a, 9.9, 9.9)).toBe(true);
    expect(contains(a, 10, 5)).toBe(false);
    expect(contains(a, -1, 5)).toBe(false);
  });
});
