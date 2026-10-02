"use client";

import Link from "next/link";
import { ScrollText, Users, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

type AdminSection = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

// 새 어드민 페이지를 추가하면 여기에 한 줄만 더하면 홈에 자동 노출된다.
const SECTIONS: AdminSection[] = [
  {
    href: "/admin/groups",
    title: "유저 그룹",
    description: "공개 대상 그룹을 만들고 멤버를 관리합니다.",
    icon: Users,
  },
  {
    href: "/admin/audit-logs",
    title: "감사 로그",
    description: "로그인 시도·콘텐츠 조회 기록을 확인합니다.",
    icon: ScrollText,
  },
];

export default function AdminHomeInner() {
  const { user } = useAuth();

  if (user?.role !== "host") return <Forbidden />;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-24">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">관리자</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          호스트 전용 관리 페이지입니다.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ href, title, description, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/30 hover:bg-muted"
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground group-hover:bg-background">
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-medium">
                  {title}
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Forbidden() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 text-center">
      <h1 className="mb-3 text-2xl font-semibold">403</h1>
      <p className="text-gray-500">OWNER만 접근할 수 있는 페이지입니다.</p>
    </div>
  );
}
