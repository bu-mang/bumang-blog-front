// 업로드 전 이미지 압축 정책. 브라우저(client.ts)와 서버(server.ts)가 같은 값을 쓴다.
//
// S3에는 올린 그대로 저장되고 본문 <img>와 OG 이미지는 그 원본을 직접 불러온다
// (/_next/image를 거치는 건 썸네일뿐). 그래서 올리기 전에 줄여야 한다.

// 긴 변 상한. 레티나 스크린샷(가로 3000px대)을 확대 모달에서 봐도 충분한 크기.
export const MAX_DIMENSION = 2560;

export const WEBP_QUALITY = 85;

// 정지 이미지만 변환한다. GIF는 애니메이션이 첫 프레임으로 뭉개지고,
// webp/avif는 이미 압축돼 있어 다시 인코딩하면 화질만 잃는다.
const COMPRESSIBLE_TYPES = ["image/png", "image/jpeg"];

export function isCompressibleType(mimeType: string): boolean {
  return COMPRESSIBLE_TYPES.includes(mimeType.toLowerCase().split(";")[0]);
}

export function toWebpFilename(filename: string): string {
  const base = filename.replace(/\.[^./]+$/, "");
  return `${base || "image"}.webp`;
}
