"use client";

import { GroupType } from "@/types/category";
import Group from "./group";
import Category from "./category";
import { useSearchParams } from "next/navigation";
import { LucideAlertCircle } from "lucide-react";
import { isLifeGroup } from "@/constants/taxonomy";

interface MenusProps {
  menus: GroupType[] | null;
}

const Menus = ({ menus }: MenusProps) => {
  const searchParams = useSearchParams();

  const typeParam = searchParams.get("type")
    ? searchParams.get("type")
    : undefined;
  const currentGroupSlug = searchParams.get("group") ?? undefined;
  const currentCategorySlug = searchParams.get("category") ?? undefined;

  return (
    <div className="flex w-full flex-col gap-4">
      {menus && menus.length > 0 ? (
        menus.map((group) => {
          const isLife = isLifeGroup(group.slug);

          if (typeParam === "dev" && isLife) {
            return null;
          }

          if (typeParam === "life" && !isLife) {
            return null;
          }

          return (
            <div key={group.id} className="flex w-full flex-col">
              {/* LABEL */}
              <Group
                title={group.label}
                amount={group.totalPostsCount}
                groupSlug={group.slug}
                currentGroupSlug={currentGroupSlug}
                type={isLife ? "Life" : "Dev"}
              />

              {/* CATEGORIES */}
              {group.categories.map((category) => {
                return (
                  <Category
                    key={category.id}
                    categorySlug={category.slug}
                    title={category.label}
                    currentCategorySlug={currentCategorySlug}
                    type={isLife ? "Life" : "Dev"}
                  />
                );
              })}
            </div>
          );
        })
      ) : (
        <div className="mb-20 flex items-center gap-1 px-2 text-sm text-gray-200">
          <LucideAlertCircle size={14} />
          <span>No Categories</span>
        </div>
      )}
    </div>
  );
};

export default Menus;
