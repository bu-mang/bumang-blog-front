import WorkDetailTemplate from "@/components/pages/work/workDetail/WorkDetailTemplate";
import { BUMANG_ROUTE53_CONFIG } from "./_script";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    languages: {
      'x-default': 'https://bumang.xyz/ko/work/bumang-route53',
      ko: 'https://bumang.xyz/ko/work/bumang-route53',
      en: 'https://bumang.xyz/en/work/bumang-route53',
    },
  },
};

export default function BumangRoute53() {
  return <WorkDetailTemplate config={BUMANG_ROUTE53_CONFIG} />;
}
