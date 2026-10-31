"use client";

import { Tag, TagWrapper } from "@/components/common";
import { TagType } from "@/types";
import { LucideAlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { capTagFilters } from "@/constants/taxonomy";

interface TagWrapperLayerProps {
  tags: TagType[] | null;
}

const TagWrapperLayer = ({ tags }: TagWrapperLayerProps) => {
  const params = useSearchParams();
  const activeTagSlugs = capTagFilters(params.getAll("tag"));

  return (
    <TagWrapper className="pr-8">
      {tags ? (
        tags.map((tag) => {
          return (
            <Tag
              key={tag.id}
              id={tag.id}
              slug={tag.slug}
              title={tag.title}
              type="link"
              isActivated={activeTagSlugs.includes(tag.slug)}
              hasXButton
            />
          );
        })
      ) : (
        <div className="mb-20 flex items-center gap-1 text-sm text-gray-200">
          <LucideAlertCircle size={14} />
          <span>No Tags</span>
        </div>
      )}
    </TagWrapper>
  );
};

export default TagWrapperLayer;
