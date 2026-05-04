import { expect, test } from "@playwright/test";

test("shows the blog publisher homepage", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Blog Publisher" })).toBeVisible();
});
