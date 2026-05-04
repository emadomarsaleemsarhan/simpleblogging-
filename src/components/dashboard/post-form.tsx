import type { PostStatus } from "@prisma/client";

const statuses: PostStatus[] = ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"];

export function PostForm({
  action,
  post,
}: {
  action: (formData: FormData) => Promise<void>;
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    status: PostStatus;
  };
}) {
  return (
    <form action={action} className="stack-form editor-form">
      <label>
        <span>Title</span>
        <input name="title" defaultValue={post.title} required />
      </label>
      <label>
        <span>Slug</span>
        <input name="slug" defaultValue={post.slug} required />
      </label>
      <label>
        <span>Meta description</span>
        <textarea name="excerpt" defaultValue={post.excerpt ?? ""} rows={3} />
      </label>
      <label>
        <span>Status</span>
        <select name="status" defaultValue={post.status}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>HTML content</span>
        <textarea name="content" defaultValue={post.content} rows={18} required />
      </label>
      <button type="submit">Save post</button>
    </form>
  );
}
