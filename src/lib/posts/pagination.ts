export const PAGE_BREAK_MARKER = "<!-- wp:pagebreak -->";

export function paginateHtml(html: string, wordThreshold: number) {
  const manualPages = html
    .split(PAGE_BREAK_MARKER)
    .map((page) => page.trim())
    .filter(Boolean);

  if (manualPages.length > 1) {
    return manualPages;
  }

  const blocks = splitBlocks(html);
  if (countWords(html) <= wordThreshold || blocks.length <= 1) {
    return [html.trim()];
  }

  const pages: string[] = [];
  let currentBlocks: string[] = [];
  let currentWordCount = 0;

  for (const block of blocks) {
    const blockWordCount = countWords(block);
    const wouldExceedThreshold = currentWordCount > 0 && currentWordCount + blockWordCount > wordThreshold;

    if (wouldExceedThreshold) {
      pages.push(currentBlocks.join(""));
      currentBlocks = [];
      currentWordCount = 0;
    }

    currentBlocks.push(block);
    currentWordCount += blockWordCount;
  }

  if (currentBlocks.length > 0) {
    pages.push(currentBlocks.join(""));
  }

  return pages.length > 0 ? pages : [html.trim()];
}

function splitBlocks(html: string) {
  const blockPattern =
    /<(?:p|h[1-6]|ul|ol|table|blockquote|pre|figure|div|section|article)\b[\s\S]*?<\/(?:p|h[1-6]|ul|ol|table|blockquote|pre|figure|div|section|article)>/gi;
  const blocks = html.match(blockPattern);

  if (!blocks) {
    return [html.trim()].filter(Boolean);
  }

  return blocks.map((block) => block.trim()).filter(Boolean);
}

function countWords(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

  if (!text) {
    return 0;
  }

  return text.split(/\s+/).filter(Boolean).length;
}
