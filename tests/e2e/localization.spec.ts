import { expect, test } from "@playwright/test";

const arabic = {
  language: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
  signIn: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
};

test("dashboard can switch between English and Arabic labels", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  await page.getByRole("button", { name: arabic.language }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("button", { name: arabic.signIn })).toBeVisible();

  await page.getByRole("button", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
