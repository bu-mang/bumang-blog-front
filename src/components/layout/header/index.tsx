import HeaderInner from "./headerInner";
import { getLocale } from "next-intl/server";

async function Header() {
  /**
   * @헤더컴포넌트의_서버레이어
   */

  const locale = await getLocale();

  return <HeaderInner locale={locale} />;
}

export default Header;
