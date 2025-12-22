"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useRef } from "react";

import gsap from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionBox } from "@/components/pages";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
import AboutBanner from "@/assets/about_banner.jpg";
import { useHeaderStore } from "@/store/header";

import LoginPrompt from "./LoginPrompt";
import InfoRow from "./InfoRow";
import RecordItem from "./RecordItem";
import TechStackSection, {
  type TechStackItemData,
} from "./TechStackSection";

gsap.registerPlugin(ScrollTrigger);

interface AboutInnerProps {
  isAuthenticated: boolean;
  locale: string;
}

// Configuration arrays
const records = [
  { year: "2024 -", key: "record.2024", className: "border-none" },
  { year: "2023", key: "record.2023" },
  { year: "2022", key: "record.2022" },
  { year: "2021", key: "record.2021" },
  { year: "2019", key: "record.2019", className: "mb-16" },
];

const techStackSections: Array<{
  category: string;
  className?: string;
  items: TechStackItemData[];
}> = [
  {
    category: "Web Frontend",
    className: "border-none",
    items: [
      { title: "React/Next.js", descriptionKey: "techStack.webFrontEnd.1.desc" },
      {
        title: "Tailwind, StyledComponent",
        descriptionKey: "techStack.webFrontEnd.2.desc",
      },
      {
        title: "React-Hook-Form, Zod",
        descriptionKey: "techStack.webFrontEnd.3.desc",
      },
      {
        title: "Axios, TanstackQuery",
        descriptionKey: "techStack.webFrontEnd.4.desc",
      },
      {
        title: "Zustand, ReduxToolkit",
        descriptionKey: "techStack.webFrontEnd.5.desc",
      },
      {
        title: "Gsap, Three.js, Motion",
        descriptionKey: "techStack.webFrontEnd.6.desc",
      },
    ],
  },
  {
    category: "Mobile Frontend",
    items: [
      {
        title: "React Native",
        descriptionKey: "techStack.appFrontEnd.1.desc",
      },
      { title: "StyleSheet", descriptionKey: "techStack.appFrontEnd.2.desc" },
      {
        title: "React Native Codepush",
        descriptionKey: "techStack.appFrontEnd.3.desc",
      },
      {
        title: "React Native Firebase FCM",
        descriptionKey: "techStack.appFrontEnd.4.desc",
      },
      {
        title: "React Native Reanimated",
        descriptionKey: "techStack.appFrontEnd.5.desc",
      },
    ],
  },
  {
    category: "Backend",
    items: [
      { title: "techStack.backend.1.title", descriptionKey: "techStack.backend.1.desc" },
      { title: "techStack.backend.2.title", descriptionKey: "techStack.backend.2.desc" },
      { title: "techStack.backend.3.title", descriptionKey: "techStack.backend.3.desc" },
      { title: "techStack.backend.4.title", descriptionKey: "techStack.backend.4.desc" },
      { title: "techStack.backend.5.title", descriptionKey: "techStack.backend.5.desc" },
      { title: "techStack.backend.6.title", descriptionKey: "techStack.backend.6.desc" },
    ],
  },
  {
    category: "CI/CD",
    items: [
      { title: "techStack.cicd.1.title", descriptionKey: "techStack.cicd.1.desc" },
      { title: "techStack.cicd.2.title", descriptionKey: "techStack.cicd.2.desc" },
      { title: "techStack.cicd.3.title", descriptionKey: "techStack.cicd.3.desc" },
    ],
  },
  {
    category: "Design",
    items: [
      {
        title: "techStack.design.1.title",
        descriptionKey: "techStack.design.1.desc",
      },
      {
        title: "techStack.design.2.title",
        descriptionKey: "techStack.design.2.desc",
      },
      {
        title: "techStack.design.3.title",
        descriptionKey: "techStack.design.3.desc",
      },
      {
        title: "techStack.design.4.title",
        descriptionKey: "techStack.design.4.desc",
      },
      {
        title: "techStack.design.5.title",
        descriptionKey: "techStack.design.5.desc",
      },
    ],
  },
];

const basicLevelSections: Array<{
  category: string;
  className?: string;
  items: TechStackItemData[];
}> = [
  {
    category: "Dev",
    className: "border-none",
    items: [
      {
        title: "techStack.basicLevel.1.title",
        descriptionKey: "techStack.basicLevel.1.desc",
      },
      {
        title: "techStack.basicLevel.2.title",
        descriptionKey: "techStack.basicLevel.2.desc",
      },
      {
        title: "techStack.basicLevel.3.title",
        descriptionKey: "techStack.basicLevel.3.desc",
      },
    ],
  },
  {
    category: "Design",
    items: [
      {
        title: "techStack.basicLevel.4.title",
        descriptionKey: "techStack.basicLevel.4.desc",
      },
    ],
  },
];

