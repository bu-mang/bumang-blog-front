"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, UserMinus, UserPlus } from "lucide-react";
import { toast } from "react-toastify";

import { useAuth } from "@/contexts/AuthContext";
import {
  addUserGroupMember,
  createUserGroup,
  deleteUserGroup,
  getUserGroups,
  removeUserGroupMember,
} from "@/services/api/userGroups";
import { CreateUserGroupDto } from "@/types/userGroup";
import { ButtonBase } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export default function AdminGroupsInner() {
  const { user } = useAuth();

  if (user?.role !== "host") return <Forbidden />;

  return <OwnerView />;
}

function Forbidden() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 text-center">
      <h1 className="mb-3 text-2xl font-semibold">403</h1>
      <p className="text-gray-500">OWNER만 접근할 수 있는 페이지입니다.</p>
    </div>
  );
}

function OwnerView() {
  const queryClient = useQueryClient();
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["user-groups"],
    queryFn: getUserGroups,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["user-groups"] });

  const [form, setForm] = useState<CreateUserGroupDto>({
    name: "",
    slug: "",
    description: "",
    color: "",
  });

  const createMutation = useMutation({
    mutationFn: createUserGroup,
    onSuccess: () => {
      toast.success("그룹이 생성됐어요");
      setForm({ name: "", slug: "", description: "", color: "" });
      invalidate();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "그룹 생성 실패";
      toast.error(message);
    },
  });

  const handleCreate = () => {
    if (!form.name.trim()) return toast.error("이름을 입력해주세요");
    if (!form.slug.trim() || !SLUG_PATTERN.test(form.slug)) {
      return toast.error("slug는 소문자/숫자/하이픈만 사용해 주세요");
    }
    createMutation.mutate({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description?.trim() || undefined,
      color: form.color?.trim() || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-24">
      <h1 className="mb-6 text-3xl font-semibold">User Groups</h1>

      {/* CREATE FORM */}
      <section className="mb-10 rounded-lg border border-gray-100 p-5 dark:border-gray-800">
        <div className="mb-3 flex items-center gap-2 font-semibold">
          <Plus size={16} />
          새 그룹
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="g-name">이름</Label>
            <Input
              id="g-name"
              value={form.name}
              maxLength={30}
              placeholder="예: 친구"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="g-slug">slug</Label>
            <Input
              id="g-slug"
              value={form.slug}
              maxLength={50}
              placeholder="예: friends"
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="g-desc">설명 (선택)</Label>
            <Input
              id="g-desc"
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="g-color">색상 hex (선택)</Label>
            <Input
              id="g-color"
              value={form.color ?? ""}
              placeholder="#3b82f6"
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleCreate}
            isLoading={createMutation.isPending}
            loadingText="생성 중…"
          >
            그룹 만들기
          </Button>
        </div>
      </section>

      {/* LIST */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">기존 그룹</h2>
          {!isLoading && (
            <span className="text-sm text-gray-400">총 {groups.length}개</span>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : groups.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            아직 만든 그룹이 없어요.
          </div>
        ) : (
          groups.map((g) => (
            <GroupRow key={g.id} group={g} onChange={invalidate} />
          ))
        )}
      </section>
    </div>
  );
}

function GroupRow({
  group,
  onChange,
}: {
  group: import("@/types/userGroup").UserGroup;
  onChange: () => void;
}) {
  const [memberUserId, setMemberUserId] = useState("");

  const deleteMutation = useMutation({
    mutationFn: () => deleteUserGroup(group.id),
    onSuccess: () => {
      toast.success("그룹이 삭제됐어요");
      onChange();
    },
    onError: () => toast.error("삭제 실패"),
  });

  const addMember = useMutation({
    mutationFn: (userId: number) => addUserGroupMember(group.id, userId),
    onSuccess: () => {
      toast.success("멤버 추가됨");
      setMemberUserId("");
      onChange();
    },
    onError: () => toast.error("멤버 추가 실패"),
  });

  const removeMember = useMutation({
    mutationFn: (userId: number) => removeUserGroupMember(group.id, userId),
    onSuccess: () => {
      toast.success("멤버 제거됨");
      onChange();
    },
    onError: () => toast.error("멤버 제거 실패"),
  });

  const handleAddMember = () => {
    const parsed = Number(memberUserId);
    if (!parsed || Number.isNaN(parsed)) {
      return toast.error("userId를 숫자로 입력해주세요");
    }
    addMember.mutate(parsed);
  };

  return (
    <div className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            {group.color && (
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: group.color }}
              />
            )}
            <span>{group.name}</span>
            <span className="text-xs text-gray-400">@{group.slug}</span>
          </div>
          {group.description && (
            <div className="mt-1 text-sm text-gray-500">{group.description}</div>
          )}
        </div>
        <ButtonBase
          className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          <Trash2 size={14} />
        </ButtonBase>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">
          멤버 ({group.memberships?.length ?? 0})
        </div>
        {group.memberships && group.memberships.length > 0 && (
          <ul className="space-y-1">
            {group.memberships.map((m) => (
              <li
                key={m.userId}
                className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-sm dark:bg-gray-900"
              >
                <span>
                  {m.user?.nickname ?? `user#${m.userId}`}
                  {m.user?.email && (
                    <span className="ml-2 text-xs text-gray-400">
                      {m.user.email}
                    </span>
                  )}
                </span>
                <ButtonBase
                  className="text-xs text-gray-400 hover:text-red-500"
                  onClick={() => removeMember.mutate(m.userId)}
                  disabled={removeMember.isPending}
                >
                  <UserMinus size={14} />
                </ButtonBase>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-2">
          <Input
            placeholder="추가할 userId"
            value={memberUserId}
            onChange={(e) => setMemberUserId(e.target.value)}
            className="w-40"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddMember}
            disabled={addMember.isPending}
          >
            <UserPlus size={14} className="mr-1" />
            추가
          </Button>
        </div>
      </div>
    </div>
  );
}
