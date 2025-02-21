import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-green': '#7dff8a',
        'custom-dark': '#101010',
        'custom-light': '#fafafa',
      },
      borderRadius: {
        'lg': '0.25rem',
        'xl': '0.375rem'
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
} satisfies Config;
