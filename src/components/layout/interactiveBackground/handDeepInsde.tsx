"use client";

import Image from "next/image";
import {
  Character,
  Hand,
  RoarHair,
  Wrist,
  HandInner,
  WristInner,
  CharacterInner1,
  CharacterInner2,
  CharacterInner3,
  cloud,
  // cloudRed,
} from "@/assets/play";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { randomBetween } from "@/utils/createRandomBetween";
import { cn } from "@/utils/cn";
import CustomCursor from "../customCursor";

// 파티클 설정 타입
interface ParticleConfig {
  count: number;
  size: [number, number]; // [min, max]
  opacity: [number, number]; // [min, max]
  blur: number;
  mouseInfluence: number;
  color: string;
  zIndex: number;
}

// 파티클 객체 타입
interface Particle {
  element: HTMLDivElement;
  baseX: number;
  baseY: number;
  mouseInfluence: number;
}

// 파티클 설정
const PARTICLE_CONFIG: Record<"BACKGROUND" | "FOREGROUND", ParticleConfig> = {
  BACKGROUND: {
    count: 40,
    size: [1, 3],
    opacity: [0.3, 0.5],
    blur: 1.5,
    mouseInfluence: 0.02,
    color: "rgba(214, 225, 64, 1)",
    zIndex: 5,
  },
  FOREGROUND: {
    count: 25,
    size: [3, 6],
    opacity: [0.6, 0.9],
    blur: 0.5,
    mouseInfluence: 0.08,
    color: "rgba(214, 225, 64, 1)",
    zIndex: 10,
  },
};

// 패럴랙스 설정 타입
interface ParallaxConfig {
  mouseInfluence: number;
  smoothness: number; // 애니메이션 부드러움 정도
}

// 레이어별 패럴랙스 설정
const PARALLAX_CONFIG = {
  // 뒤에서 앞으로 갈수록 영향도 증가
  BACKGROUND_PARTICLES: {
    mouseInfluence: 0.015, // 가장 적게 움직임
    smoothness: 2.0,
  },
  HAND_WRIST_CHARACTER: {
    mouseInfluence: 0.035, // 중간 정도 움직임
    smoothness: 1.5,
  },
  FOREGROUND_PARTICLES: {
    mouseInfluence: 0.08, // 가장 많이 움직임
    smoothness: 1.0,
  },
} as const;

