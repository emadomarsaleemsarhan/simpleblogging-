import { describe, expect, it } from "vitest";
import path from "node:path";
import JSZip from "jszip";
import { zipDirectory } from "../../src/lib/static/zip";

describe("zipDirectory", () => {
  it("adds nested files to the archive", async () => {
    const archive = await zipDirectory(path.join(process.cwd(), "tests/fixtures/static-site"));
    const zip = await JSZip.loadAsync(archive);
    expect(zip.file("index.html")).toBeTruthy();
  });
});
