import { describe, expect, it } from "vitest";
import { MemoryStorage, defaultStorage } from "../src/storage";

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
