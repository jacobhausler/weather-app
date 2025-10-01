/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        // Entrance animations
        "fade-in-scale": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Loading animations
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(0.98)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.4)",
          },
          "50%": {
            opacity: "0.9",
            boxShadow: "0 0 20px 10px rgba(59, 130, 246, 0.2)",
          },
        },
        "skeleton-wave": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // Weather-specific animations
        "float-cloud": {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "25%": { transform: "translateX(5px) translateY(-3px)" },
          "50%": { transform: "translateX(0) translateY(-5px)" },
          "75%": { transform: "translateX(-5px) translateY(-3px)" },
        },
        "sun-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            filter: "brightness(1) drop-shadow(0 0 5px rgba(251, 191, 36, 0.3))",
          },
          "50%": {
            transform: "scale(1.05)",
            filter: "brightness(1.1) drop-shadow(0 0 15px rgba(251, 191, 36, 0.5))",
          },
        },
        "rain-drop": {
          "0%": { transform: "translateY(-10px)", opacity: "1" },
          "100%": { transform: "translateY(20px)", opacity: "0" },
        },
        "snow-fall": {
          "0%": { transform: "translateY(-10px) translateX(0)", opacity: "1" },
          "100%": { transform: "translateY(20px) translateX(5px)", opacity: "0" },
        },
        "wind-sway": {
          "0%, 100%": { transform: "rotate(0deg) translateX(0)" },
          "25%": { transform: "rotate(2deg) translateX(2px)" },
          "75%": { transform: "rotate(-2deg) translateX(-2px)" },
        },
        lightning: {
          "0%, 50%, 100%": { opacity: "0", filter: "brightness(1)" },
          "25%": { opacity: "1", filter: "brightness(1.5)" },
        },
        "temp-rise": {
          "0%": { transform: "translateY(5px)" },
          "50%": { transform: "translateY(-3px)", color: "rgb(239, 68, 68)" },
          "100%": { transform: "translateY(0)" },
        },
        "temp-fall": {
          "0%": { transform: "translateY(-5px)" },
          "50%": { transform: "translateY(3px)", color: "rgb(59, 130, 246)" },
          "100%": { transform: "translateY(0)" },
        },
        // Data update animations
        "highlight-flash": {
          "0%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(59, 130, 246, 0.15)" },
          "100%": { backgroundColor: "transparent" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.9)" },
          "50%": { opacity: "1", transform: "translateY(-2px) scale(1.05)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "card-flip": {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)", opacity: "0.5" },
          "100%": { transform: "rotateY(0deg)" },
        },
        ripple: {
          "0%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.4)" },
          "100%": { boxShadow: "0 0 0 20px rgba(59, 130, 246, 0)" },
        },
        // Micro-interactions
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        "expand-center": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "progress-fill": {
          "0%": { transform: "scaleX(0)", transformOrigin: "left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "left" },
        },
        "notification-slide": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "badge-pop": {
          "0%": { transform: "scale(0)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "stagger-fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Entrance animations
        "fade-in-scale": "fade-in-scale 0.4s ease-out forwards",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in-down": "fade-in-down 0.5s ease-out forwards",
        "fade-in-left": "fade-in-left 0.5s ease-out forwards",
        "fade-in-right": "fade-in-right 0.5s ease-out forwards",
        "slide-in-up": "slide-in-up 0.6s ease-out forwards",
        // Loading animations
        shimmer: "shimmer 2s infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "skeleton-wave": "skeleton-wave 2s infinite",
        spin: "spin 1s linear infinite",
        bounce: "bounce 1s ease-in-out infinite",
        // Weather-specific animations
        "float-cloud": "float-cloud 6s ease-in-out infinite",
        "sun-pulse": "sun-pulse 3s ease-in-out infinite",
        "rain-drop": "rain-drop 1s linear infinite",
        "snow-fall": "snow-fall 3s linear infinite",
        "wind-sway": "wind-sway 2s ease-in-out infinite",
        lightning: "lightning 4s ease-in-out infinite",
        "temp-rise": "temp-rise 0.8s ease-out forwards",
        "temp-fall": "temp-fall 0.8s ease-out forwards",
        // Data update animations
        "highlight-flash": "highlight-flash 0.8s ease-out forwards",
        "count-up": "count-up 0.6s ease-out forwards",
        "card-flip": "card-flip 0.6s ease-in-out forwards",
        ripple: "ripple 0.6s ease-out forwards",
        // Micro-interactions
        wiggle: "wiggle 0.5s ease-in-out",
        shake: "shake 0.5s ease-in-out",
        "expand-center": "expand-center 0.3s ease-out forwards",
        "progress-fill": "progress-fill 1s ease-out forwards",
        "notification-slide": "notification-slide 0.4s ease-out forwards",
        "badge-pop": "badge-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        "stagger-fade-in": "stagger-fade-in 0.5s ease-out forwards",
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      transitionDuration: {
        "2000": "2000ms",
        "3000": "3000ms",
      },
      animationDelay: {
        "75": "75ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
        "500": "500ms",
        "700": "700ms",
        "1000": "1000ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}