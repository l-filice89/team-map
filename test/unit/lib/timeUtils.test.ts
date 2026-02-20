import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime } from "@/lib/timeUtils";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates within the last minute', () => {
    expect(formatRelativeTime("2025-06-15T11:59:30.000Z")).toBe("just now");
  });

  it('returns "Nm ago" for dates within the last hour', () => {
    expect(formatRelativeTime("2025-06-15T11:55:00.000Z")).toBe("5m ago");
  });

  it('returns "Nh ago" for dates within the last 24 hours', () => {
    expect(formatRelativeTime("2025-06-15T10:00:00.000Z")).toBe("2h ago");
  });

  it('returns "Nd ago" for dates within the last 7 days', () => {
    expect(formatRelativeTime("2025-06-13T12:00:00.000Z")).toBe("2d ago");
  });

  it("returns formatted date for older dates", () => {
    const result = formatRelativeTime("2025-01-01T09:00:00.000Z");
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2025/);
  });
});
