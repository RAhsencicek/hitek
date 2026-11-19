import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hi: {
          brand: {
            DEFAULT: "#2563EB",
            dark: "#1E3A8A",
            hover: "#1D4ED8",
            light: "#3B82F6",
          },
          danger: {
            DEFAULT: "#DC2626",
            hover: "#B91C1C",
            dark: "#EF4444",
            surface: "#FEF2F2",
            surfaceDark: "#450A0A",
          },
          warning: {
            DEFAULT: "#D97706",
            dark: "#F59E0B",
            surface: "#FFFBEB",
            surfaceDark: "#451A03",
          },
          success: {
            DEFAULT: "#059669",
            dark: "#10B981",
            surface: "#ECFDF5",
            surfaceDark: "#022C22",
          },
          bay: {
            DEFAULT: "#0284C7",
            dark: "#38BDF8",
            surface: "#F0F9FF",
            surfaceDark: "#082F49",
          },
          plate: {
            blue: "#003399",
            border: "#1E293B",
          },
          bg: {
            light: "#F8FAFC",
            cardLight: "#FFFFFF",
            dark: "#0B0F19",
            cardDark: "#1E293B",
          },
        },
      },
      animation: {
        "fast-pulse": "pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slow-pulse": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      fontFamily: {
        plate: ["DIN 1451", "FE-Schrift", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      height: {
        "btn-56": "56px",
        "header-56": "56px",
        "action-72": "72px",
      },
      minHeight: {
        "btn-56": "56px",
      },
    },
  },
  plugins: [],
};

export default config;