export default function AboutInner({
  isAuthenticated,
  locale,
}: AboutInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("about");

  const setDefaultSetting = useHeaderStore((state) => state.setDefaultSetting);
  useEffect(() => {
    setDefaultSetting();
  }, [setDefaultSetting]);

  useEffect(() => {
    if (containerRef.current) {
      const fadeInElems =
        containerRef.current.querySelectorAll(".fade-in-mount");

      fadeInElems.forEach((el) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          duration: 1,
          opacity: 1,
          y: -10,
          ease: "power2.out",
        });
      });
    }
  }, []);

  return (
    <main ref={containerRef}>
      {/* IMAGES */}
      <div className="fade-in-mount relative mx-[2vw] mb-6 h-40 md:mx-[6vw] tbl:h-96">
        <Image
          src={AboutBanner}
          alt="profileImage"
          className="object-cover"
          fill
          priority
          placeholder="blur"
        />
      </div>

      {/* INTRODUCE */}
      <SectionBox className={cn("fade-in-mount px-[2vw] md:px-[6vw]")}>
        <div className="top-20 col-span-full hidden text-6xl font-semibold tbl:sticky tbl:col-span-3 tbl:mb-20 tbl:block tbl:h-32">
          Hello!
        </div>
        <div className="col-span-1 hidden translate-y-1.5 grid-cols-1 font-semibold tbl:block">
          I AM
        </div>
        <div className="col-span-full mb-6 grid grid-cols-4 tbl:col-span-4">
          <span className="col-span-4 mb-6 text-6xl font-semibold md:mb-2">
            {t("intro.title.1")}
          </span>
          <span className="col-span-4 mb-5 hidden whitespace-pre-line text-6xl font-semibold md:block">
            {t("intro.title.2")}
          </span>
          <p className="col-span-4 break-keep leading-relaxed">
            {t("intro.desc")}
          </p>
        </div>

        <div className="col-span-full tbl:col-start-4 tbl:col-end-9 tbl:-translate-y-3">
          <InfoRow
            label="Moblie"
            value={
              isAuthenticated ? "+82 10-4922-3563" : <LoginPrompt locale={locale} />
            }
          />

          <InfoRow label="Email" value="baughman0729@gmail.com" />

          <InfoRow
            label="Links"
            className="mb-16"
            value={
              <div className="col-span-4 flex gap-2 text-gray-200">
                <Link
                  href={
                    "https://angry-munchkin-077.notion.site/Portfolio-e6622320a2284acea12280d82898e842?pvs=74"
                  }
                  className="transition-all hover:bg-gray-800 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Notion
                </Link>
                <Link
                  href={"https://www.behance.net/calmness078ad4"}
                  className="transition-all hover:bg-gray-800 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Behance
                </Link>
                <Link
                  href={"https://www.chess.com/member/blmnt/stats/rapid"}
                  className="transition-all hover:bg-gray-800 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chess.com
                </Link>
              </div>
            }
          />
        </div>
      </SectionBox>

      {/* AWARDS */}
      <SectionBox className={cn("fade-in-mount px-[2vw] md:px-[6vw]")}>
        <div className="top-20 col-span-full mb-3 text-6xl font-semibold tbl:sticky tbl:col-span-3 tbl:mb-20 tbl:h-32">
          Records
        </div>

        <div className="col-span-full tbl:col-start-4 tbl:col-end-9 tbl:-translate-y-3">
          {records.map((record) => (
            <RecordItem
              key={record.year}
              year={record.year}
              translationKey={record.key}
              className={record.className}
            />
          ))}
        </div>
      </SectionBox>

      {/* MAIN TECHSTACK */}
      <SectionBox className={cn("fade-in-mount px-[2vw] md:px-[6vw]")}>
        <div className="top-20 col-span-full mb-3 flex flex-col text-6xl font-semibold tbl:sticky tbl:col-span-3 tbl:mb-20 tbl:h-32">
          <span>Main</span>
          <span>TechStack</span>
        </div>

        <div className="col-span-full tbl:col-start-4 tbl:col-end-9 tbl:-translate-y-3">
          {techStackSections.map((section, index) => (
            <TechStackSection
              key={section.category}
              categoryLabel={section.category}
              items={section.items}
              className={section.className}
              useTranslationForTitle={index >= 2} // Backend, CI/CD, Design use translation for title
            />
          ))}
        </div>
      </SectionBox>

      {/* BASIC LEVEL SKILLS */}
      <SectionBox className={cn("fade-in-mount px-[2vw] md:px-[6vw]")}>
        <div className="top-20 col-span-full mb-3 flex flex-col text-6xl font-semibold tbl:sticky tbl:col-span-3 tbl:mb-20 tbl:h-32">
          <span>Basic</span>
          <span>Level in</span>
        </div>

        <div className="col-span-full tbl:col-start-4 tbl:col-end-9 tbl:-translate-y-3">
          {basicLevelSections.map((section) => (
            <TechStackSection
              key={section.category}
              categoryLabel={section.category}
              items={section.items}
              className={section.className}
              useTranslationForTitle={true}
            />
          ))}
        </div>
      </SectionBox>
    </main>
  );
}
