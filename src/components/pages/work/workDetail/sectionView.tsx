import { Detail } from "@/types/work";
import { cn } from "@/utils/cn";
import { CornerDownRight } from "lucide-react";
import Image from "next/image";

interface SectionViewProps {
  id: string;
  content: Detail;
  order: number;
  locale: "ko" | "en";
}

export default function SectionView({
  id,
  content,
  order,
  locale,
}: SectionViewProps) {
  return (
    <section
      id={id}
      className="mb-40 grid min-h-40 w-full grid-cols-2 gap-[1.5vw] lg:mb-80"
    >
      <div
        className={cn(
          "col-span-full lg:col-span-1",
          order % 2 === 1 && "order-2 lg:order-1",
          order % 2 === 0 && "order-2 lg:order-2",
        )}
      >
        {/* MAIN-TITLE */}
        <div
          className={cn(
            "mb-5 flex flex-col items-baseline gap-2",
            locale === "en" && "flex-col",
          )}
        >
          <h2 className="text-2xl font-semibold lg:text-4xl">
            {content.title}
          </h2>
          <h4 className="flex items-center gap-1 text-sm text-gray-400">
            {content.titleDesc}
          </h4>
        </div>

        <ul className="mt-3 flex flex-col gap-5 lg:ml-6">
          {content.list.map((item) => {
            return (
              <li key={item.subtitle}>
                <div className="mb-3 font-semibold">{item.subtitle}</div>

                <ul className="ml-2 flex flex-col gap-3 text-gray-500 lg:ml-6">
                  {item.desc.map((desc) => (
                    <li
                      key={desc}
                      className="flex gap-1 text-sm text-gray-400 lg:text-base"
                    >
                      <CornerDownRight
                        size={16}
                        className="hidden shrink-0 translate-y-0.5 lg:block"
                      />
                      {desc}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className={cn(
          "relative order-1 col-span-full aspect-auto h-56 overflow-hidden rounded-2xl bg-gray-5 shadow-md sm:h-64 lg:order-2 lg:col-span-1 lg:h-fit lg:min-h-96",
          order % 2 === 1 && "order-1 lg:order-2",
          order % 2 === 0 && "order-1 lg:order-1",
        )}
      >
        {content.image && (
          <Image
            src={content.image}
            fill
            alt={`${content.title}_image`}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
            placeholder="blur"
            blurDataURL={content.image.toString()}
          />
        )}
      </div>
    </section>
  );
}
