"use client";

import { RoleType } from "@/types";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
import { ButtonBase } from "./button";

interface ReadPermissionSelectorProps {
  value: RoleType;
  onChange: (permission: RoleType) => void;
  userRole: "admin" | "user" | "owner" | null;
  className?: string;
}

/**
 * @ReadPermissionSelector
 * 블로그 포스트의 공개 범위를 선택하는 컴포넌트
 *
 * 권한별 제한사항:
 * - user 역할: "user" 권한만 선택 가능 (public, admin, owner 비활성화)
 * - admin 역할: public, user, admin 선택 가능 (owner 비활성화)
 * - owner 역할: 모든 권한 선택 가능 (public, user, admin, owner)
 */
export default function ReadPermissionSelector({
  value,
  onChange,
  userRole,
  className,
}: ReadPermissionSelectorProps) {
  const t = useTranslations("blogEdit.publish");

  const handleChangeReadPermission = (role: RoleType) => {
    // user 역할인 경우 user만 선택 가능
    if (userRole === "user" && role !== "user") {
      return;
    }

    // admin 역할인 경우 owner 선택 불가
    if (userRole === "admin" && role === "owner") {
      return;
    }

    onChange(role);
  };

  return (
    <div className={className}>
      <div className="mb-1 flex items-center gap-2 font-medium">
        {t("readPermission.label")}
        {userRole === "user" && (
          <span className="text-xs text-gray-300">
            {t("readPermission.userOnly")}
          </span>
        )}
      </div>
      <div className="relative flex overflow-hidden rounded-lg border border-gray-50">
        <ButtonBase
          className={cn(
            "flex-1 py-2 transition-all active:scale-100",
            value === null && "text-white",
            userRole === "user" && "cursor-not-allowed opacity-30",
          )}
          onClick={() => handleChangeReadPermission(null)}
          disabled={userRole === "user"}
        >
          {t("readPermission.types.public")}
        </ButtonBase>

        <ButtonBase
          className={cn(
            "flex-1 py-2 transition-all active:scale-100",
            value === "user" && "text-white",
          )}
          onClick={() => handleChangeReadPermission("user")}
        >
          {t("readPermission.types.loggedInUser")}
        </ButtonBase>

        <ButtonBase
          className={cn(
            "flex-1 py-2 transition-all active:scale-100",
            value === "admin" && "text-white",
            userRole === "user" && "cursor-not-allowed opacity-30",
          )}
          onClick={() => handleChangeReadPermission("admin")}
          disabled={userRole === "user"}
        >
          {t("readPermission.types.admin")}
        </ButtonBase>

        <ButtonBase
          className={cn(
            "flex-1 py-2 transition-all active:scale-100",
            value === "owner" && "text-white",
            (userRole === "user" || userRole === "admin") &&
              "cursor-not-allowed opacity-30",
          )}
          onClick={() => handleChangeReadPermission("owner")}
          disabled={userRole === "user" || userRole === "admin"}
        >
          {t("readPermission.types.owner")}
        </ButtonBase>

        {/* BACKGROUND */}
        <div
          className={cn(
            "absolute -z-[1] flex h-full w-1/4 bg-gray-800 transition-all",
            value === null && "translate-x-0",
            value === "user" && "translate-x-full",
            value === "admin" && "translate-x-[200%]",
            value === "owner" && "translate-x-[300%]",
            "will-change-transform",
          )}
        />
      </div>
    </div>
  );
}
