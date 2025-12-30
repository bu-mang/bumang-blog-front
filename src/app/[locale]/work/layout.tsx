import { cn } from "@/utils/cn";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work", // 최종 결과: "회사소개 | 사이트명"
  alternates: {
    languages: {
      'x-default': 'https://bumang.xyz/ko/work',
      ko: 'https://bumang.xyz/ko/work',
      en: 'https://bumang.xyz/en/work',
    },
  },
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className={cn("pt-60", "h-fit min-h-full w-full")}>
      <div className="">{children}</div>
    </section>
  );
}
