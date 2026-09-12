import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161A20",
        paper: "#F6F7F5",
        line: "#DDE1E6",
        accent: "#0F6E63",
        accentDark: "#0B4F47",
        flag: "#B4530A",
        danger: "#B3261E",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
