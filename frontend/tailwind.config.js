import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        full: "50px",
      },
      colors: {
        /* ==========================================
           MAIN COLORS
           ========================================== */
        background: "hsl(var(--background))",
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          muted: "hsl(var(--foreground-muted))",
          subtle: "hsl(var(--foreground-subtle))",
        },

        /* Surfaces */
        surface: {
          base: "hsl(var(--surface-base))", // Replaces bg-16181d
          deeper: "hsl(var(--surface-deeper))", // Replaces bg-0f1115
          hover: "hsl(var(--surface-hover))", // Replaces bg-1c1f26
          elevated: "hsl(var(--surface-elevated))",
          modal: "hsl(var(--surface-modal))", // Replaces bg-13151a
          accent: "hsl(var(--surface-accent))", // Replaces bg-1e293b
        },

        /* shadcn/ui semantic colors (compatibility) */
        card: {
          DEFAULT: "hsl(var(--surface-elevated))", // Alias to surface
          foreground: "hsl(var(--foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--surface-elevated))",
          foreground: "hsl(var(--foreground))",
        },

        /* Primary */
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))", // New: consistent hover
          dark: "#b81f14", // Kept for compatibility
        },

        /* Neutral (replaces secondary/muted/accent) */
        neutral: {
          DEFAULT: "hsl(var(--neutral))",
          foreground: "hsl(var(--neutral-foreground))",
        },

        /* Keep secondary/muted/accent for temporary compatibility */
        secondary: {
          DEFAULT: "hsl(var(--neutral))", // Alias to neutral
          foreground: "hsl(var(--neutral-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--neutral))",
          foreground: "hsl(var(--foreground-muted))",
        },
        accent: {
          DEFAULT: "hsl(var(--neutral))",
          foreground: "hsl(var(--foreground))",
        },

        /* Destructive */
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          hover: "hsl(var(--destructive-hover))",
        },

        /* Additional semantic colors */
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",

        /* Utilities */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* Charts */
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },

        // Tokens for badges (replaces #2c2e33 and #36383d)
        "badge-neutral": "hsl(var(--badge-neutral))",
        "badge-neutral-hover": "hsl(var(--badge-neutral-hover))",

        /* ==========================================
           OPACITIES (replaces white5, black20, etc.)
           ========================================== */
        "white-subtle": "rgb(255 255 255 / var(--opacity-subtle))", // Replaces white5
        "white-light": "rgb(255 255 255 / var(--opacity-light))", // Replaces white10
        "white-medium": "rgb(255 255 255 / var(--opacity-medium))", // Replaces white20

        "black-light": "rgb(0 0 0 / var(--opacity-light))",
        "black-medium": "rgb(0 0 0 / var(--opacity-medium))", // Replaces black20
        "black-strong": "rgb(0 0 0 / var(--opacity-strong))", // Replaces black40
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 6px 30px rgba(0, 0, 0, 0.35)",
        hero: "0 20px 60px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [animate],
};
