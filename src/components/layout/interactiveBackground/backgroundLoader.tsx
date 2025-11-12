import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

interface BackgroundLoaderProps {
  className?: string;
  backgroundColor?: string;
  zIndex?: number;
}

// 백그라운드에 펄스를 냄
const BackgroundLoader = ({
  zIndex = 50,
  backgroundColor = "bg-background",
  className,
}: BackgroundLoaderProps) => {
  return (
    <Skeleton
      className={cn(
        "fixed left-0 top-0 h-screen w-screen",
        backgroundColor,
        className,
      )}
      style={{ zIndex }}
    />
  );
};

export default BackgroundLoader;
