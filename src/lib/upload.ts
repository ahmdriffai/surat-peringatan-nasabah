import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

async function saveUploadedBytes(
  file: File,
  folder: string,
  ext: string,
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}

export async function saveUploadedImage(
  file: File,
  folder: string,
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Ukuran file maksimal 5 MB.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  return saveUploadedBytes(file, folder, ext);
}

export async function saveUploadedPdf(
  file: File,
  folder: string,
): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Format file tidak didukung. Gunakan PDF.");
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("Ukuran file maksimal 20 MB.");
  }

  return saveUploadedBytes(file, folder, "pdf");
}
