import path from "node:path";

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

export function resolvePreviewFile(siteDir: string, segments: string[] | undefined, directoryRequest = false) {
  const root = path.resolve(siteDir);
  const requested = segments?.length ? path.join(...segments) : "";
  const candidate = path.resolve(root, requested);

  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  if (!requested || directoryRequest) {
    return path.join(candidate, "index.html");
  }

  if (!path.extname(candidate)) {
    return path.join(candidate, "index.html");
  }

  return candidate;
}

export function previewContentType(filePath: string) {
  return contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

export function rewritePreviewHtmlLinks(input: {
  html: string;
  currentSegments: string[] | undefined;
  directoryRequest: boolean;
  previewRootPath: string;
}) {
  const currentFile = currentPreviewFile(input.currentSegments, input.directoryRequest);
  const currentDirectory = path.posix.dirname(currentFile);

  return input.html.replace(/\b(href|src)="([^"]+)"/g, (match, attribute: string, value: string) => {
    const rewritten = rewritePreviewUrl(value, currentDirectory, input.previewRootPath);
    return rewritten ? `${attribute}="${rewritten}"` : match;
  });
}

export function parseExportPayload(payload: string | null) {
  if (!payload) {
    return {};
  }

  try {
    return JSON.parse(payload) as { files?: number; siteDir?: string };
  } catch {
    return {};
  }
}

function currentPreviewFile(segments: string[] | undefined, directoryRequest: boolean) {
  const requested = segments?.length ? segments.join("/") : "";

  if (!requested || directoryRequest || !path.posix.extname(requested)) {
    return path.posix.join(requested, "index.html");
  }

  return requested;
}

function rewritePreviewUrl(value: string, currentDirectory: string, previewRootPath: string) {
  if (
    !value ||
    value.startsWith("#") ||
    value.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(value)
  ) {
    return null;
  }

  const normalized = path.posix.normalize(
    value.startsWith("/") ? value.replace(/^\/+/, "") || "index.html" : path.posix.join(currentDirectory, value),
  );
  if (normalized.startsWith("../")) {
    return null;
  }

  const cleanPreviewRoot = previewRootPath.endsWith("/") ? previewRootPath.slice(0, -1) : previewRootPath;
  if (normalized === "index.html") {
    return `${cleanPreviewRoot}/`;
  }
  if (normalized.endsWith("/index.html")) {
    return `${cleanPreviewRoot}/${normalized.slice(0, -"index.html".length)}`;
  }

  return `${cleanPreviewRoot}/${normalized}`;
}
