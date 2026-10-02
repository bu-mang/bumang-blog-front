import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import net from "node:net";
import {
  UploadExternalImageDto,
  UploadExternalImageResponseDto,
  CreatePreSignedUrlResponseDto,
} from "@/types/dto/blog/edit";
import { END_POINTS } from "@/constants/api/endpoints";
import { compressImageBlob } from "@/utils/compressImage/server";

// dns/net 사용을 위해 Node 런타임 강제(Edge 런타임 불가)
export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DOWNLOAD_TIMEOUT = 8000; // 8초
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// IPv4 문자열을 32비트 정수로 변환 (유효하지 않으면 null)
function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const o = Number(p);
    if (o < 0 || o > 255) return null;
    n = n * 256 + o;
  }
  return n >>> 0;
}

function isBlockedIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return true; // 파싱 실패 → 보수적으로 차단
  const inRange = (base: string, bits: number) => {
    const b = ipv4ToInt(base)!;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (n & mask) === (b & mask);
  };
  return (
    inRange("0.0.0.0", 8) || // 현재 네트워크
    inRange("10.0.0.0", 8) || // 사설
    inRange("100.64.0.0", 10) || // CGNAT
    inRange("127.0.0.0", 8) || // 루프백
    inRange("169.254.0.0", 16) || // 링크로컬(클라우드 메타데이터 169.254.169.254 포함)
    inRange("172.16.0.0", 12) || // 사설
    inRange("192.0.0.0", 24) ||
    inRange("192.168.0.0", 16) || // 사설
    inRange("198.18.0.0", 15) || // 벤치마크
    inRange("224.0.0.0", 4) || // 멀티캐스트
    inRange("240.0.0.0", 4) // 예약
  );
}

// 해석된 IP가 내부/예약 대역인지 검사 (SSRF 방지)
function isBlockedIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isBlockedIpv4(ip);
  if (family === 6) {
    const lower = ip.toLowerCase();
    // IPv4-mapped (::ffff:a.b.c.d) → 내부의 IPv4로 검사
    const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedIpv4(mapped[1]);
    if (lower === "::1" || lower === "::") return true; // 루프백/미지정
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7 ULA
    if (/^fe[89ab]/.test(lower)) return true; // fe80::/10 링크로컬
    return false;
  }
  return true; // 유효한 IP가 아니면 차단
}

// http/https + 호스트네임을 실제 IP로 해석해 내부망 접근을 차단
// (DNS 리바인딩의 TOCTOU는 완전 차단 불가 — redirect:"manual"과 함께 위험을 크게 낮춤)
async function validateImageUrl(url: string): Promise<boolean> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return false;
  }

  const hostname = parsedUrl.hostname.replace(/^\[|\]$/g, ""); // IPv6 대괄호 제거

  // 이미 IP 리터럴이면 바로 검사 (10진수/8진수 인코딩 우회 차단)
  if (net.isIP(hostname)) {
    return !isBlockedIp(hostname);
  }

  // 도메인은 DNS 해석 후 모든 결과 IP가 내부 대역이 아닐 때만 허용
  try {
    const results = await lookup(hostname, { all: true });
    if (results.length === 0) return false;
    return results.every((r) => !isBlockedIp(r.address));
  } catch {
    return false;
  }
}

async function downloadImageWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<{ blob: Blob; contentType: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "manual", // 내부로 튕기는 3xx 리다이렉트 우회 차단
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BlogImageProxy/1.0)",
      },
    });

    // 리다이렉트(3xx/opaqueredirect)는 거부
    if (
      response.type === "opaqueredirect" ||
      (response.status >= 300 && response.status < 400)
    ) {
      throw new Error(`Redirect not allowed: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const blob = await response.blob();

    if (blob.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    return { blob, contentType };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. 요청 바디 파싱
    const body: UploadExternalImageDto = await request.json();
    const { imageUrl, filename } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 },
      );
    }

    // 2. URL 검증 (프로토콜 + DNS 해석 후 내부망 IP 차단)
    if (!(await validateImageUrl(imageUrl))) {
      return NextResponse.json(
        { error: "Invalid or disallowed image URL" },
        { status: 400 },
      );
    }

    // 3. 인증 확인 (쿠키에서 JWT)
    const cookies = request.cookies;
    const accessToken = cookies.get("accessToken");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // 4. 외부 이미지 다운로드
    console.log("📥 Downloading external image:", imageUrl);
    const { blob, contentType } = await downloadImageWithTimeout(
      imageUrl,
      DOWNLOAD_TIMEOUT,
    );

    console.log(
      `✅ Downloaded: ${blob.size} bytes, type: ${contentType}`,
    );

    // 5. 파일명 생성
    const urlParts = imageUrl.split("/");
    const originalName = urlParts[urlParts.length - 1] || "pasted-image.jpg";
    const finalFilename =
      filename || `external-${Date.now()}-${originalName.split("?")[0]}`;

    // 5-1. 올리기 전에 압축 (변환 불가·이득 없음이면 원본 그대로)
    const upload = await compressImageBlob(blob, contentType, finalFilename);
    console.log(`🗜️ Compressed: ${blob.size} → ${upload.body.size} bytes`);

    // 6. 백엔드에서 Presigned URL 요청
    console.log("📝 Requesting presigned URL from backend");
    const presignedResponse = await fetch(
      `${API_BASE_URL}${END_POINTS.POST_IMAGE_PRESIGNED_URL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `accessToken=${accessToken.value}`,
        },
        body: JSON.stringify({
          filename: upload.filename,
          mimetype: upload.contentType,
        }),
      },
    );

    if (!presignedResponse.ok) {
      const errorText = await presignedResponse.text();
      console.error("❌ Presigned URL request failed:", errorText);
      throw new Error(
        `Backend error: ${presignedResponse.status} ${errorText}`,
      );
    }

    const presignedData: CreatePreSignedUrlResponseDto =
      await presignedResponse.json();
    const { url: uploadUrl, publicUrl, key } = presignedData;

    // 7. S3에 업로드
    console.log("☁️ Uploading to S3");
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": upload.contentType,
      },
      body: upload.body,
    });

    if (!uploadResponse.ok) {
      console.error("❌ S3 upload failed:", uploadResponse.status);
      throw new Error(`S3 upload failed: ${uploadResponse.status}`);
    }

    console.log("✅ Successfully uploaded:", publicUrl);

    // 8. Public URL 반환
    const response: UploadExternalImageResponseDto = {
      publicUrl,
      key,
      originalUrl: imageUrl,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("❌ Upload external image error:", error);

    // 타임아웃 에러
    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Image download timeout" },
        { status: 504 },
      );
    }

    // 파일 크기 에러
    if (error.message?.includes("File size exceeds")) {
      return NextResponse.json(
        { error: "Image size exceeds 10MB limit" },
        { status: 413 },
      );
    }

    // 외부 서버 에러
    if (error.message?.includes("Failed to download")) {
      return NextResponse.json(
        { error: "Failed to fetch external image" },
        { status: 502 },
      );
    }

    // Content-Type 에러
    if (error.message?.includes("Invalid content type")) {
      return NextResponse.json(
        { error: "URL does not point to an image" },
        { status: 400 },
      );
    }

    // 기타 에러
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
