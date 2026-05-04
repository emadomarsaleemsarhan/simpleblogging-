import fs from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import sanitizeHtml from "sanitize-html";

import { createSlug } from "@/lib/slug";

import { countManualPageBreaks, insertPageBreakMarkers } from "./page-breaks";

const PAGE_BREAK_TOKEN = "___BLOG_PUBLISHER_PAGE_BREAK___";

type ConvertDocxInput = {
  filePath: string;
  originalFilename: string;
  assetOutputDir: string;
};

type ConversionWarning = {
  code: string;
  message: string;
};

export type ConvertedPostDraft = {
  title: string;
  slug: string;
  metaDescription: string;
  html: string;
  assets: string[];
  warnings: ConversionWarning[];
};

export async function convertDocxToPostDraft(input: ConvertDocxInput): Promise<ConvertedPostDraft> {
  if (path.extname(input.originalFilename).toLowerCase() !== ".docx") {
    throw new Error("Only .docx files are supported.");
  }

  await fs.mkdir(input.assetOutputDir, { recursive: true });

  const assets: string[] = [];
  const result = await mammoth.convertToHtml(
    { path: input.filePath },
    {
      styleMap: ["p[style-name='heading 1'] => h1:fresh", "p[style-name='Heading 1'] => h1:fresh"],
      convertImage: mammoth.images.imgElement(async (image) => {
        const extension = image.contentType.split("/").at(1) || "bin";
        const filename = `image-${assets.length + 1}.${extension}`;
        const outputPath = path.join(input.assetOutputDir, filename);
        const buffer = await image.read();
        await fs.writeFile(outputPath, buffer);
        assets.push(outputPath);

        return {
          src: filename,
        };
      }),
    },
  );

  const pageBreakCount = await countManualPageBreaks(input.filePath);
  const htmlWithPageBreaks = insertPageBreakMarkers(result.value, pageBreakCount);
  const html = sanitizeConvertedHtml(htmlWithPageBreaks);
  const warnings: ConversionWarning[] = result.messages.map((message) => ({
    code: message.type,
    message: message.message,
  }));

  const title = extractFirstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) ?? titleFromFilename(input.originalFilename);
  if (!/<h1\b[^>]*>/i.test(html)) {
    warnings.push({
      code: "missing-heading-1",
      message: "No Heading 1 found; filename was used as title.",
    });
  }

  const metaDescription = extractFirstMatch(html, /<p\b[^>]*>([\s\S]*?)<\/p>/i) ?? "";

  if (!html.trim()) {
    throw new Error("The Word document did not contain convertible content.");
  }

  return {
    title,
    slug: createSlug(title, titleFromFilename(input.originalFilename)),
    metaDescription,
    html,
    assets,
    warnings,
  };
}

function sanitizeConvertedHtml(html: string) {
  return sanitizeHtml(html.replaceAll("<!-- wp:pagebreak -->", PAGE_BREAK_TOKEN), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "h3", "h4", "h5", "h6", "img", "table", "thead", "tbody", "tr", "th", "td"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  })
    .replaceAll(PAGE_BREAK_TOKEN, "<!-- wp:pagebreak -->")
    .trim();
}

function extractFirstMatch(html: string, pattern: RegExp) {
  const value = html.match(pattern)?.[1];
  if (!value) {
    return null;
  }

  return stripTags(value).trim();
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function titleFromFilename(filename: string) {
  return path.basename(filename, path.extname(filename)).replace(/[-_]+/g, " ").trim() || "Untitled Post";
}
