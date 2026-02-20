import { describe, it, expect } from "vitest";
import { escapeHtml } from "@/lib/escapeHtml";

describe("escapeHtml", () => {
  it("escapes ampersand", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes less-than", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes greater-than", () => {
    expect(escapeHtml(">")).toBe("&gt;");
  });

  it("escapes double quote", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("escapes single quote", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("escapes multiple special chars", () => {
    expect(escapeHtml('<a href="x">')).toBe("&lt;a href=&quot;x&quot;&gt;");
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("leaves safe text unchanged", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
    expect(escapeHtml("Team Map")).toBe("Team Map");
  });

  it("prevents script injection", () => {
    const xss = '<img src=x onerror="alert(1)">';
    expect(escapeHtml(xss)).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"
    );
  });
});
