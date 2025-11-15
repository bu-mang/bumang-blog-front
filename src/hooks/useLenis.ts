import { usePathname } from "@/i18n/navigation";
import Lenis from "lenis";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/all";

const useLenis = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/blog/edit") {
      return; // ✅ /blog/edit에서는 아무것도 안 함
    }

    let rafId: number;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
      touchMultiplier: 2,
    });

    lenis.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId); // ✅ RAF 취소
      lenis.destroy();
    };

    // eslint-disable-next-line
  }, [pathname === "/blog/edit"]); // ✅ 의존성은 그대로 유지
};

// 그냥 Lenis는 놔두고 overflow만 남기기.
const usePauseScroll = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
};

export { usePauseScroll, useLenis };
