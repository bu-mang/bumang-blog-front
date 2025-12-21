import { LuLink2 } from "react-icons/lu";
import { RiAppleFill } from "react-icons/ri";
import { BsGoogle } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";
import type { RelatedLinkIconType } from "@/types/work";
import { IconType } from "react-icons";

export const RELATED_LINK_ICONS: Record<RelatedLinkIconType, IconType> = {
  google: BsGoogle,
  apple: RiAppleFill,
  link: LuLink2,
  github: FaGithub,
};

export function getRelatedLinkIcon(iconType: RelatedLinkIconType, size = 16) {
  const IconComponent = RELATED_LINK_ICONS[iconType];
  return <IconComponent size={size} />;
}
