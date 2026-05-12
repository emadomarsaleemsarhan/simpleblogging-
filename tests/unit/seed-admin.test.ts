import { describe, expect, it } from "vitest";

import { getSeedAdminCredentials } from "../../src/lib/seed-admin";

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
    ).toThrow(/default development password/);
  });
});
