/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // MATADOR dark grays
        'matador-dark': '#3C3C3C',
        'matador-darker': '#2D2D2D',
        'matador-sidebar': '#333333',
        'matador-header': '#3C3C3C',

        // MATADOR green (action buttons, table headers)
        'matador-green': '#7CB342',
        'matador-green-hover': '#689F38',
        'matador-green-light': '#AED581',

        // FSB cyan (betting lines panel)
        'fsb-cyan': '#29B6F6',
        'fsb-cyan-dark': '#0288D1',
        'fsb-cyan-light': '#81D4FA',

        // Backgrounds
        'bg-main': '#ECEFF1',
        'bg-card': '#FFFFFF',
        'bg-panel': '#F5F5F5',
        'bg-dark': '#455A64',
        'bg-dark-row': '#546E7A',
        'bg-dark-hover': '#607D8B',

        // Text
        'text-main': '#212121',
        'text-light': '#FFFFFF',
        'text-muted': '#757575',
        'text-cyan': '#29B6F6',

        // Borders
        'border-light': '#E0E0E0',
        'border-dark': '#37474F',

        // Accents
        'accent-green': '#7CB342',
        'accent-red': '#EF4444',
        'accent-amber': '#FFA726',
        'accent-blue': '#29B6F6',
        'accent-cyan': '#29B6F6',

        // Status
        'status-pending': '#FFA726',
        'status-winner': '#7CB342',
        'status-loser': '#EF4444',
        'status-paid': '#7CB342',
        'status-cancelled': '#9E9E9E',

        // Shadcn compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive) / <alpha-value>)", foreground: "hsl(var(--destructive-foreground) / <alpha-value>)" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
        'pin': '12px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        'header': '48px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'panel': '0 4px 12px rgba(0,0,0,0.1)',
        'modal': '0 25px 50px rgba(0,0,0,0.15)',
        'green': '0 4px 12px rgba(124,179,66,0.3)',
        'cyan': '0 4px 12px rgba(41,182,246,0.3)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        "pin-shake": {
          "0%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "shake": "shake 0.4s ease-in-out",
        "pin-shake": "pin-shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
