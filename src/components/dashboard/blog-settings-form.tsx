export function BlogSettingsForm({
  action,
  blog,
  labels,
  templates,
}: {
  action: (formData: FormData) => Promise<void>;
  blog: { name: string; slug: string; baseUrl: string; locale: string; templateKey: string };
  labels: {
    blogName: string;
    slug: string;
    baseUrl: string;
    siteLanguage: string;
    template: string;
    futureProviders: string;
    githubRepository: string;
    githubReserved: string;
    templateHelp: string;
    save: string;
  };
  templates: { key: string; name: string }[];
}) {
  return (
    <form action={action} className="stack-form editorial-panel">
      <label>
        <span>{labels.blogName}</span>
        <input name="name" defaultValue={blog.name} required />
      </label>
      <label>
        <span>{labels.slug}</span>
        <input name="slug" defaultValue={blog.slug} required />
      </label>
      <label>
        <span>{labels.baseUrl}</span>
        <input name="baseUrl" type="url" defaultValue={blog.baseUrl} required />
      </label>
      <label>
        <span>{labels.siteLanguage}</span>
        <select name="locale" defaultValue={blog.locale}>
          <option value="en">English</option>
          <option value="ar">{"\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}</option>
        </select>
      </label>
      <div className="template-choice-field">
        <label>
          <span>{labels.template}</span>
          <select name="templateKey" defaultValue={blog.templateKey}>
            {templates.map((template) => (
              <option key={template.key} value={template.key}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <p>{labels.templateHelp}</p>
      </div>
      <fieldset className="future-settings">
        <legend>{labels.futureProviders}</legend>
        <label>
          <span>{labels.githubRepository}</span>
          <input value={labels.githubReserved} disabled readOnly />
        </label>
      </fieldset>
      <button type="submit">{labels.save}</button>
    </form>
  );
}
