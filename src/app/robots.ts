import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 쿼리가 붙은 목록(필터·보기·페이지 조합)은 긁지 않게 한다. 조합이 끝없이 늘어나는
      // 크롤러 함정이다(2026-11-20 장애). 글 상세(/ko/blog/116)는 '?'가 없어 해당하지 않고,
      // 글 목록은 sitemap.xml이 알려 준다.
      disallow: ['/ko/blog?', '/en/blog?', '/blog?'],
    },
    sitemap: 'https://bumang.xyz/sitemap.xml',
  }
}
