/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  important: true,
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
        mono: ["Fira Code", "monospace"],
      },
      colors: {
        // Tokyo Night color palette
        tokyo: {
          night: {
            bg: "#1a1b26",
            bg2: "#16161e",
            bg3: "#2d334d",
            fg: "#a9b1d6",
            fg2: "#c0caf5",
            fg3: "#d4d6e0",
            comment: "#565f89",
            selection: "#33467c",
            blue: "#7aa2f7",
            cyan: "#7dcfff",
            green: "#9ece6a",
            yellow: "#e0af68",
            red: "#f7768e",
            purple: "#bb9af7",
            orange: "#ff9e64",
            magenta: "#bb9af7",
          },
          storm: {
            bg: "#24283b",
            bg2: "#1f2335",
            bg3: "#1a1b26",
            fg: "#c0caf5",
            fg2: "#a9b1d6",
            fg3: "#9aa5ce",
            comment: "#565f89",
            selection: "#3b4261",
            blue: "#7aa2f7",
            cyan: "#7dcfff",
            green: "#9ece6a",
            magenta: "#bb9af7",
            orange: "#ff9e64",
            red: "#f7768e",
            yellow: "#e0af68",
          },
        },
      },
      backgroundColor: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        tertiary: "var(--bg-tertiary)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
      },
      borderColor: {
        primary: "var(--border-primary)",
        secondary: "var(--border-secondary)",
      },
      boxShadow: {
        tokyo:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "tokyo-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      transitionProperty: {
        all: "all",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