export default function HandDeepInside() {
  // DOM ref
  const idleRef = useRef<HTMLDivElement | null>(null);

  // 파티클 정보 ref
  const totalParticlesRef = useRef<HTMLDivElement | null>(null);
  const backgroundParticlesRef = useRef<Particle[]>([]);
  const foregroundParticlesRef = useRef<Particle[]>([]);

  // ------ 파티클 생성 함수 ------

  const createParticles = (
    config: ParticleConfig,
    particlesArray: React.MutableRefObject<Particle[]>,
  ) => {
    const particles: Particle[] = [];

    for (let i = 0; i < config.count; i++) {
      const particle = document.createElement("div");
      particle.className = "DUST-PARTICLE";

      // 랜덤 속성
      const size = randomBetween(config.size[0], config.size[1]);
      const opacity = randomBetween(config.opacity[0], config.opacity[1]);
      const x = randomBetween(0, window.innerWidth);
      const y = randomBetween(0, window.innerHeight);

      // 스타일 적용
      gsap.set(particle, {
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: config.color,
        opacity: opacity,
        filter: `blur(${config.blur}px)`,
        left: x,
        top: y,
        zIndex: config.zIndex,
        pointerEvents: "none",
        willChange: "transform",
      });

      // 기본 플로팅 애니메이션
      gsap.to(particle, {
        x: `+=${randomBetween(-50, 50)}`,
        y: `+=${randomBetween(-30, 30)}`,
        duration: randomBetween(4, 8),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: randomBetween(0, 2),
      });

      totalParticlesRef.current?.appendChild(particle);
      particles.push({
        element: particle,
        baseX: x,
        baseY: y,
        mouseInfluence: config.mouseInfluence,
      });
    }

    particlesArray.current = particles;
  };

  useEffect(() => {
    // 파티클 생성
    createParticles(PARTICLE_CONFIG.BACKGROUND, backgroundParticlesRef);
    createParticles(PARTICLE_CONFIG.FOREGROUND, foregroundParticlesRef);

    // 현재 ref 값들을 지역 변수로 복사 (변수명만 공유)
    const currentBackgroundParticles = backgroundParticlesRef.current;
    const currentForegroundParticles = foregroundParticlesRef.current;

    return () => {
      // 파티클 정리
      // 복사된 지역 변수 사용
      [...currentBackgroundParticles, ...currentForegroundParticles].forEach(
        (particle) => {
          particle.element.remove();
        },
      );
    };
  }, []);

  // --------- 마우스 로직 ---------

  // 마우스 위치 상태
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
    leftClicked: false,
  });
  const xrayLayerRef = useRef<HTMLDivElement>(null);

  // 마우스 이벤트 핸들러
  useEffect(() => {
    const handleMouseMove: (e: MouseEvent) => void = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
        leftClicked: e.buttons === 1,
      });
    };

    // 전역 마우스 이벤트 등록
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const timeRef = useRef(0);
  const updateXrayMask = (
    mouseX: number,
    mouseY: number,
    buttonClicked: boolean,
  ) => {
    if (!xrayLayerRef.current) return;

    // performance.now(): 페이지 로딩 시점부터 지금까지의 시간
    const sec = performance.now() * 0.001;
    const clicked = buttonClicked ? 1 : 0;
    timeRef.current = gsap.utils.clamp(
      0,
      120,
      clicked ? timeRef.current + 1 : timeRef.current - 1,
    );

    const jitterX = Math.sin(sec * 4.2) * 3 * clicked;
    const jitterY = Math.cos(sec * 3.8) * 2 * clicked;
    const radiusNoise = Math.sin(sec * 5.1) * 8 * clicked;

    const baseRadius = timeRef.current;
    const currentRadius = baseRadius + radiusNoise;

    // 표면에 구멍 뚫기 (마우스 위치에 투명 구멍)
    gsap.set(xrayLayerRef.current, {
      maskImage: `radial-gradient(circle at ${mouseX + jitterX}px ${mouseY + jitterY}px, 
                transparent ${currentRadius * 0.6}px,           /* 구멍 (투명) */
                rgba(0,0,0,0.3) ${currentRadius * 0.8}px,       /* 부드러운 가장자리 */
                black ${currentRadius}px)` /* 표면 (불투명) */,
      webkitMaskImage: `radial-gradient(circle at ${mouseX + jitterX}px ${mouseY + jitterY}px, 
                     transparent ${currentRadius * 0.6}px,
                     rgba(0,0,0,0.3) ${currentRadius * 0.8}px,
                     black ${currentRadius}px)`,
      filter: `
      contrast(1.1)
      brightness(1.05)
    `,
    });
  };

  // ------ 일러스트 조작 로직 ------

  // 기본 IDLE 애니메이션
  useEffect(() => {
    const ctx = gsap.context((self) => {
      gsap.to(".ANIM_ALL", {
        y: -30,
        duration: 3,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      });

      // 손목 회전 애니메이션 (독립적)
      gsap.to(".ANIM_HAND", {
        rotation: -5,
        transformOrigin: "100% 25%",
        duration: 4,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      });

      // 머리카락 애니메이션
      gsap.to(".ANIM_ROAR_HAIR", {
        rotation: -20,
        transformOrigin: "50% 0%",
        delay: 1,
        duration: 4,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, idleRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // 일러스트 크기조절 함수
  const ILLUSTRATION_WIDTH = 1400;
  const ILLUSTRATION_HEIGHT = 920;
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScale = () => {
      const scaleX = innerWidth / ILLUSTRATION_WIDTH;
      const scaleY = innerHeight / ILLUSTRATION_HEIGHT;

      const scale = Math.min(scaleX, scaleY);

      gsap.to(".ANIM_ALL", {
        scaleX: scale,
        scaleY: scale,
        transformOrigin: "top center",
      });
    };

    handleScale();

    window.addEventListener("resize", handleScale);

    return () => {
      window.removeEventListener("resize", handleScale);
    };
  }, []);

  // --------- 패럴렉스 업데이트 함수 ---------

  const updateParallax = (mouseX: number, mouseY: number) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // 마우스 위치를 중심점 기준 상대 좌표로 변환
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    // 1. 손 + 손목 + 캐릭터 패럴랙스
    const handParallaxX =
      deltaX * PARALLAX_CONFIG.HAND_WRIST_CHARACTER.mouseInfluence;
    const handParallaxY =
      deltaY * PARALLAX_CONFIG.HAND_WRIST_CHARACTER.mouseInfluence;

    gsap.to(".ANIM_CONTAINER", {
      x: handParallaxX,
      y: handParallaxY,
      duration: PARALLAX_CONFIG.HAND_WRIST_CHARACTER.smoothness,
      ease: "power2.out",
    });

    // 2. 배경 파티클 패럴랙스
    backgroundParticlesRef.current.forEach((particle) => {
      const particleParallaxX =
        deltaX * PARALLAX_CONFIG.BACKGROUND_PARTICLES.mouseInfluence;
      const particleParallaxY =
        deltaY * PARALLAX_CONFIG.BACKGROUND_PARTICLES.mouseInfluence;

      gsap.to(particle.element, {
        x: particle.baseX + particleParallaxX,
        y: particle.baseY + particleParallaxY,
        duration: PARALLAX_CONFIG.BACKGROUND_PARTICLES.smoothness,
        ease: "power2.out",
      });
    });

    // 3. 전경 파티클 패럴랙스
    foregroundParticlesRef.current.forEach((particle) => {
      const particleParallaxX =
        deltaX * PARALLAX_CONFIG.FOREGROUND_PARTICLES.mouseInfluence;
      const particleParallaxY =
        deltaY * PARALLAX_CONFIG.FOREGROUND_PARTICLES.mouseInfluence;

      gsap.to(particle.element, {
        x: particle.baseX + particleParallaxX,
        y: particle.baseY + particleParallaxY,
        duration: PARALLAX_CONFIG.FOREGROUND_PARTICLES.smoothness,
        ease: "power2.out",
      });
    });
  };

  // 마우스 위치 변경 시 패럴랙스 업데이트
  useEffect(() => {
    updateParallax(mousePosition.x, mousePosition.y);
  }, [mousePosition]);

  // 4. 실시간 애니메이션 루프 추가
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      updateXrayMask(
        mousePosition.x,
        mousePosition.y,
        mousePosition.leftClicked,
      );
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [mousePosition]);

  return (
    <div
      ref={idleRef}
      className={cn("fixed left-0 top-0 h-screen w-screen select-none")}
    >
      {/* SVG 필터 추가 - 반드시 먼저 렌더링 */}
      <TurbulenceFilter />
      <CustomCursor
        targetRef={idleRef}
        cursorSpec={{
          width: 32,
          height: 32,
          delay: 0.1,
          imageUrl: "/magnifier-cursor.svg",
        }}
        isFollowerExist={false}
        mousePosition={mousePosition}
      />

      {/* 파티클 */}
      <div ref={totalParticlesRef} className="fixed z-30 h-screen w-screen" />

      {/* 전체 씬 (이면) */}
      <div className="fixed left-0 top-0 z-20 h-screen w-screen">
        {/* 이면 배경 */}
        <div
          className="absolute h-screen w-screen"
          style={{
            backgroundImage: `url(${cloud.src})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            filter: "invert(1)",
          }}
        />

        {/* 이면 콘텐츠 */}
        <div className="ANIM_CONTAINER absolute left-0 top-0 z-10 flex h-screen w-screen justify-center">
          <div
            className="ANIM_ALL absolute -top-10 h-fit w-fit"
            style={{
              width: ILLUSTRATION_WIDTH,
              height: ILLUSTRATION_HEIGHT,
            }}
          >
            <Image
              src={WristInner}
              alt="Wrist"
              width={716 / 2}
              height={440 / 2}
              className="absolute right-0 top-0"
              draggable={false}
            />

            {/* 손과 캐릭터 (손목 제외) */}
            <div className="ANIM_HAND absolute right-[300px] top-0 h-[894px] w-[1003px] will-change-transform">
              <Image
                src={HandInner}
                alt="Hand"
                width={2006 / 2}
                height={1788 / 2}
                className="absolute -top-[2px] right-0"
                draggable={false}
              />

              {/* 캐릭터만 */}
              <div className="ANIM_CHARACTER absolute -left-[64px] bottom-[144px] h-[312.5px] w-[174.5px] will-change-transform">
                <CharacterInnerAnimation />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전체 씬 (표면) */}
      <div
        ref={xrayLayerRef}
        className="fixed left-0 top-0 z-20 h-screen w-screen"
        style={{
          // 초기에는 구멍 없음 (완전히 덮음)
          maskImage: "radial-gradient(circle at 50% 50%, black 100%)",
        }}
      >
        {/* 표면 배경 */}
        <div className="absolute left-0 top-0 h-screen w-screen bg-gradient-to-tl from-red-700 to-red-900 will-change-transform" />

        {/* 표면 콘텐츠 */}
        <div className="ANIM_CONTAINER absolute left-0 top-0 z-10 flex h-screen w-screen justify-center">
          <div
            className="ANIM_ALL absolute -top-10 mx-auto h-fit w-fit"
            style={{
              width: ILLUSTRATION_WIDTH,
              height: ILLUSTRATION_HEIGHT,
            }}
          >
            <Image
              src={Wrist}
              alt="Wrist"
              width={716 / 2}
              height={440 / 2}
              className="absolute right-0 top-0"
            />
            손과 캐릭터 (손목 제외)
            <div className="ANIM_HAND absolute right-[300px] top-0 h-[894px] w-[1003px] will-change-transform">
              {/* <div className="absolute left-0 top-0 h-1/4 w-full bg-blue-500" /> */}
              <Image
                src={Hand}
                alt="Hand"
                width={2006 / 2}
                height={1788 / 2}
                className="absolute -top-[2px] right-0"
              />

              {/* 캐릭터만 */}
              <div className="ANIM_CHARACTER absolute -left-[64px] bottom-[144px] h-[312.5px] w-[174.5px] will-change-transform">
                <Image
                  src={RoarHair}
                  alt="RoarHair"
                  width={69 / 2}
                  height={67 / 2}
                  className="ANIM_ROAR_HAIR absolute left-[24px] top-[48px] will-change-transform"
                />
                <Image
                  src={Character}
                  alt="Character"
                  width={349 / 2}
                  height={625 / 2}
                  className="absolute left-0 top-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CharacterInnerAnimation() {
  const [visibleNumber, setVisibleNumber] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleNumber((prev) => (prev + 1) % 3);
    }, 800);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Image
        src={CharacterInner1}
        alt="Character"
        width={349 / 2}
        height={625 / 2}
        className={cn(
          "absolute left-0 top-0 opacity-0",
          visibleNumber === 0 && "opacity-100",
        )}
        draggable={false}
      />
      <Image
        src={CharacterInner2}
        alt="Character"
        width={349 / 2}
        height={625 / 2}
        className={cn(
          "absolute left-0 top-0 opacity-0",
          visibleNumber === 1 && "opacity-100",
        )}
        draggable={false}
      />
      <Image
        src={CharacterInner3}
        alt="Character"
        width={349 / 2}
        height={625 / 2}
        className={cn(
          "absolute left-0 top-0 opacity-0",
          visibleNumber === 2 && "opacity-100",
        )}
        draggable={false}
      />
    </>
  );
}

const TurbulenceFilter = () => (
  <svg className="absolute h-0 w-0">
    <defs>
      <filter
        id="turbulence-displacement"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
      >
        {/* 기본 노이즈 생성 */}
        <feTurbulence
          baseFrequency="0.02 0.03"
          numOctaves="4"
          result="turbulence"
          seed="1"
          type="fractalNoise"
        />

        {/* 노이즈 강도 조절 */}
        <feDisplacementMap
          in="SourceGraphic"
          in2="turbulence"
          scale="15"
          result="displaced"
        />

        {/* 색상 분산 효과 */}
        <feOffset in="displaced" dx="2" dy="0" result="red" />
        <feOffset in="displaced" dx="-2" dy="0" result="blue" />
        <feBlend in="red" in2="blue" mode="screen" result="chromatic" />

        {/* 최종 합성 */}
        <feComposite in="chromatic" in2="displaced" operator="multiply" />
      </filter>

      {/* 더 강한 왜곡 효과 */}
      <filter
        id="heavy-displacement"
        x="-100%"
        y="-100%"
        width="300%"
        height="300%"
      >
        <feTurbulence
          baseFrequency="0.05 0.08"
          numOctaves="6"
          result="heavyNoise"
          seed="2"
          type="turbulence"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="heavyNoise"
          scale="25"
          result="heavyDisplaced"
        />
        <feGaussianBlur in="heavyDisplaced" stdDeviation="1" />
      </filter>

      {/* 애니메이션용 필터 */}
      <filter id="animated-turbulence">
        <feTurbulence
          baseFrequency="0.03 0.04"
          numOctaves="3"
          result="animNoise"
          seed="3"
        >
          <animate
            attributeName="baseFrequency"
            values="0.03 0.04;0.05 0.06;0.03 0.04"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="seed"
            values="3;7;3"
            dur="2s"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="animNoise" scale="20" />
      </filter>
    </defs>
  </svg>
);
