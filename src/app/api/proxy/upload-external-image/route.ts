import { NextRequest, NextResponse } from "next/server";
import {
  UploadExternalImageDto,
  UploadExternalImageResponseDto,
  CreatePreSignedUrlResponseDto,
} from "@/types/dto/blog/edit";
import { END_POINTS } from "@/constants/api/endpoints";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DOWNLOAD_TIMEOUT = 8000; // 8초
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// SSRF 방지: 허용된 도메인 화이트리스트
const ALLOWED_DOMAINS = [
  "images.unsplash.com",
  "plus.unsplash.com",
  "cdn.pixabay.com",
  "images.pexels.com",
];

// SSRF 방지: 블랙리스트 IP/도메인
const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.169.254", // AWS metadata
  "::1",
  "10.",
  "172.16.",
  "192.168.",
];

function validateImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // http/https만 허용
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return false;
    }

    // 블랙리스트 체크
    if (
      BLOCKED_HOSTS.some(
        (blocked) =>
          parsedUrl.hostname === blocked ||
          parsedUrl.hostname.startsWith(blocked),
      )
    ) {
      return false;
    }

    // 화이트리스트 체크
    return ALLOWED_DOMAINS.some((domain) => parsedUrl.hostname === domain);
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
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BlogImageProxy/1.0)",
      },
    });

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

    // 2. URL 검증
    if (!validateImageUrl(imageUrl)) {
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
          filename: finalFilename,
          mimetype: contentType,
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
        "Content-Type": contentType,
      },
      body: blob,
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
