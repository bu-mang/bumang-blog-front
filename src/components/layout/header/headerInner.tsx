"use client";

import NavBanner from "./navLogo";
import NavBar from "./navBar";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "@/i18n/navigation";

interface HeaderInnerProps {
  locale: string;
}

// 로그인 여부는 서버가 확정해 내려준다(AuthProvider). 여기서 프로필을 따로 조회하지 않는다.
const HeaderInner = ({ locale }: HeaderInnerProps) => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Hide header on these paths
  if (
    pathname === "/blog/edit" ||
    pathname.startsWith("/admin") ||
    /^\/play\/\d+$/.test(pathname)
  ) {
    return null;
  }

  return (
    <div className="fixed top-0 z-[100] h-fit w-full">
      <NavBanner />
      <NavBar
        isAuthenticated={isAuthenticated}
        nickname={user?.nickname}
        locale={locale}
      />
    </div>
  );
};

export default HeaderInner;
