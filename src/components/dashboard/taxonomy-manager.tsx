export function TaxonomyManager({
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  categories,
  tags,
}: {
  createCategory: (formData: FormData) => Promise<void>;
  createTag: (formData: FormData) => Promise<void>;
  deleteCategory: (formData: FormData) => Promise<void>;
  deleteTag: (formData: FormData) => Promise<void>;
  categories: { id: string; name: string; slug: string; _count: { posts: number } }[];
  tags: { id: string; name: string; slug: string }[];
}) {
  return (
    <div className="taxonomy-grid">
      <section className="editorial-panel taxonomy-panel">
        <h2>Categories</h2>
        <form action={createCategory} className="inline-form">
          <input name="name" placeholder="Category name" required />
          <button type="submit">Add</button>
        </form>
        <ul className="plain-list">
          {categories.map((category) => (
            <li key={category.id}>
              <span>
                {category.name} <small>/{category.slug}</small>
              </span>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={category.id} />
                <button type="submit" disabled={category._count.posts > 0}>
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section className="editorial-panel taxonomy-panel">
        <h2>Tags</h2>
        <form action={createTag} className="inline-form">
          <input name="name" placeholder="Tag name" required />
          <button type="submit">Add</button>
        </form>
        <ul className="plain-list">
          {tags.map((tag) => (
            <li key={tag.id}>
              <span>
                {tag.name} <small>/{tag.slug}</small>
              </span>
              <form action={deleteTag}>
                <input type="hidden" name="id" value={tag.id} />
                <button type="submit">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
