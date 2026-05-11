import { describe, expect, it } from "vitest";
import { isCloudinaryConfigured } from "../../src/lib/cloudinary";

describe("cloudinary storage", () => {
  it("is disabled until all required environment variables are present", () => {
    const previous = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    };

    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    expect(isCloudinaryConfigured()).toBe(false);

    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    expect(isCloudinaryConfigured()).toBe(true);

    process.env.CLOUDINARY_CLOUD_NAME = previous.cloudName;
    process.env.CLOUDINARY_API_KEY = previous.apiKey;
    process.env.CLOUDINARY_API_SECRET = previous.apiSecret;
  });
});
