import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0a0a0a",
          surface: "#141414",
          turquoise: "#3dd6c8",
          cream: "#f0ead8",
          muted: "#7a7a7a",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
