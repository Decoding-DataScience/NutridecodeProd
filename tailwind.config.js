/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4FD1C5',
          DEFAULT: '#38B2AC',
          dark: '#2C7A7B'
        },
        secondary: {
          light: '#9AE6B4',
          DEFAULT: '#68D391',
          dark: '#48BB78'
        },
        accent: {
          light: '#FBD38D',
          DEFAULT: '#F6AD55',
          dark: '#ED8936'
        },
        background: {
          light: '#F7FAFC',
          DEFAULT: '#EDF2F7',
          dark: '#E2E8F0'
        },
        nutrition: {
          healthy: '#48BB78',
          moderate: '#F6AD55',
          warning: '#F56565'
        },
        neutral: {
          light: '#F5F6FA',
          dark: '#E8E8E8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      backdropBlur: {
        xs: '2px',
      },
      gradients: {
        'primary-gradient': 'linear-gradient(135deg, #4FD1C5 0%, #38B2AC 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #9AE6B4 0%, #68D391 100%)',
        'accent-gradient': 'linear-gradient(135deg, #FBD38D 0%, #F6AD55 100%)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-nutrition': 'linear-gradient(135deg, #4FD1C5 0%, #68D391 100%)'
      }
    },
  },
  plugins: [],
};