import { test, expect } from "@playwright/test";

test.describe("Auth and protected routes", () => {
  test("sign-in page loads and shows provider option", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  });

  test("unauthenticated user visiting /app is redirected to signin with from param", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/signin\?from=/);
    await expect(page).toHaveURL(/from=%2Fapp/);
  });

  test("unauthenticated user visiting /list is redirected to signin with from param", async ({ page }) => {
    await page.goto("/list");
    await expect(page).toHaveURL(/\/signin\?from=/);
    await expect(page).toHaveURL(/from=%2Flist/);
  });
});
