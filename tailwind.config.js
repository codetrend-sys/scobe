export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
   theme: {
    extend: {
      colors: {
        scobe: {
          blue: {
            DEFAULT: '#1F5FA8',
            dark: '#153E6F',
            light: '#4F8FD6',
          },
          green: {
            DEFAULT: '#6FBF4A',
            dark: '#4A8F32',
            light: '#EAF6E4',
          },
          red: {
            DEFAULT: '#E53935',
            dark: '#B71C1C',
          },
          gray: {
            light: '#F5F7FA',
            text: '#4A4A4A',
          },
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}
