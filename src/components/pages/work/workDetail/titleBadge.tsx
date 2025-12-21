import { cn } from "@/utils/cn";

interface TitleBadgeProps {
  children: React.ReactNode;
  className: string;
}
export default function TitleBadge({ children, className }: TitleBadgeProps) {
  return (
    <div
      className={cn(
        "col-span-8 mb-10 w-fit rounded-full border-2 border-foreground px-4 py-1 text-sm sm:mb-0 sm:text-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
