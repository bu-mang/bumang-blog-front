import BlogDetailInner, {
  BlogDetailInnerViewFallback,
} from "@/components/pages/blog/[id]/blogDetailInnerView";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { getBlogDetail } from "@/services/api/blog/[id].server";
import { PostDetailResponseDto } from "@/types/dto/blog/[id]";
import { isAxiosError } from "axios";
import { Metadata } from "next";
import { redirect } from "next/navigation";

interface BlogDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const postId = params.id;

  let post: PostDetailResponseDto | null = null;

  try {
    post = await getBlogDetail(postId);
  } catch (err) {
    if (isAxiosError(err)) {
      console.log("Metadata fetch error:", err.status);
    }
  }

  // 포스트 데이터가 없을 때 빈값 => 부모 메타데이터 상속
  if (!post) {
    return {};
  }

  // 태그들을 키워드로 변환
  const keywords = post.tags.map((tag) => tag.label);

  // 카테고리와 그룹 정보를 포함한 풍부한 제목
  const fullTitle = `${post.title} | ${post.category.label}`;

  // Open Graph용 이미지 (썸네일이 있으면 사용, 없으면 기본 이미지)
  const ogImage = post.thumbnailUrl || "/bumangRoute53.png";

  // 사이트 기본 URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bumang.xyz";
  const postUrl = `${siteUrl}/blog/${post.id}`;

  return {
    // 기본 메타데이터
    title: fullTitle,
    description: post.previewText,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: [{ name: post.authorNickname }],

    // Open Graph (소셜 미디어 공유 - 카카오톡, 페이스북 등)
    openGraph: {
      type: "article",
      title: post.title,
      description: post.previewText,
      url: postUrl,
      siteName: "Bumang Route53", // 실제 블로그 이름으로 변경
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.authorNickname],
      tags: keywords,
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.previewText,
      images: [ogImage],
      creator: `@${post.authorNickname}`, // 트위터 핸들이 있다면
    },

    // 기타 SEO
    robots: {
      index: post.readPermission === null, // 공개 글만 인덱싱
      follow: true,
      googleBot: {
        index: post.readPermission === null,
        follow: true,
      },
    },
    alternates: {
      canonical: postUrl,
    },

    // 추가 메타데이터
    category: post.category.label,

    // JSON-LD 구조화 데이터 (선택사항이지만 SEO에 매우 좋음)
    other: {
      "article:published_time": post.createdAt,
      "article:modified_time": post.updatedAt,
      "article:author": post.authorNickname,
      "article:section": post.category.label,
      "article:tag": keywords.join(", "),
    },
  };
}

export default async function BlogDetail({ params }: BlogDetailPageProps) {
  const postId = params.id;

  let post: PostDetailResponseDto | null = null;

  try {
    post = await getBlogDetail(postId);
  } catch (err) {
    console.log("catch");

    if (err instanceof Error) {
      console.log("err", err.message);
      if ("status" in err && (err.status === 401 || err.status === 403)) {
        redirect(PATHNAME.BLOG + "?error=unauthorized");
      }
    }
  }

  if (!post) {
    return <BlogDetailInnerViewFallback />;
  }

  // SSR로 불러온 POST DATA가 있으면 SSR, 없으면 CSR
  return <BlogDetailInner post={post} />;
}
