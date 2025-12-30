import WorkDetailTemplate from "@/components/pages/work/workDetail/WorkDetailTemplate";
import { PERCENT_HOTEL_CONFIG } from "./_script";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    languages: {
      'x-default': 'https://bumang.xyz/ko/work/percent-hotel',
      ko: 'https://bumang.xyz/ko/work/percent-hotel',
      en: 'https://bumang.xyz/en/work/percent-hotel',
    },
  },
};

export default function PercentHotel() {
  return <WorkDetailTemplate config={PERCENT_HOTEL_CONFIG} />;
}
