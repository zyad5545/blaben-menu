export default {
  content: [
    "./index.html",
    "./version-*.html",
    "./manage.html",
    "./staff-portal-blaben-73.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        blaben: {
          50: "#f4f9ff",
          100: "#e7f2ff",
          700: "#075bbb",
          850: "#073b8e",
          950: "#062a65",
        },
        cream: {
          50: "#fffdf8",
          100: "#fff8ed",
          200: "#ffefd4",
          300: "#ffe4b5",
        },
        gold: {
          400: "#d4a54a",
          500: "#c49536",
          600: "#a67c2e",
        },
      },
      boxShadow: {
        luxe: "0 24px 70px rgba(7, 43, 91, 0.18)",
        glass: "0 18px 46px rgba(0, 0, 0, 0.18)",
        warm: "0 20px 50px rgba(196, 149, 54, 0.12)",
      },
      fontFamily: {
        sans: ["Tahoma", "Arial", "sans-serif"],
      },
      keyframes: {
        introPop: {
          "0%": { opacity: "0", transform: "scale(.72) rotate(-8deg)", filter: "blur(10px)" },
          "42%": { opacity: "1", transform: "scale(1.06) rotate(2deg)", filter: "blur(0)" },
          "100%": { opacity: "1", transform: "scale(1)", filter: "blur(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(42px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatSoft: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        carouselIn: {
          "0%": { opacity: "0", transform: "scale(1.08)", filter: "blur(8px)" },
          "100%": { opacity: "1", transform: "scale(1)", filter: "blur(0)" },
        },
        carouselTextIn: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flipIn: {
          "0%": { transform: "rotateY(90deg)", opacity: "0" },
          "100%": { transform: "rotateY(0deg)", opacity: "1" },
        },
        tabSlide: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        staggerFade: {
          "0%": { opacity: "0", transform: "translateY(28px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        tiltHover: {
          "0%": { transform: "perspective(600px) rotateY(0deg)" },
          "50%": { transform: "perspective(600px) rotateY(4deg)" },
          "100%": { transform: "perspective(600px) rotateY(0deg)" },
        },
      },
      animation: {
        introPop: "introPop 2.35s cubic-bezier(.2,.8,.2,1) both",
        slideUp: "slideUp .72s cubic-bezier(.2,.8,.2,1) both",
        floatSoft: "floatSoft 4.8s ease-in-out infinite",
        carouselIn: "carouselIn 620ms cubic-bezier(.2,.8,.2,1) both",
        carouselTextIn: "carouselTextIn 520ms cubic-bezier(.2,.8,.2,1) 100ms both",
        flipIn: "flipIn 480ms cubic-bezier(.2,.8,.2,1) both",
        tabSlide: "tabSlide 300ms ease both",
        staggerFade: "staggerFade 520ms cubic-bezier(.2,.8,.2,1) both",
        tiltHover: "tiltHover 600ms ease both",
      },
    },
  },
  plugins: [],
};
