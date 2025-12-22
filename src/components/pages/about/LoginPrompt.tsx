import { Link } from "@/i18n/navigation";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";

interface LoginPromptProps {
  locale: string;
}

export default function LoginPrompt({ locale }: LoginPromptProps) {
  if (locale === "ko") {
    return (
      <div>
        <Link
          href={PATHNAME.LOGIN}
          className="text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
        >
          로그인
        </Link>{" "}
        후 확인 가능합니다.
      </div>
    );
  }

  return (
    <div>
      Please{" "}
      <Link
        href={PATHNAME.LOGIN}
        className="text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
      >
        Login
      </Link>{" "}
      to view this content.
    </div>
  );
}
