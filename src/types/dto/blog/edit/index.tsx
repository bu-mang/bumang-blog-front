import { RoleType } from "@/types/user";

export interface CreatePostDto {
  title: string;
  content: string;
  previewText: string;
  categoryId: number;
  tagIds: number[];
  thumbnailUrl?: string;
  readPermission: RoleType | null;
}

export interface CreatePreSignedUrlResponseDto {
  key: string;
  publicUrl: string;
  url: string;
}

export interface UploadExternalImageDto {
  imageUrl: string;
  filename?: string;
}

export interface UploadExternalImageResponseDto {
  publicUrl: string;
  key: string;
  originalUrl: string;
}
