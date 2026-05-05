import path from "node:path";

export function rootRelative(pathname: string) {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function portableHref(fromPublicPath: string, toPublicPath: string) {
  const fromFile = outputFilePath(fromPublicPath);
  const toFile = outputFilePath(toPublicPath);
  const relative = path.posix.relative(path.posix.dirname(fromFile), toFile);
  return relative || path.posix.basename(toFile);
}

function outputFilePath(publicPath: string) {
  const trimmed = publicPath.replace(/^\/+/, "");
  if (!trimmed) {
    return "index.html";
  }

  return trimmed.endsWith("/") ? `${trimmed}index.html` : trimmed;
}
