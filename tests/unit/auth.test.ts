import { beforeEach, describe, expect, it, vi } from "vitest";
import { authOptions } from "../../src/lib/auth";
import { db } from "../../src/lib/db";

vi.mock("../../src/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const mockedDb = vi.mocked(db);

describe("authOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses a credentials provider for dashboard login", () => {
    expect(authOptions.providers.some((provider) => provider.id === "credentials")).toBe(true);
  });

  it("copies the token subject into the session user id", async () => {
    mockedDb.user.findUnique.mockResolvedValue({ id: "user_123" } as never);

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

  it("clears the session user id when the token points to a deleted user", async () => {
    mockedDb.user.findUnique.mockResolvedValue(null);

    const session = await authOptions.callbacks?.session?.({
      session: {
        user: {
          email: "deleted@example.com",
          name: "Deleted",
        },
        expires: "2099-01-01T00:00:00.000Z",
      },
      token: {
        sub: "missing_user",
      },
      user: undefined,
      newSession: undefined,
      trigger: "update",
    });

    expect(session?.user.id).toBe("");
  });
});
