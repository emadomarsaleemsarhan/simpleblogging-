import { expect, test } from "@playwright/test";

test("publishes a DOCX post and downloads a ZIP", async ({ page }) => {
  test.setTimeout(180000);

  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("admin12345");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard/posts");

  await expect(page.getByText("Publisher OS").first()).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Dashboard" })).toBeVisible();

  await page.getByLabel("Dashboard").getByRole("link", { name: "Upload Word" }).click();
  await page.getByLabel("Word file").setInputFiles("tests/fixtures/docx/basic.docx");
  await page.getByRole("button", { name: "Convert Word file" }).click();

  await expect(page.getByLabel("Title")).toHaveValue("Basic Test Post", { timeout: 90000 });
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
  await expect(page.getByRole("radio", { name: /^Editorial/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: /^Minimal/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: /^Magazine/ })).toBeVisible();
  await page.getByRole("radio", { name: /Magazine/ }).check();
  await page.getByLabel("Primary color").fill("#123456");
  await page.getByLabel("Accent color").fill("#abcdef");
  await page.getByLabel("Background color").fill("#fafafa");
  await page.getByLabel("Heading style").selectOption("bold");
  await page.getByLabel("Published site language").selectOption("ar");
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.waitForLoadState("networkidle");

  await page.goto("/dashboard/export");
  const exportResponse = page.waitForResponse(
    (response) => response.url().endsWith("/api/exports") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Export Website" }).click();
  const exportPayload = (await (await exportResponse).json()) as { exportId: string };
  const exportStatus = page.getByRole("status");
  await expect(exportStatus).toContainText("Export completed.");
  await expect(exportStatus.getByRole("link", { name: "Preview Website" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download ZIP" }).first()).toBeVisible();
  await page.goto(`/dashboard/export/${exportPayload.exportId}/preview`);

  const preview = page.frameLocator(".site-preview-frame");
  await expect(preview.locator("html")).toHaveAttribute("lang", "ar");
  await expect(preview.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(preview.locator("body")).toHaveAttribute("data-template", "magazine");
});
