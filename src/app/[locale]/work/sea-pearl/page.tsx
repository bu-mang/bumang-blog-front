import WorkDetailTemplate from "@/components/pages/work/workDetail/WorkDetailTemplate";
import { SEA_PEARL_CONFIG } from "./_script";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    languages: {
      'x-default': 'https://bumang.xyz/ko/work/sea-pearl',
      ko: 'https://bumang.xyz/ko/work/sea-pearl',
      en: 'https://bumang.xyz/en/work/sea-pearl',
    },
  },
};

export default function SeaPearl() {
  return <WorkDetailTemplate config={SEA_PEARL_CONFIG} />;
}
