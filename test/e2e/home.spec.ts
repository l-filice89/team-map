import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("loads and shows key content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /find your teammates on the map/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /enter the app/i })).toBeVisible();
  });

  test("has sign-in entry point", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });
});
