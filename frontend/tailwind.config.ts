import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14282A",
        paper: "#F4EFE3",
        ink: "#1E1B16",
        accent: "#E2A33B",
        "accent-deep": "#B97A1F",
        rule: "#D8CDB3",
        muted: "#8A7F68",
        "bg-text": "#CDEAE3",
        sage: "#5B7A57",
        rust: "#B5482F",
      },
      fontFamily: {
        serif: ["var(--font-plex-serif)"],
        sans: ["var(--font-plex-sans)"],
        mono: ["var(--font-plex-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;