import { describe, it, expect } from "vitest";

describe("VantageMap project setup", () => {
  it("is correctly configured", () => {
    expect(true).toBe(true);
  });

  it("runs TypeScript without errors", () => {
    const add = (a: number, b: number): number => a + b;
    expect(add(2, 3)).toBe(5);
  });
});
