import { describe, expect, it } from "vitest";
import { authOptions } from "../../src/lib/auth";

describe("authOptions", () => {
  it("uses a credentials provider for dashboard login", () => {
    expect(authOptions.providers.some((provider) => provider.id === "credentials")).toBe(true);
  });

  it("copies the token subject into the session user id", async () => {
    const session = await authOptions.callbacks?.session?.({
      session: {
        user: {
          email: "admin@example.com",
          name: "Admin",
        },
        expires: "2099-01-01T00:00:00.000Z",
      },
      token: {
        sub: "user_123",
      },
      user: undefined,
      newSession: undefined,
      trigger: "update",
    });

    expect(session?.user.id).toBe("user_123");
  });
});
