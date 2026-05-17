export function BlogSettingsForm({
  action,
  blog,
  labels,
  templates,
}: {
  action: (formData: FormData) => Promise<void>;
  blog: {
    name: string;
    slug: string;
    baseUrl: string;
    locale: string;
    templateKey: string;
    themePrimaryColor: string;
    themeSecondaryColor: string;
    themeBackgroundColor: string;
    themeHeadingStyle: string;
  };
  labels: {
    blogName: string;
    slug: string;
    baseUrl: string;
    siteLanguage: string;
    templatesSection: string;
    futureProviders: string;
    githubRepository: string;
    githubReserved: string;
    templateHelp: string;
    themePrimaryColor: string;
    themeSecondaryColor: string;
    themeBackgroundColor: string;
    headingStyle: string;
    headingClassic: string;
    headingModern: string;
    headingBold: string;
    previewSavedTemplate: string;
    save: string;
  };
  templates: { key: string; name: string; description: string }[];
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
      <section className="template-settings-block" aria-labelledby="template-settings-title">
        <div className="settings-section-heading">
          <h2 id="template-settings-title">{labels.templatesSection}</h2>
          <p>{labels.templateHelp}</p>
        </div>
        <div className="template-card-grid">
          {templates.map((template) => (
            <label className="template-card-option" key={template.key}>
              <input
                name="templateKey"
                type="radio"
                value={template.key}
                defaultChecked={blog.templateKey === template.key}
              />
              <span className={`template-preview-swatch template-preview-${template.key}`} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <strong>{template.name}</strong>
              <small>{template.description}</small>
            </label>
          ))}
        </div>
        <div className="theme-control-grid">
          <label>
            <span>{labels.themePrimaryColor}</span>
            <input name="themePrimaryColor" type="color" defaultValue={blog.themePrimaryColor} />
          </label>
          <label>
            <span>{labels.themeSecondaryColor}</span>
            <input name="themeSecondaryColor" type="color" defaultValue={blog.themeSecondaryColor} />
          </label>
          <label>
            <span>{labels.themeBackgroundColor}</span>
            <input name="themeBackgroundColor" type="color" defaultValue={blog.themeBackgroundColor} />
          </label>
          <label>
            <span>{labels.headingStyle}</span>
            <select name="themeHeadingStyle" defaultValue={blog.themeHeadingStyle}>
              <option value="classic">{labels.headingClassic}</option>
              <option value="modern">{labels.headingModern}</option>
              <option value="bold">{labels.headingBold}</option>
            </select>
          </label>
        </div>
        <a className="button-link secondary-link" href="/dashboard/export">
          {labels.previewSavedTemplate}
        </a>
      </section>
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
