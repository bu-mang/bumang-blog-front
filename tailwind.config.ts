import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"], // 다크 모드를 class 기반으로 설정
  theme: {
    extend: {
      screens: {
        tbl: "900px", // 기존 브레이크포인트에 추가
      },
      fontFamily: {
        sans: ["Wanted Sans Variable", "Wanted Sans", "sans-serif"],
      },
      fontSize: {
        "2xs": "0.6875rem",
      },
      borderRadius: {
        "3xs": "2px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      letterSpacing: {
        looser: "-0.02em",
        noSpacing: "0em",
      },
      spacing: {
        layout: "12px",
        header: "100px",
        "header-2": "88px",
        "header-margin": "40px",
      },
      colors: {
        gray: {
          "0": "#FFFFFF",
          "1": "#F8F8F8",
          "5": "#F2F2F2",
          "10": "#EDE5E5",
          "50": "#D9D9D9",
          "100": "#B4B4B4",
          "200": "#999999",
          "300": "#818181",
          "400": "#616161",
          "500": "#4D4D4D",
          "600": "#373737",
          "700": "#2C2C2C",
          "800": "#1D1D1D",
          "900": "#141414",
          "1000": "#121212",
        },
        blue: {
          light: "#3B82F6",
          DEFAULT: "#1D4ED8",
          dark: "#1E40AF",
        },
        red: {
          light: "#F87171",
          DEFAULT: "#EF4444",
          dark: "#B91C1C",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      animation: {
        arrow: "arrow 1s ease-out infinite",
        "arrow-back": "arrow-back 1s ease-out infinite",
        "slide-up": "slide-up 0.3s ease-in-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        wiggle: "wiggle 0.5s ease-in-out infinite alternate",
      },
      keyframes: {
        arrow: {
          "0%": {
            transform: "translateX(-50%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        "arrow-back": {
          "0%": {
            transform: "translateX(50%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        "slide-up": {
          "0%": {
            transform: "translateY(40px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0%)",
            opacity: "1",
          },
        },
        blink: {},
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        wiggle: {
          "0%": { transform: "rotate(-3deg) scale(1)" },
          "100%": { transform: "rotate(3deg) scale(1.1)" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@midudev/tailwind-animations"),
  ],
  safelist: ["pt-64"],
};
export default config;
