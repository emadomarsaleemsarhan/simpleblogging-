export function BlogSettingsForm({
  action,
  blog,
}: {
  action: (formData: FormData) => Promise<void>;
  blog: { name: string; slug: string; baseUrl: string };
}) {
  return (
    <form action={action} className="stack-form">
      <label>
        <span>Blog name</span>
        <input name="name" defaultValue={blog.name} required />
      </label>
      <label>
        <span>Slug</span>
        <input name="slug" defaultValue={blog.slug} required />
      </label>
      <label>
        <span>Base URL</span>
        <input name="baseUrl" type="url" defaultValue={blog.baseUrl} required />
      </label>
      <fieldset className="future-settings">
        <legend>Future publishing providers</legend>
        <label>
          <span>GitHub repository</span>
          <input value="Reserved for GitHub publishing phase" disabled readOnly />
        </label>
      </fieldset>
      <button type="submit">Save settings</button>
    </form>
  );
}
