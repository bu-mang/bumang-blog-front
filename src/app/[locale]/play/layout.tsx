import { cn } from "@/utils/cn";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play", // 최종 결과: "회사소개 | 사이트명"
  alternates: {
    languages: {
      'x-default': 'https://bumang.xyz/ko/play',
      ko: 'https://bumang.xyz/ko/play',
      en: 'https://bumang.xyz/en/play',
    },
  },
};

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "h-fit min-h-full w-full pt-[22vw] md:pt-[18vw] lg:pt-[14vw]",
      )}
    >
      <div className="">{children}</div>
    </section>
  );
}
