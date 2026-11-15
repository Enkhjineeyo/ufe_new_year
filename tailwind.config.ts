import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#08090D",
        ink: "#11141B",
        silver: "#C7CCD5",
        electric: "#536DFF",
      },
      fontFamily: {
        display: ["'Unbounded Variable'", "system-ui", "sans-serif"],
        sans: ["'Manrope Variable'", "system-ui", "sans-serif"],
      },
      keyframes: {
        sway: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        glow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.9" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.25" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        sway: "sway 7s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
        glow: "glow 6s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
