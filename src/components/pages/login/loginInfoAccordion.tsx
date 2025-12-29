// components/login-info-accordion.tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export function LoginInfoAccordion() {
  const t = useTranslations("login");
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="perks">
        <AccordionTrigger>{t("tooltips.perk.title")}</AccordionTrigger>
        <AccordionContent>
          <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>{t("tooltips.perk.desc1")}</li>
            <li>{t("tooltips.perk.desc2")}</li>
            <li>{t("tooltips.perk.desc3")}</li>
          </ul>
          <div className="rounded-md bg-accent px-5 py-2 text-muted-foreground">
            {t("tooltips.perk.hint.1")}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="signup">
        <AccordionTrigger> {t("tooltips.signUp.title")}</AccordionTrigger>
        <AccordionContent>
          <p className="text-sm text-muted-foreground">
            {t("tooltips.signUp.1")}
            <br />
            {t("tooltips.signUp.2")}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
