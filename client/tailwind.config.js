/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F5EE',
          100: '#D7E5D0',
          200: '#B3CEA6',
          300: '#8EAE7C',
          400: '#4C7A3D',
          500: '#3D6830',
          600: '#2F5B24',
          700: '#24491C',
          800: '#1D3B16',
          900: '#12240D',
          950: '#0C1808',
        },
        accent: {
          50: '#FBF0EA',
          100: '#F2D3C0',
          200: '#E6AB8A',
          300: '#D88354',
          400: '#C9682F',
          500: '#B45A26',
          600: '#A34F1F',
          700: '#873F19',
          800: '#6E3414',
          900: '#4B220B',
          950: '#2D1407',
        },
        neutral: {
          50: '#FAF8F5',
          100: '#EFEAE2',
          200: '#DFD7CB',
          300: '#C4B9A7',
          400: '#948B7D',
          500: '#786F62',
          600: '#5C5548',
          700: '#453E34',
          800: '#352F27',
          900: '#2B271F',
          950: '#181511',
        },
        status: {
          success: '#2F5B24',
          warning: '#B8862B',
          danger: '#A3341F',
        },
        darkSurface: {
          base: '#121611',
          surface: '#181E16',
          card: '#1F271D',
          hover: '#263124',
          border: '#2F3C2C',
          borderSubtle: '#232E20',
          muted: '#8B9E87',
          input: '#161D15',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'btn': '8px',
      }
    },
  },
  plugins: [],
}