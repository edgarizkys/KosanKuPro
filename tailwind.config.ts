import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orchid: {
          deep: "#0f0a14",
          dark: "#161020",
          surface: "#1e1528",
          card: "#241a30",
          border: "#2e2240",
          tint: "#D8BFD8",
          violet: "#8E6E95",
          gold: "#DAA520",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
