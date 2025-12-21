import { Link } from "@/i18n/navigation";
import type { RelatedLinkWithIcon } from "@/types/work";
import { getRelatedLinkIcon } from "./relatedLinkIcons";

interface RelatedLinksProps {
  links: RelatedLinkWithIcon[];
}

export default function RelatedLinks({ links }: RelatedLinksProps) {
  return (
    <div className="flex flex-1">
      {links.map((link) => (
        <Link
          key={link.name}
          target="_blank"
          href={link.value}
          className="flex-1 transition-all hover:scale-[102%] hover:opacity-80"
        >
          <div className="text-xs text-gray-400">{link.name}</div>
          <div className="mt-1 flex h-4 items-center font-semibold">
            {getRelatedLinkIcon(link.icon)}
          </div>
        </Link>
      ))}
      {/* Spacer for alignment when less than 4 links */}
      {links.length < 4 && <div className="flex-1" />}
    </div>
  );
}
