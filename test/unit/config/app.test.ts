import { describe, it, expect } from "vitest";
import {
  getDomainRestrictionMessageFor,
  getSignInPromptFor,
} from "@/config/app";

describe("getDomainRestrictionMessageFor", () => {
  it("returns generic message for empty domains", () => {
    expect(getDomainRestrictionMessageFor([])).toBe(
      "Sign-in is restricted. Contact your administrator."
    );
  });

  it("returns single-domain message for one domain", () => {
    expect(getDomainRestrictionMessageFor(["company.com"])).toBe(
      "Only @company.com accounts are allowed."
    );
  });

  it("returns list message for multiple domains", () => {
    expect(getDomainRestrictionMessageFor(["a.com", "b.com"])).toBe(
      "Only @a.com and @b.com accounts are allowed."
    );
    expect(getDomainRestrictionMessageFor(["a.com", "b.com", "c.com"])).toBe(
      "Only @a.com, @b.com and @c.com accounts are allowed."
    );
  });
});

describe("getSignInPromptFor", () => {
  it("returns work email prompt for empty domains", () => {
    expect(getSignInPromptFor([])).toBe("Sign in with your work email.");
  });

  it("returns single-domain prompt for one domain", () => {
    expect(getSignInPromptFor(["company.com"])).toBe(
      "Sign in with your @company.com email."
    );
  });

  it("returns or-separated list for multiple domains", () => {
    expect(getSignInPromptFor(["a.com", "b.com"])).toBe(
      "Sign in with your @a.com or @b.com email."
    );
  });
});
