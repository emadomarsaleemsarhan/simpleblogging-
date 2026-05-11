import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function uploadRawBuffer(input: { buffer: Buffer; publicId: string }) {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const dataUri = `data:application/zip;base64,${input.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    public_id: input.publicId,
    resource_type: "raw",
    overwrite: true,
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
  };
}
