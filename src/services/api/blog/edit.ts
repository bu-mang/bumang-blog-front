import { END_POINTS } from "@/constants/api/endpoints";
import ClientInstance from "@/services/lib/axios";
import {
  CreatePostDto,
  CreatePreSignedUrlResponseDto,
  UploadExternalImageDto,
  UploadExternalImageResponseDto,
} from "@/types/dto/blog/edit";
import axios, { isAxiosError } from "axios";

// 본문(직렬화된 에디터 콘텐츠)이 클 수 있고, access token 만료 시 갱신 왕복까지
// 끼므로 기본 5초 timeout으로는 부족하다. 이 두 요청만 넉넉하게 늘린다.
const MUTATION_TIMEOUT_MS = 30000;

export const postCreatePost = async (dto: CreatePostDto) => {
  const res = await ClientInstance.post(END_POINTS.POST_CREATE_POST, dto, {
    timeout: MUTATION_TIMEOUT_MS,
  });

  return res.data;
};

export const patchUpdatePost = async (id: string, dto: CreatePostDto) => {
  const res = await ClientInstance.patch(
    END_POINTS.PATCH_UPDATE_POST(id),
    dto,
    { timeout: MUTATION_TIMEOUT_MS },
  );

  return res.data;
};

export const deletePost = async (id: string) => {
  const res = await ClientInstance.delete(END_POINTS.DELETE_POST(id));

  return res.data;
};

export const postCreatePreSignedUrl = async (
  filename: string,
  mimetype: string,
) => {
  const res = await ClientInstance.post<CreatePreSignedUrlResponseDto>(
    END_POINTS.POST_IMAGE_PRESIGNED_URL,
    {
      filename,
      mimetype,
    },
  );

  return res.data;
};

export const postUploadS3 = async (url: string, file: File) => {
  try {
    const res = await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    console.log("업로드 성공:", res.status);
    return res;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("업로드 실패:", error);
      if (error.response) {
        console.error("응답 상태:", error.response.status);
        console.error("응답 데이터:", error.response.data);
      }
      throw error;
    }
  }
};

export const postUploadExternalImage = async (
  imageUrl: string,
  filename?: string,
): Promise<UploadExternalImageResponseDto> => {
  const dto: UploadExternalImageDto = {
    imageUrl,
    filename,
  };

  console.log("🔄 Uploading external image via proxy:", imageUrl);

  const res = await axios.post<UploadExternalImageResponseDto>(
    "/api/proxy/upload-external-image",
    dto,
    {
      withCredentials: true,
    },
  );

  console.log("✅ External image uploaded:", res.data.publicUrl);

  return res.data;
};
