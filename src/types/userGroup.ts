export interface UserGroupMember {
  userId: number;
  nickname?: string;
  email?: string;
  addedAt: string;
}

export interface UserGroup {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  memberships?: Array<{
    userId: number;
    groupId: number;
    addedAt: string;
    user?: {
      id: number;
      nickname: string;
      email: string;
    };
  }>;
}

export interface CreateUserGroupDto {
  name: string;
  /** 비우면 백엔드가 이름에서 만든다 */
  slug?: string;
  description?: string;
  color?: string;
}

export type UpdateUserGroupDto = Partial<CreateUserGroupDto>;
