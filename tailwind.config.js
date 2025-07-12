 /** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{html,js}"],
   theme: {
     extend: {
      
  animation: {
    "gradient-x": "gradientX 5s ease infinite",
    "fade-in": "fadeIn 1s ease-in",
  },
  keyframes: {
    gradientX: {
      "0%, 100%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
    },
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
     },
   },
   plugins: [],
 }