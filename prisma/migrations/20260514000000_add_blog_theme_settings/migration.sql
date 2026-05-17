ALTER TABLE "Blog"
  ADD COLUMN "themePrimaryColor" TEXT NOT NULL DEFAULT '#0f6f5c',
  ADD COLUMN "themeSecondaryColor" TEXT NOT NULL DEFAULT '#c9842b',
  ADD COLUMN "themeBackgroundColor" TEXT NOT NULL DEFAULT '#f6f1e7',
  ADD COLUMN "themeHeadingStyle" TEXT NOT NULL DEFAULT 'classic';
