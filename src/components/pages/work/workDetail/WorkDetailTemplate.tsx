"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useHeaderStore } from "@/store/header";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import {
  CalendarRange,
  Link as LinkIcon,
  LocateFixed,
  UsersRound,
  Wrench,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import Summary from "./summary";
import Title from "./title";
import TitleBadge from "./titleBadge";
import SectionLink from "./sectionLink";
import SectionView from "./sectionView";
import BackgroundWrapper from "./backgroundWrapper";
import BackToList from "./backToList";
import RelatedLinks from "./relatedLinks";

import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import type { WorkDetailConfig } from "@/types/work";

interface WorkDetailTemplateProps {
  config: WorkDetailConfig;
}

export default function WorkDetailTemplate({
  config,
}: WorkDetailTemplateProps) {
  const locale = useLocale() as "ko" | "en";
  const TARGET_LANGUAGE = config.content[locale];
  const CONTENT_LEFT = TARGET_LANGUAGE.left;
  const CONTENT_RIGHT = TARGET_LANGUAGE.right;
  const CONTENT_DETAIL = TARGET_LANGUAGE.details;

  const setBackgroundColor = useHeaderStore(
    (state) => state.setBackgroundColor,
  );

  useEffect(() => {
    setBackgroundColor("bg-background");
    window.scrollTo(0, 0);
  }, [setBackgroundColor]);

  // Render badge with custom styles if provided, otherwise default
  const renderBadge = () => {
    if (CONTENT_LEFT.badgeStyles) {
      return (
        <>
          {CONTENT_LEFT.badge.map((text, index) => {
            const style = CONTENT_LEFT.badgeStyles![index] || "normal";
            const className =
              style === "bold"
                ? "font-bold"
                : style === "semibold"
                  ? "font-semibold"
                  : "";
            return (
              <span key={index} className={className}>
                {text}
                {index < CONTENT_LEFT.badge.length - 1 && " "}
              </span>
            );
          })}
        </>
      );
    }

    // Default badge rendering (used by most pages)
    return (
      <>
        <span>{CONTENT_LEFT.badge[0]}</span>{" "}
        <span className="font-bold">{CONTENT_LEFT.badge[1]}</span>{" "}
        <span>{CONTENT_LEFT.badge[2]}</span>
      </>
    );
  };

  return (
    <main
      className={cn(
        "flex flex-1 flex-col items-center justify-center",
        "px-[2vw] md:px-[6vw]",
      )}
    >
      <section className="grid w-full grid-cols-8 gap-[1.5vw]">
        {/* Back Link */}
        <Link
          className="group relative z-10 col-span-4 flex translate-y-4 items-center gap-2 text-gray-200 transition-all hover:text-gray-500"
          href={PATHNAME.WORK}
        >
          <ArrowLeft size={14} className="group-hover:animate-arrow-back" />
          <span>{TARGET_LANGUAGE.backToList}</span>
        </Link>

        {/* Title */}
        <Title>{config.title}</Title>

        {/* Badge */}
        <div className="col-span-full flex justify-center sm:block">
          <TitleBadge className="">{renderBadge()}</TitleBadge>
        </div>

        {/* LEFT COLUMN - Summary */}
        <div className="col-span-full lg:col-span-4">
          <Summary title={CONTENT_LEFT.summary.title}>
            {/* Period */}
            <Summary.Block
              icon={<CalendarRange size={16} />}
              title={CONTENT_LEFT.summary.period.label}
            >
              <span>{CONTENT_LEFT.summary.period.value}</span>
            </Summary.Block>

            {/* Position */}
            <Summary.Block
              icon={<LocateFixed size={16} />}
              title={CONTENT_LEFT.summary.position.label}
            >
              <Badge variant="outline">
                {CONTENT_LEFT.summary.position.value}
              </Badge>
            </Summary.Block>

            {/* Tech Stack */}
            <Summary.Block
              icon={<Wrench size={16} />}
              title={CONTENT_LEFT.summary.techStack.label}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex w-full flex-wrap gap-2">
                  {CONTENT_LEFT.summary.techStack.value.map((stack) => (
                    <Badge
                      key={stack.label}
                      variant="outline"
                      className={cn("text-black", stack.colorClass)}
                    >
                      {stack.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </Summary.Block>

            {/* Team */}
            <Summary.Block
              icon={<UsersRound size={16} />}
              title={CONTENT_LEFT.summary.team.label}
            >
              <div className="flex flex-1">
                {CONTENT_LEFT.summary.team.value.map((member) => (
                  <div key={member.role} className="flex-1">
                    <div className="text-xs text-gray-400">{member.role}</div>
                    <div className="font-semibold">{member.amount}</div>
                  </div>
                ))}
              </div>
            </Summary.Block>

            {/* Related Links */}
            <Summary.Block
              icon={<LinkIcon size={16} />}
              title={CONTENT_LEFT.summary.relatedLink.label}
            >
              <RelatedLinks links={CONTENT_LEFT.summary.relatedLink.value} />

              {/* Optional Test Account Hint */}
              {CONTENT_LEFT.summary.relatedLink.testServiceAccount && (
                <Summary.Hint
                  title={
                    CONTENT_LEFT.summary.relatedLink.testServiceAccount.title
                  }
                  testAccount={{
                    idTitle:
                      CONTENT_LEFT.summary.relatedLink.testServiceAccount.email,
                    id: CONTENT_LEFT.summary.relatedLink.testServiceAccount
                      .idValue,
                    passwordTitle:
                      CONTENT_LEFT.summary.relatedLink.testServiceAccount
                        .password,
                    password:
                      CONTENT_LEFT.summary.relatedLink.testServiceAccount
                        .passwordValue,
                  }}
                  breakId
                />
              )}
            </Summary.Block>
          </Summary>
        </div>

        {/* RIGHT COLUMN - Description & Navigation */}
        <div className="col-span-full lg:col-span-4">
          <div className="mb-3 text-4xl font-medium">{CONTENT_RIGHT.title}</div>
          <div className="mb-10">{CONTENT_RIGHT.desc}</div>

          <div className="mb-3 text-2xl font-medium">
            {CONTENT_RIGHT.navigation.title}
          </div>
          <div className="flex flex-col gap-2">
            {CONTENT_RIGHT.navigation.value.map((item) => (
              <SectionLink
                key={item.title}
                href={`#${item.href}`}
                title={item.title}
                desc={item.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Background Image */}
      <BackgroundWrapper>
        <Image
          src={config.bannerImage}
          alt="work_section_background_image"
          fill
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
        />
      </BackgroundWrapper>

      {/* Detail Sections */}
      <div className="mt-20 w-full">
        {CONTENT_DETAIL.map((item, index) => (
          <SectionView
            key={item.id}
            id={item.id}
            content={item}
            order={index + 1}
            locale={locale}
          />
        ))}
      </div>

      {/* Back to List */}
      <BackToList
        href={PATHNAME.WORK}
        backToListLabel={TARGET_LANGUAGE.backToList}
      />
    </main>
  );
}
