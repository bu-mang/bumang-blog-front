"use client";

import Image, { StaticImageData } from "next/image";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/utils/cn";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { Link, useRouter } from "@/i18n/navigation";
import { useBackgroundStore } from "@/store/background";
import { LuMoveRight } from "react-icons/lu";

interface WorkItemProps {
  children?: React.ReactNode; // Stickers
  imgSrc?: string | StaticImageData | null;
  imgAlt: string;
  href?: string;
  className?: string;
  nullItem?: boolean;
  title?: string;

  onClick?: () => void;
}

function mapNumberRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

gsap.registerPlugin(ScrollTrigger);

const WorkItem = ({
  href,
  imgSrc,
  imgAlt,
  className,
  children,
  nullItem,
  title,

  onClick,
}: WorkItemProps) => {
  const cardRef = useRef<HTMLAnchorElement | HTMLDivElement | null>(null);
  const [coordX, setCoordX] = useState(0);
  const [coordY, setCoordY] = useState(0);

  /**
   * 카드 호버링 기울기 애니메이션
   */
  const [rotateY, setRotateY] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [degree, setDegree] = useState(0);
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    if (cardRef.current) {
      const el = cardRef.current;

      el.addEventListener("mousemove", (e) => {
        if (!(e instanceof MouseEvent)) return;
        // 카드 내부에서의 마우스 좌표 (0,0은 카드의 좌측 상단)
        const pointerX = e.clientX;
        const pointerY = e.clientY;

        const cardRect = el.getBoundingClientRect();

        // 카드의 반지름
        const halfWidth = cardRect.width / 2;
        const halfHeight = cardRect.height / 2;

        const cardCenterX = cardRect.left + halfWidth;
        const cardCenterY = cardRect.top + halfHeight;

        // 카드 중심에서 어느정도 떨어져 있는가
        const deltaX = pointerX - cardCenterX;
        const deltaY = pointerY - cardCenterY;

        // 마우스와 카드 중심 간의 거리 계산 (피타고라스 정리 사용)
        const distanceToCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const maxDistance = Math.max(halfWidth, halfHeight);

        // 중앙에서 얼마나 먼지.
        const degree = mapNumberRange(distanceToCenter, 0, maxDistance, 0, 5);

        const rx = mapNumberRange(deltaY, 0, halfWidth, 0, 1);
        const ry = mapNumberRange(deltaX, 0, halfHeight, 0, 1);

        setRotateX(rx);
        setRotateY(ry);
        setDegree(degree);
        setOpacity(mapNumberRange(distanceToCenter, 0, maxDistance, 0, 0.6));
      });

      el.addEventListener("mouseleave", () => {
        // 마우스가 떠나면 원래 위치로 복귀
        setRotateY(0);
        setRotateX(0);
        setDegree(0);
        setOpacity(0);
      });
    }
  }, []);

  /**
   * 마우스 호버 애니메이션
   */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hoverItemRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (!containerRef.current || !hoverItemRef.current) return;
    const containerEl = containerRef.current;
    const hoverEl = hoverItemRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = containerEl.getBoundingClientRect();
      const hoverRect = hoverEl.getBoundingClientRect();
      const x = e.clientX - containerRect.left - hoverRect.width / 2;
      const y = e.pageY - (containerRect.top + window.scrollY);
      setCoordX(x);
      setCoordY(y);
    };

    containerEl.addEventListener("mousemove", handleMouseMove);
    return () => {
      containerEl.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const hoverItemClass = cn(
    "flex absolute z-50 h-16 px-5 rounded-full border border-white bg-black/80 text-white pointer-events-none justify-center items-center ",
    opacity ? "opacity-100" : "opacity-0",
  );

  // 마우스 호버 시 애니메이션
  useEffect(() => {
    if (!hoverItemRef.current || !containerRef.current) return;

    const hoverEl = hoverItemRef.current;
    const container = containerRef.current;

    const handleMouseEnter = () => {
      gsap
        .timeline()
        .set(hoverEl, { color: "transparent" })
        .to(hoverEl, { duration: 1, color: "white", ease: "power2.out" })
        .restart();
    };
    const handleMouseLeave = () => {
      gsap.set(hoverEl, {
        color: "transparent",
      });
    };

    container.addEventListener("mouseenter", handleMouseEnter);

    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  /**
   * 뷰포트 진입/이탈 시 애니메이션
   */
  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      const outroTl = gsap.timeline({
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top -20%", // 카드가 뷰포트에 들어올 때
          end: "bottom 0%", // 카드가 뷰포트에서 나갈 때
          scrub: 0.5, // 부드러운 스크롤 동기화
          markers: false, // 개발용 마커
        },
      });

      const entryTl = gsap.timeline({
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 100%", // 카드가 뷰포트에 들어올 때
          end: "bottom 100%", // 카드가 들어올 때
          scrub: 0.5, // 부드러운 스크롤 동기화
          markers: false, // 개발용 마커
        },
      });

      gsap.set(cardRef.current, {
        force3D: true, // GPU 가속 강제 활성화
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      });

      // 1. 나갈 때: perspective로 모서리만 보이게
      outroTl.fromTo(
        cardRef.current,
        {
          rotationX: 0,
        },
        {
          rotationX: -30, // X축으로 기울여서 모서리만 보이게
          transformOrigin: "center bottom", // 아래쪽을 기준으로 회전
          duration: 0.4,
          ease: "power2.out",
        },
      );

      entryTl.from(cardRef.current, {
        rotationX: 50, // X축으로 기울여서 모서리만 보이게
        opacity: 0.3, // 투명도 감소
        transformOrigin: "center top", // 아래쪽을 기준으로 회전
        duration: 0.4,
        ease: "power2.out",
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const setBackgroundImage = useBackgroundStore(
    (state) => state.setBackgroundImage,
  );
  const [isIntersecting, setIsIntersecting] = useState(false);
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        rootMargin: "-20% 0px -20% 0px",
        threshold: 0.5,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (isIntersecting) {
      const imageSrc = typeof imgSrc === "string" ? imgSrc : imgSrc?.src;
      setBackgroundImage(imageSrc);
    }
    // eslint-disable-next-line
  }, [isIntersecting]);

  // 언마운트 애니메이션
  const router = useRouter();
  const handleUnmount = (
    e: React.MouseEvent,
    cb: (args?: [...any]) => void,
  ) => {
    e.preventDefault();
    setBackgroundImage(null);
    const timeout = setTimeout(() => router.push(href ?? "#"), 300);
    cb();

    return () => {
      clearTimeout(timeout);
    };
  };

  if (nullItem) {
    return (
      <div
        className={cn(
          "relative grid w-full flex-1 grid-cols-8 gap-[1.5vw] py-40",
          className,
        )}
        ref={cardRef as MutableRefObject<HTMLDivElement>}
      >
        <div className="relative col-start-2 col-end-8">
          <div className={"relative flex aspect-video"}></div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative grid w-full flex-1 grid-cols-12 gap-[1.5vw] py-32",
        className,
      )}
      ref={containerRef}
    >
      {/* HOVER EFFECT */}
      <div
        className={hoverItemClass}
        style={{ translate: `${coordX}px ${coordY}px` }}
        ref={hoverItemRef}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold">{title}</span>
          <div className="h-2 w-[1px] bg-white" />
          <span className="text-sm">To Be Updated</span>
        </div>
        <LuMoveRight className="ml-1.5" size={16} />
      </div>

      <Link
        href={href ?? "#"}
        ref={cardRef as MutableRefObject<HTMLAnchorElement>}
        onClick={onClick ? (e) => handleUnmount(e, onClick) : () => {}}
        className="relative col-start-2 col-end-12 cursor-none"
      >
        {/* CARD TILT */}
        <div
          style={{
            transform: `perspective(1500px) rotate3d(${-rotateX}, ${rotateY}, 0, ${degree}deg)`,
          }}
          className={
            "card-tilt relative -z-10 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-emerald-300"
          }
        >
          {/* GLOSS */}
          <div
            className="absolute z-10 h-full w-full rounded-full bg-[radial-gradient(circle,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0)_100%)] opacity-0"
            style={{
              transform: `translate(${-rotateY * 100}%, ${-rotateX * 100}%) scale(2.4)`,
              opacity,
            }}
          />
          <Image
            src={imgSrc ?? "401.png"}
            fill
            alt={imgAlt}
            placeholder="blur"
            sizes="100vw"
          />
        </div>
      </Link>

      {children}
    </div>
  );
};

export default WorkItem;
