"use client";

import { useQueryParams } from "@/hooks/useQueryParams";
import { cn } from "@/utils/cn";
import { Link } from "@/i18n/navigation";
import { HTMLAttributes } from "react";

interface GroupProps {
  title: string;
  amount: number;
  groupSlug: string;
  currentGroupSlug?: string;
  type: "Life" | "Dev";
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  value: string | number;
}

const Badge = ({ value }: BadgeProps) => {
  return (
    <span className="rounded-md bg-gray-1 px-1 text-[10px] font-semibold text-gray-100 dark:bg-gray-700">
      {value}
    </span>
  );
};

const Group = ({
  title,
  amount,
  groupSlug,
  currentGroupSlug,
  type,
}: GroupProps) => {
  const { updateQuery } = useQueryParams();

  return (
    <Link
      href={updateQuery(
        { group: groupSlug },
        {
          type: type === "Life" ? "dev" : "life",
          category: null,
          pageIndex: null,
          tag: null,
        },
      )}
      prefetch={false}
      className={
        "flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-medium"
      }
    >
      <span
        className={cn(
          "truncate text-gray-200 transition-all duration-200 hover:underline dark:text-gray-50",
          groupSlug === currentGroupSlug && "font-bold underline",
        )}
      >
        {title}
      </span>
      <Badge value={amount} />
    </Link>
  );
};

export default Group;
