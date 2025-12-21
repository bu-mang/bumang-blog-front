import { StaticImageData } from "next/image";

export type TechStackItem = {
  label: string;
  colorClass: string;
};

export type TeamMember = {
  role: string;
  amount: number;
};

export type RelatedLink = {
  name: string;
  value: string;
};

export type RelatedLinkIconType = "google" | "apple" | "link" | "github";

export type RelatedLinkWithIcon = RelatedLink & {
  icon: RelatedLinkIconType;
};

export type TestServiceAccount = {
  title: string;
  email: string;
  password: string;
  idValue: string;
  passwordValue: string;
};

export type NavItem = {
  title: string;
  desc: string;
  href: string;
};

export type Detail = {
  title: string;
  titleDesc: string;
  id: string;
  list: {
    subtitle: string;
    desc: string[];
    list?: {
      subtitle: string;
      desc: string[];
    }[];
  }[];
  image: string | StaticImageData;
};

export type WorkDetailContent = {
  backToList: string;
  left: {
    badge: string[];
    badgeStyles?: ("normal" | "semibold" | "bold")[];
    summary: {
      title: string;
      period: { label: string; value: string };
      position: { label: string; value: string };
      techStack: { label: string; value: TechStackItem[] };
      team: { label: string; value: TeamMember[] };
      relatedLink: {
        label: string;
        value: RelatedLinkWithIcon[];
        testServiceAccount?: TestServiceAccount;
      };
    };
  };
  right: {
    title: string;
    desc: string | React.ReactNode;
    navigation: {
      title: string;
      value: NavItem[];
    };
  };
  details: Detail[];
};

export type WorkDetailConfig = {
  title: string;
  bannerImage: StaticImageData;
  content: {
    ko: WorkDetailContent;
    en: WorkDetailContent;
  };
};
