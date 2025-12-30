import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    languages: {
      'x-default': 'https://bumang.xyz/ko',
      ko: 'https://bumang.xyz/ko',
      en: 'https://bumang.xyz/en',
    },
  },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
