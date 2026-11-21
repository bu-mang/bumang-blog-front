import { END_POINTS } from "@/constants/api/endpoints";
import ClientInstance from "@/services/lib/axios";

import { PostListItemType } from "@/types";
import { PostDetailResponseDto } from "@/types/dto/blog/[id]";

export const getBlogAuthenticatedDetail = async (id: string) => {
  const res = await ClientInstance.get<PostDetailResponseDto>(
    END_POINTS.GET_BLOG_DETAIL(id),
  );

  return res.data;
};

// 조회수 +1 (백엔드가 { id, view } 반환). 세션당 1회 호출은 호출부에서 가드.
export const incrementPostView = async (id: number | string) => {
  const res = await ClientInstance.post<{ id: number; view: number }>(
    END_POINTS.POST_INCREMENT_VIEW(id),
  );
  return res.data;
};

export const getRelatedPosts = async (id: number) => {
  const res = await ClientInstance.get<PostListItemType[]>(
    END_POINTS.GET_RELATED_POSTS(id),
  );

  return res.data;
};

export const getAdjacentPosts = async (id: number) => {
  const res = await ClientInstance.get<{
    previous: PostListItemType | null;
    next: PostListItemType | null;
  }>(END_POINTS.GET_ADJACENT_POSTS(id));

  return res.data;
};
