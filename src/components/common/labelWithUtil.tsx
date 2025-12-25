"use client";

import { LuLayoutGrid, LuLayoutList, LuPlus } from "react-icons/lu";
import { Link } from "@/i18n/navigation";
import { getButtonColorStyle } from "@/utils/styles/filButtonManager";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/auth";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useEditStore } from "@/store/edit";

interface LabelWithUtilProps {
  title: string;
  itemViewType: "list" | "thumbnail";
  amount?: number;
  isTag: boolean;
  isDraggable?: boolean;
  className?: string;
}

const LabelWithUtil = ({
  title = "All",
  itemViewType,
  amount,
  isTag,
  isDraggable = false,
  className,
}: LabelWithUtilProps) => {
  const { textStyle, fillStyle, flexBoxClass } = getButtonColorStyle("dark");
  const titleClass = cn(
    "col-span-3 mb-5 flex h-10 w-full items-center justify-between font-semibold",
    isDraggable && "pointer-events-none",
    className,
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { updateQuery } = useQueryParams();
  const upperCaseCapital = title.charAt(0).toUpperCase() + title.slice(1);

  // 새 글 쓰기 페이지로 이동 전에 초기화.
  const setEntryPoint = useEditStore((state) => state.setEntryPoint);
  const handleSetAllEditState = () => {
    setEntryPoint("new");
  };

  return (
    <div className={titleClass}>
      {/* PAGE Label */}
      <div className="flex items-center gap-2">
        <span className="text-xl">
          {isTag && "Tag:"} {upperCaseCapital}
        </span>
        <span className="text-sm text-gray-200">{amount}</span>
      </div>

      <div className="flex items-center gap-2">
        <Link href={updateQuery({ view: "thumbnail" })}>
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-300 hover:bg-gray-5 dark:hover:bg-gray-700",
              itemViewType !== "list" && "bg-gray-1 dark:bg-gray-700",
            )}
          >
            <LuLayoutGrid size={20} />
          </div>
        </Link>

        <Link href={updateQuery({ view: "list" })}>
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-300 hover:bg-gray-5 dark:hover:bg-gray-700",
              itemViewType === "list" && "bg-gray-1 dark:bg-gray-700",
            )}
          >
            <LuLayoutList size={20} />
          </div>
        </Link>

        {isAuthenticated && (
          <Link
            onClick={handleSetAllEditState}
            href="/blog/edit"
            className={cn(
              flexBoxClass,
              fillStyle,
              !isAuthenticated && "pointer-events-none opacity-20",
              "hidden md:flex",
            )}
          >
            <LuPlus className={textStyle} />
            <span className={textStyle}>Write</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default LabelWithUtil;
