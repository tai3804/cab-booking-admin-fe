/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Light palette — clean white surfaces
        surface: {
          base: '#FFFFFF',
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
          active: '#FFFEFA',
        },
        // Sky blue accent
        accent: {
          primary: '#0EA5E9',
          hover: '#38BDF8',
          glow: 'rgba(14, 165, 233, 0.18)',
          muted: 'rgba(14, 165, 233, 0.10)',
        },
        // Subtle borders
        border: {
          light: 'rgba(15, 23, 42, 0.08)',
          medium: 'rgba(15, 23, 42, 0.14)',
          active: 'rgba(14, 165, 233, 0.45)',
        },
        // Text hierarchy
        text: {
          primary: '#111827',
          secondary: '#4B5563',
          muted: '#9CA3AF',
        },
        // Refined status colors — muted jewel tones
        status: {
          success: '#50C878',
          'success-bg': 'rgba(80, 200, 120, 0.08)',
          warning: '#0EA5E9',
          'warning-bg': 'rgba(14, 165, 233, 0.10)',
          danger: '#8B2635',
          'danger-bg': 'rgba(139, 38, 53, 0.08)',
          info: '#4A90D9',
          'info-bg': 'rgba(74, 144, 217, 0.08)',
        },
      },
      boxShadow: {
        // Soft shadows for light theme
        'card': '0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 2px 6px rgba(15, 23, 42, 0.10), 0 16px 32px rgba(15, 23, 42, 0.12)',
        'accent': '0 2px 8px rgba(14, 165, 233, 0.20)',
        'accent-hover': '0 4px 16px rgba(56, 189, 248, 0.28)',
        'inner-soft': 'inset 0 1px 2px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '18px',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'scale-up': 'scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleUp: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
