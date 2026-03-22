import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        sand: "#f4efe7",
        clay: "#b86f52",
        mist: "#d8e0e8",
        sage: "#6f8b7a"
      },
      boxShadow: {
        panel: "0 12px 32px rgba(23, 32, 51, 0.08)",
        phone: "0 18px 50px rgba(10, 20, 35, 0.18)"
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
