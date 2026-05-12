import { describe, expect, it } from "vitest";

import { getSeedAdminCredentials, shouldUpdateSeedPassword } from "../../src/lib/seed-admin";

describe("getSeedAdminCredentials", () => {
  it("keeps local development seed credentials available", () => {
    expect(getSeedAdminCredentials({ NODE_ENV: "development" })).toEqual({
      email: "admin@example.com",
      password: "admin12345",
    });
  });

  it("requires explicit production seed credentials", () => {
    expect(() => getSeedAdminCredentials({ NODE_ENV: "production" })).toThrow(/SEED_ADMIN_EMAIL/);
  });

  it("rejects the development password in production", () => {
    expect(() =>
      getSeedAdminCredentials({
        NODE_ENV: "production",
        SEED_ADMIN_EMAIL: "admin@example.com",
        SEED_ADMIN_PASSWORD: "admin12345",
      }),
    ).toThrow(/default or placeholder password/);
  });

  it("rejects placeholder production seed passwords", () => {
    expect(() =>
      getSeedAdminCredentials({
        NODE_ENV: "production",
        SEED_ADMIN_EMAIL: "admin@example.com",
        SEED_ADMIN_PASSWORD: "change-me-before-production",
      }),
    ).toThrow(/placeholder/);
  });

  it("rotates existing seed user passwords when production credentials are supplied", () => {
    expect(shouldUpdateSeedPassword({ NODE_ENV: "production" })).toBe(true);
    expect(shouldUpdateSeedPassword({ NODE_ENV: "development" })).toBe(false);
  });
});
