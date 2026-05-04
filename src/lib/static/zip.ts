import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

export async function zipDirectory(directory: string) {
  const zip = new JSZip();
  await addDirectory(zip, directory, "");
  return zip.generateAsync({ type: "nodebuffer" });
}

async function addDirectory(zip: JSZip, directory: string, prefix: string) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const zipPath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      await addDirectory(zip, absolutePath, zipPath);
      continue;
    }

    if (entry.isFile()) {
      zip.file(zipPath, await fs.readFile(absolutePath));
    }
  }
}
