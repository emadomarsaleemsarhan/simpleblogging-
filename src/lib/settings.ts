export function normalizeBaseUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Base URL must be HTTP or HTTPS.");
    }

    const normalized = url.toString();
    return normalized.endsWith("/") ? normalized : `${normalized}/`;
  } catch {
    throw new Error("Base URL must be a valid URL.");
  }
}
