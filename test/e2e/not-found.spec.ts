import { test, expect } from "@playwright/test";

test.describe("404", () => {
  test("unknown path shows not found content", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-404");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByText("Oops! Page not found")).toBeVisible();
  });
});
