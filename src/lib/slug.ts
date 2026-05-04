import slugify from "slugify";

export function createSlug(title: string, fallback = "post") {
  const slug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  if (slug) {
    return slug;
  }

  return slugify(fallback, {
    lower: true,
    strict: true,
    trim: true,
  }) || "post";
}
