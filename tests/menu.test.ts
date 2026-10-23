import { describe, expect, it } from "vitest";
import { Button } from "../src/button";
import { Menu } from "../src/menu";
import { createFakeCtx } from "./fakeCtx";

describe("Button", () => {
  const btn = new Button(200, 180, 200, 50, "Test", "Arial", "red");

  it("pozycja to środek przycisku", () => {
    expect(btn.getBounds()).toEqual({ x: 100, y: 155, width: 200, height: 50 });
    expect(btn.getCenter()).toEqual({ x: 200, y: 180 });
  });

  it("isClicked w środku i poza", () => {
    expect(btn.isClicked(200, 180)).toBe(true);
    expect(btn.isClicked(101, 156)).toBe(true);
    expect(btn.isClicked(99, 180)).toBe(false);
    expect(btn.isClicked(200, 206)).toBe(false);
  });

  it("rysuje zaokrąglone tło z cieniem i wyśrodkowany napis", () => {
    const f = createFakeCtx();
    btn.draw(f.ctx);
    const rects = f.named("roundRect").map((c) => c.args.slice(0, 4));
    expect(rects).toEqual([[100, 159, 200, 50], [100, 155, 200, 50]]);
    expect(f.named("fillText")[0].args).toEqual(["Test", 200, 180]);
  });
});

function click(menu: Menu, btn: Button) {
  const c = btn.getCenter();
  return menu.handleClick(c.x, c.y);
}

describe("Menu", () => {
  const menu = new Menu();

  it("ma 4 poziomy z angielskimi nazwami", () => {
    expect(menu.getButtons().map((b) => b.label)).toEqual(["Easy", "Medium", "Hard", "Expert"]);
  });

  it("klik w poziom zwraca jego numer 1-4", () => {
    menu.getButtons().forEach((btn, i) => expect(click(menu, btn)).toBe(i + 1));
  });

  it("klik obok przycisków zwraca 0", () => {
    expect(menu.handleClick(5, 5)).toBe(0);
    const first = menu.getButtons()[0].getBounds();
    expect(menu.handleClick(200, first.y + first.height + 5)).toBe(0);
  });

  it("rysuje tytuł i poziomy na gradientowym tle (bez obrazka)", () => {
    const f = createFakeCtx();
    menu.draw(f.ctx);
    expect(f.texts()).toEqual(
      expect.arrayContaining(["SELECT LEVEL", "Easy", "Medium", "Hard", "Expert"]),
    );
    expect(f.named("createLinearGradient")).toHaveLength(1);
    expect(f.named("drawImage")).toHaveLength(0);
  });
});
