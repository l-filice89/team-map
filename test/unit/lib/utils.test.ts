import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges single class", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple classes", () => {
    expect(cn("foo", "bar")).toContain("foo");
    expect(cn("foo", "bar")).toContain("bar");
  });

  it("handles conditional falsy", () => {
    const cond = false;
    expect(cn("base", cond && "hidden", null)).toBe("base");
  });

  it("handles tailwind conflict (later wins)", () => {
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });
});
