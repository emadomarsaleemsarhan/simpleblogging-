import { getTranslator } from "@/lib/i18n/server";

import { UploadForm } from "./upload-form";

export default async function UploadPostPage() {
  const { t } = await getTranslator();

  return (
    <section>
      <h1>{t("upload.title")}</h1>
      <p>{t("upload.subtitle")}</p>
      <UploadForm />
    </section>
  );
}
