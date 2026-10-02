import sharp from "sharp";
import {
  MAX_DIMENSION,
  WEBP_QUALITY,
  isCompressibleType,
  toWebpFilename,
} from "./policy";

interface CompressedImage {
  body: Blob;
  contentType: string;
  filename: string;
}

// 서버(라우트 핸들러)에서 이미지를 리사이즈 + webp로 변환한다.
// 변환할 수 없거나 이득이 없으면 입력을 그대로 돌려준다.
export async function compressImageBlob(
  blob: Blob,
  contentType: string,
  filename: string,
): Promise<CompressedImage> {
  const original = { body: blob, contentType, filename };
  if (!isCompressibleType(contentType)) return original;

  try {
    const output = await sharp(Buffer.from(await blob.arrayBuffer()))
      .rotate() // EXIF 회전을 픽셀에 반영
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    if (output.length >= blob.size) return original;

    return {
      body: new Blob([output], { type: "image/webp" }),
      contentType: "image/webp",
      filename: toWebpFilename(filename),
    };
  } catch (error) {
    console.warn("이미지 압축 실패, 원본으로 업로드:", error);
    return original;
  }
}
