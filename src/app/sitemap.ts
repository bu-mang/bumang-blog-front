import { MetadataRoute } from "next";
import { getAllPosts } from "@/services/api/blog/(list)";

// 24시간마다 갱신
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bumang.xyz";

  // 모든 블로그 포스트 가져오기 (페이지 크기를 크게 설정)
  // pageIndex는 1부터 시작한다. 0을 보내면 백엔드가 skip((0-1)*1000) = OFFSET -1000을 만들어
  // SQL 오류 → /sitemap.xml 500이 난다 (2026-11-19).
  const postsData = await getAllPosts(1, 1000);

  // 블로그 포스트 URL 생성
  const koreanPostUrls = postsData.data.map((post) => ({
    url: `${baseUrl}/ko/blog/${post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const englishPostUrls = postsData.data.map((post) => ({
    url: `${baseUrl}/en/blog/${post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 정적 페이지들
  const staticPages = [
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/ko`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },

    {
      url: `${baseUrl}/ko/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ko/work`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ko/about`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ko/play`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },

    {
      url: `${baseUrl}/en/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/work`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/about`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/play`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ];

  return [...staticPages, ...koreanPostUrls, ...englishPostUrls];
}
