import {
  MAX_HEIGHT,
  MAX_WIDTH,
  WEBP_QUALITY,
  isCompressibleType,
  toWebpFilename,
} from "./policy";

// 브라우저에서 이미지를 리사이즈 + webp로 변환한다.
// 변환할 수 없거나 이득이 없으면 원본 File을 그대로 돌려준다 — 업로드를 막지 않는다.
export async function compressImageFile(file: File): Promise<File> {
  if (!isCompressibleType(file.type)) return file;

  try {
    // imageOrientation: EXIF 회전을 픽셀에 반영 (안 하면 세로 사진이 눕는다)
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    const scale = Math.min(
      1,
      MAX_WIDTH / bitmap.width,
      MAX_HEIGHT / bitmap.height,
    );
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY / 100),
    );

    // webp 인코딩을 못 하는 브라우저는 조용히 PNG를 돌려준다 → type으로 판별
    if (!blob || blob.type !== "image/webp") return file;
    if (blob.size >= file.size) return file;

    return new File([blob], toWebpFilename(file.name), { type: "image/webp" });
  } catch (error) {
    console.warn("이미지 압축 실패, 원본으로 업로드:", error);
    return file;
  }
}
