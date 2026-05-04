import { UploadForm } from "./upload-form";

export default function UploadPostPage() {
  return (
    <section>
      <h1>Upload Word</h1>
      <p>Convert a `.docx` file into a draft post for review.</p>
      <UploadForm />
    </section>
  );
}
