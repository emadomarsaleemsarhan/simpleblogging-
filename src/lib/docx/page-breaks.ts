import fs from "node:fs/promises";
import JSZip from "jszip";

import { PAGE_BREAK_MARKER } from "@/lib/posts/pagination";

export async function countManualPageBreaks(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file("word/document.xml")?.async("string");

  if (!documentXml) {
    return 0;
  }

  return (documentXml.match(/<w:br\b[^>]*w:type=["']page["'][^>]*\/>/g) ?? []).length;
}

export function insertPageBreakMarkers(html: string, pageBreakCount: number) {
  if (pageBreakCount <= 0) {
    return html;
  }

  const paragraphs = html.match(/<p\b[\s\S]*?<\/p>/gi);
  if (!paragraphs || paragraphs.length < 2) {
    return `${html}${PAGE_BREAK_MARKER.repeat(pageBreakCount)}`;
  }

  let remainingBreaks = pageBreakCount;
  return html.replace(/<p\b[\s\S]*?<\/p>/i, (firstParagraph) => {
    if (remainingBreaks <= 0) {
      return firstParagraph;
    }

    remainingBreaks -= 1;
    return `${firstParagraph}${PAGE_BREAK_MARKER}`;
  });
}
