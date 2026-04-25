import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        purple: "#7c5cfc",
        "pink-ai": "#f43f8f",
        "cyan-ai": "#22d4fd",
        "orange-ai": "#ff6b35",
        bg2: "#0f0f1a",
        bg3: "#141428",
        "border-ai": "rgba(255,255,255,0.08)",
      },
      borderRadius: {
        pill: "100px",
        card: "20px",
      },
      boxShadow: {
        "glow-purple": "0 0 40px rgba(124,92,252,0.4)",
        "glow-pink": "0 0 40px rgba(244,63,143,0.3)",
        card: "0 40px 80px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.3)", opacity: "1" },
        },
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        gradFlow: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "gradient-flow": "gradient-flow 6s ease infinite",
        float: "float 4s ease-in-out infinite",
        gradFlow: "gradFlow 5s ease infinite",
      },
    },
  },
};

export default config;
