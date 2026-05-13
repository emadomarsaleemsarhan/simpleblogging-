import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run prisma:seed && npm run dev",
    env: {
      ...process.env,
      SEED_ADMIN_EMAIL: "admin@example.com",
      SEED_ADMIN_PASSWORD: "admin12345",
      SEED_ADMIN_UPDATE_PASSWORD: "true",
      NEXTAUTH_URL: "http://localhost:3000"
    },
    timeout: 120000,
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
