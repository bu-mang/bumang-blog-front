import AboutInner from "@/components/pages/about/aboutInner";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    languages: {
      'x-default': 'https://bumang.xyz/ko/about',
      ko: 'https://bumang.xyz/ko/about',
      en: 'https://bumang.xyz/en/about',
    },
  },
};

interface AboutPageProps {
  params: {
    locale: string;
  };
}

export default async function AboutPage({
  params: { locale },
}: AboutPageProps) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  return <AboutInner isAuthenticated={!!accessToken} locale={locale} />;
}
