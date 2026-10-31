"use client";

import { useQueryParams } from "@/hooks/useQueryParams";
import { cn } from "@/utils/cn";
import { Link } from "@/i18n/navigation";

interface CategoryProps {
  title: string;
  categorySlug: string;
  currentCategorySlug?: string;
  type: "Life" | "Dev";
}

const Category = ({
  title,
  type,
  currentCategorySlug,
  categorySlug,
}: CategoryProps) => {
  const { updateQuery } = useQueryParams();

  return (
    <Link
      href={updateQuery(
        { category: categorySlug },
        {
          type: type === "Life" ? "dev" : "life",
          group: null,
          pageIndex: null,
          tag: null,
        },
      )}
      prefetch={false}
      className={cn(
        "group flex items-center justify-between rounded-lg px-2 py-0.5 font-normal text-gray-700 transition-all dark:text-gray-100",
        categorySlug === currentCategorySlug && "font-bold underline",
      )}
    >
      <span className="truncate text-sm transition-all duration-200 group-hover:underline">
        {title}
      </span>
    </Link>
  );
};

export default Category;
