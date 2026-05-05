import { expect, test } from "@playwright/test";

test("publishes a DOCX post and downloads a ZIP", async ({ page }) => {
  test.setTimeout(60000);

  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("admin12345");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.getByLabel("Dashboard").getByRole("link", { name: "Upload Word" }).click();
  await page.getByLabel("Word file").setInputFiles("tests/fixtures/docx/basic.docx");
  await page.getByRole("button", { name: "Convert Word file" }).click();

  await expect(page.getByLabel("Title")).toHaveValue("Basic Test Post", { timeout: 20000 });
  await page.getByLabel("Status").selectOption("IN_REVIEW");
  await page.getByRole("button", { name: "Save post" }).click();
  await page.waitForLoadState("networkidle");

  await expect(page.getByLabel("Status")).toHaveValue("IN_REVIEW");
  await page.getByLabel("Status").selectOption("APPROVED");
  await page.getByRole("button", { name: "Save post" }).click();
  await page.waitForLoadState("networkidle");

  await expect(page.getByLabel("Status")).toHaveValue("APPROVED");
  await page.getByLabel("Status").selectOption("PUBLISHED");
  await page.getByRole("button", { name: "Save post" }).click();
  await page.waitForLoadState("networkidle");

  await page.goto("/dashboard/settings");
  await page.getByLabel("Published site language").selectOption("ar");
  await page.getByLabel("Published site template").selectOption("editorial");
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.waitForLoadState("networkidle");

  await page.goto("/dashboard/export");
  const exportResponse = page.waitForResponse(
    (response) => response.url().endsWith("/api/exports") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Export Website" }).click();
  const exportPayload = (await (await exportResponse).json()) as { exportId: string };
  await expect(page.getByRole("link", { name: "Download ZIP" }).first()).toBeVisible();
  await page.goto(`/dashboard/export/${exportPayload.exportId}/preview`);

  const preview = page.frameLocator(".site-preview-frame");
  await expect(preview.locator("html")).toHaveAttribute("lang", "ar");
  await expect(preview.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(preview.locator("body")).toHaveAttribute("data-template", "editorial");
});
