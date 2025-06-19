// tailwind.config.js
module.exports = {
  darkMode: 'class', // <-- Add this line here
  content: [
    './pages/**/*.{js,ts,jsx,tsx}', 
    './components/**/*.{js,ts,jsx,tsx}'
  ],
 
  theme: {
  extend: {
    fontFamily: {
      poppins: ['Poppins', 'sans-serif'],
    },
  },
},

  plugins: [],
};
// This configuration enables dark mode support in Tailwind CSS for the Next.js application.