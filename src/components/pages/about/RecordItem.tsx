import { useTranslations } from "next-intl";
import { SubBox } from "./aboutSection";

interface RecordItemProps {
  year: string;
  translationKey: string;
  className?: string;
}

export default function RecordItem({
  year,
  translationKey,
  className,
}: RecordItemProps) {
  const t = useTranslations("about");

  return (
    <SubBox className={className}>
      <div className="col-span-1 font-semibold">{year}</div>
      <div className="col-span-4 flex flex-col">
        <span className="font-semibold">{t(`${translationKey}.title`)}</span>
        <span className="text-gray-300">{t(`${translationKey}.desc`)}</span>
      </div>
    </SubBox>
  );
}
