import { describe, it, expect } from "vitest";
import {
  haversineDistance,
  formatDistance,
  safeDistance,
  type Coordinates,
} from "@/lib/distance";

describe("haversineDistance", () => {
  it("returns 0 for same point", () => {
    const p: Coordinates = { lat: 45.5, lng: 9.2 };
    expect(haversineDistance(p, p)).toBe(0);
  });

  it("returns positive distance for two different points", () => {
    const a: Coordinates = { lat: 0, lng: 0 };
    const b: Coordinates = { lat: 0, lng: 1 };
    const d = haversineDistance(a, b);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeCloseTo(111.19, 1); // ~111 km per degree at equator
  });

  it("is symmetric", () => {
    const a: Coordinates = { lat: 41.9, lng: 12.5 };
    const b: Coordinates = { lat: 48.9, lng: 2.35 };
    expect(haversineDistance(a, b)).toBe(haversineDistance(b, a));
  });
});

describe("formatDistance", () => {
  it("formats under 1 km with one decimal", () => {
    expect(formatDistance(0.5)).toBe("0.5 km");
  });

  it("formats 1 km and above with one decimal", () => {
    expect(formatDistance(12.3)).toBe("12.3 km");
  });
});

describe("safeDistance", () => {
  it("returns null for null or undefined", () => {
    expect(safeDistance(null, { lat: 0, lng: 0 })).toBeNull();
    expect(safeDistance({ lat: 0, lng: 0 }, undefined)).toBeNull();
  });

  it("returns null for invalid coordinates", () => {
    expect(safeDistance({ lat: 100, lng: 0 }, { lat: 0, lng: 0 })).toBeNull();
    expect(safeDistance({ lat: 0, lng: 200 }, { lat: 0, lng: 0 })).toBeNull();
  });

  it("returns distance for valid coordinates", () => {
    const a: Coordinates = { lat: 0, lng: 0 };
    const b: Coordinates = { lat: 0, lng: 1 };
    const d = safeDistance(a, b);
    expect(d).not.toBeNull();
    expect(d).toBeGreaterThan(0);
  });
});
