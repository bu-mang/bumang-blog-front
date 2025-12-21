import { END_POINTS } from "@/constants/api/endpoints";
import serverFetch from "@/services/lib/serverFetch";
import { PostDetailResponseDto } from "@/types/dto/blog/[id]";

// 블로그 상세 조회 (ServerFetch)
export const getBlogDetail = async (id: string) => {
  const res = await serverFetch<PostDetailResponseDto>(
    process.env.NEXT_PUBLIC_API_BASE_URL + END_POINTS.GET_BLOG_DETAIL(id),
  );

  return res;
};
