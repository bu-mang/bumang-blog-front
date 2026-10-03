import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Docker 최적화를 위한 standalone 빌드

  // 보안 헤더 (CSP는 YouTube 임베드/inline 스크립트 호환성 검증 후 별도 적용)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },

  images: {
    domains: [
      "images.unsplash.com",
      "plus.unsplash.com",
      process.env.NEXT_PUBLIC_S3_DOMAIN || "bumang-blog-s3-storage.s3.ap-northeast-2.amazonaws.com",
    ].filter(Boolean), // undefined 제거
    // S3 키에 업로드 타임스탬프가 들어가 같은 URL의 내용이 바뀌지 않으므로 1년 캐시.
    // (S3 객체에 Cache-Control이 없어 기본값 60초로 내려가던 것을 대체)
    minimumCacheTTL: 31536000,
    // 최대 폭 2048. 기본값은 3840까지라, 넓은 화면에서 4K 폭으로 요청되면 서버(sharp)가
    // 장당 약 33MB를 풀어야 했다(2048이면 약 9MB). 업로드할 때도 같은 폭으로 줄여 저장한다
    // (src/utils/compressImage/policy.ts의 MAX_WIDTH와 같은 값으로 유지할 것).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },

  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default withNextIntl(nextConfig);
