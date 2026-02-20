import { test, expect } from "@playwright/test";

/**
 * Visual snapshot tests. Snapshots are generated when you run tests and are
 * stored in test/e2e/__snapshots__/ (gitignored). They reflect your app's
 * branding (VITE_APP_NAME, logo, etc.). Run with --update-snapshots after
 * intentional UI or config changes.
 */
test.describe("Visual snapshots", () => {
  test("home page snapshot", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await expect(page).toHaveScreenshot("home.png");
  });

  test("sign-in page snapshot", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/signin");
    await expect(page).toHaveScreenshot("signin.png");
  });
});
