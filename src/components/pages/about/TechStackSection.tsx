import { useTranslations } from "next-intl";
import { SubBox } from "./aboutSection";
import TechStackItem from "./TechStackItem";

export interface TechStackItemData {
  title: string;
  descriptionKey?: string;
  description?: string;
}

interface TechStackSectionProps {
  categoryLabel: string;
  items: TechStackItemData[];
  className?: string;
  useTranslationForDesc?: boolean;
  useTranslationForTitle?: boolean;
}

export default function TechStackSection({
  categoryLabel,
  items,
  className,
  useTranslationForDesc = true,
  useTranslationForTitle = false,
}: TechStackSectionProps) {
  const t = useTranslations("about");

  return (
    <SubBox className={`gap-y-8 text-sm ${className || ""}`}>
      <div className="col-span-full pr-2 font-semibold sm:col-span-1 md:row-span-3">
        {categoryLabel}
      </div>

      {items.map((item, index) => {
        const position = index % 2 === 0 ? "left" : "right";
        const title = useTranslationForTitle ? t(item.title) : item.title;
        const description = item.descriptionKey || item.description || "";

        return (
          <TechStackItem
            key={`${item.title}-${index}`}
            title={title}
            description={description}
            position={position}
            useTranslation={useTranslationForDesc}
          />
        );
      })}
    </SubBox>
  );
}
