import { expect, test } from "@playwright/test";

test("anonymous visitors see the Publisher OS platform page", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Word to static publishing|من Word إلى موقع/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Sign in|تسجيل الدخول/i })).toBeVisible();
});
