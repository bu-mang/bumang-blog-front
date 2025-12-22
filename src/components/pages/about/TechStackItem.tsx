import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";

interface TechStackItemProps {
  title: string;
  description: string;
  position: "left" | "right";
  useTranslation?: boolean;
}

export default function TechStackItem({
  title,
  description,
  position,
  useTranslation = true,
}: TechStackItemProps) {
  const t = useTranslations("about");

  const positionClass =
    position === "left"
      ? "col-start-1 col-end-4 sm:col-start-2 sm:col-end-4"
      : "col-start-4 col-end-8 pl-2 sm:col-start-4 sm:col-end-6";

  return (
    <div className={cn("flex flex-col", positionClass)}>
      <span className="font-semibold">{title}</span>
      <span className="text-gray-300">
        {useTranslation ? t(description) : description}
      </span>
    </div>
  );
}
