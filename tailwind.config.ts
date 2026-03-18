import type { Config } from 'tailwindcss';
const { heroui } = require('@heroui/react');
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/react/node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          bg: '#f3efee',
          surface: '#ebe5e8',
          primary: '#7f7396',
          secondary: '#89a8a2',
          accent: '#c692a4',
          text: '#3f3b4f',
          border: '#cbbfcf',
          soft: '#e6e1ea',
          laundry: '#d6b8a4',
          dressmaker: '#5e4335',
          preparation: '#5e4335',
          booking: '#c692a4',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: '#f3efee',
            foreground: '#3f3b4f',
            primary: {
              DEFAULT: '#7f7396',
              foreground: '#ffffff',
            },
            secondary: {
              DEFAULT: '#89a8a2',
              foreground: '#1f3c38',
            },
            warning: {
              DEFAULT: '#d6b8a4',
              foreground: '#5e4335',
            },
            danger: {
              DEFAULT: '#c692a4',
              foreground: '#4a2b35',
            },
          },
        },
      },
    }),
  ],
};
export default config;
